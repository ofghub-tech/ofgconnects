// src/pages/HistoryPage.js
import React, { useState, useEffect, useMemo } from 'react';
import { databases } from '../appwriteConfig';
import { useAuth } from '../context/AuthContext';
import {
  DATABASE_ID,
  COLLECTION_ID_HISTORY,
  COLLECTION_ID_VIDEOS
} from '../appwriteConfig';
import { Query } from 'appwrite';
import VideoCard from '../components/VideoCard';
import HistoryShortsCard from '../components/HistoryShortsCard';
import { Link } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import './HistoryPage.css';

/* ---------------- HELPERS ---------------- */

const getRelativeDate = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const groupVideosByDate = (videos) => {
  if (!Array.isArray(videos)) return {};

  const grouped = videos.reduce((acc, video) => {
    const dateGroup = getRelativeDate(video.$createdAt);

    if (!acc[dateGroup]) {
      acc[dateGroup] = { shorts: [], videos: [], seen: new Set() };
    }

    if (acc[dateGroup].seen.has(video.$id)) return acc;
    acc[dateGroup].seen.add(video.$id);

    if (video.category === 'shorts') {
      acc[dateGroup].shorts.push(video);
    } else {
      acc[dateGroup].videos.push(video);
    }

    return acc;
  }, {});

  Object.keys(grouped).forEach(k => delete grouped[k].seen);

  return grouped;
};

/* ---------------- COMPONENT ---------------- */

const HistoryPage = () => {
  const { user } = useAuth();

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [lastId, setLastId] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const ITEMS_PER_PAGE = 50;
  const { ref, inView } = useInView({ threshold: 0.1 });

  const grouped = useMemo(() => groupVideosByDate(list), [list]);

  /* -------- FETCH -------- */

  const fetchVideoDetails = async (docs) => {
    const ids = docs
      .map(d => d.videoId || (d.video ? d.video.$id : null))
      .filter(Boolean);

    const unique = [...new Set(ids)];
    if (!unique.length) return [];

    const res = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID_VIDEOS,
      [Query.equal('$id', unique), Query.limit(100)]
    );

    const map = new Map(res.documents.map(v => [v.$id, v]));

    return docs.map(h => {
      const id = h.videoId || (h.video ? h.video.$id : null);
      const v = map.get(id);
      if (!v) return null;

      return { ...v, $createdAt: h.$createdAt };
    }).filter(Boolean);
  };

  const fetchHistory = async (loadMore = false) => {
    if (!user) return;

    loadMore ? setLoadingMore(true) : setLoading(true);

    try {
      let queries = [
        Query.equal('userId', user.$id),
        Query.orderDesc('$createdAt'),
        Query.limit(ITEMS_PER_PAGE)
      ];

      if (loadMore && lastId) {
        queries.push(Query.cursorAfter(lastId));
      }

      const res = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID_HISTORY,
        queries
      );

      const videos = await fetchVideoDetails(res.documents);

      setList(prev => loadMore ? [...prev, ...videos] : videos);

      setHasMore(res.documents.length === ITEMS_PER_PAGE);
      if (res.documents.length) {
        setLastId(res.documents[res.documents.length - 1].$id);
      }

    } catch (e) {
      setError("Failed to load history");
    }

    setLoading(false);
    setLoadingMore(false);
  };

  useEffect(() => {
    setList([]);
    setLastId(null);
    fetchHistory(false);
  }, [user]);

  useEffect(() => {
    if (inView && hasMore && !loading && !loadingMore) {
      fetchHistory(true);
    }
  }, [inView]);

  /* -------- UI -------- */

  if (loading && !list.length) {
    return (
      <div className="center">
        <div className="loader"></div>
      </div>
    );
  }

  if (error && !list.length) {
    return <div className="center error">{error}</div>;
  }

  return (
    <div className="history-page">
      <div className="container">

        <h1 className="title">Watch History</h1>

        {!Object.keys(grouped).length ? (
          <div className="empty">
            <p>No history yet</p>
            <Link to="/" className="btn">Start Watching</Link>
          </div>
        ) : (

          Object.entries(grouped).map(([date, data]) => (
            <section key={date} className="section">

              <h2 className="date">{date}</h2>

              {/* SHORTS */}
              {data.shorts.length > 0 && (
                <>
                  <div className="short-header">
                    Shorts <span>{data.shorts.length}</span>
                  </div>

                  <div className="short-row">
                    {data.shorts.map((v, i) => (
                      <div key={i} className="short-card">
                        <HistoryShortsCard video={v} />
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* VIDEOS */}
              {data.videos.length > 0 && (
                <div className="grid">
                  {data.videos.map((v, i) => (
                    <div key={i} className="card">
                      <VideoCard video={v} />
                    </div>
                  ))}
                </div>
              )}

            </section>
          ))
        )}

        {hasMore && (
          <div ref={ref} className="center">
            {loadingMore && <div className="loader small"></div>}
          </div>
        )}

        {!hasMore && list.length > 0 && (
          <p className="end">End of history</p>
        )}

      </div>
    </div>
  );
};

export default HistoryPage;