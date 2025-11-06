// src/pages/MigrationPage.js
import React, { useState } from 'react';
import { databases, DATABASE_ID, COLLECTION_ID_VIDEOS } from '../appwriteConfig';

const MigrationPage = () => {
    const [status, setStatus] = useState('Ready to migrate');
    const [processing, setProcessing] = useState(false);

    const runMigration = async () => {
        setProcessing(true);
        setStatus('Starting migration... fetching documents...');

        try {
            // 1. Fetch all videos (up to 100 for this test run)
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID_VIDEOS,
                [
                     // Fetch plenty to be sure we get them all
                     // If you have > 100, we'd need pagination, but let's start here.
                     require('appwrite').Query.limit(100)
                ]
            );

            const docs = response.documents;
            setStatus(`Found ${docs.length} documents. Starting update...`);

            let updatedCount = 0;

            for (const doc of docs) {
                // Check if 'tags' is currently an Array (the old, broken format)
                if (Array.isArray(doc.tags)) {
                    // Convert ["tag1", "tag2"] -> "tag1, tag2"
                    const newTagsString = doc.tags.join(', ');

                    await databases.updateDocument(
                        DATABASE_ID,
                        COLLECTION_ID_VIDEOS,
                        doc.$id,
                        {
                            tags: newTagsString
                        }
                    );
                    updatedCount++;
                    setStatus(`Updated video: ${doc.title}...`);
                }
            }

            setStatus(`MIGRATION COMPLETE! Successfully updated ${updatedCount} videos.`);

        } catch (error) {
            console.error("Migration failed:", error);
            setStatus(`ERROR: ${error.message}`);
        }
        setProcessing(false);
    };

    return (
        <div className="p-10 flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <h1 className="text-3xl font-bold mb-6 text-red-600">Admin Migration Tool</h1>
            <p className="mb-8 text-gray-700 dark:text-gray-300 max-w-md text-center">
                This tool will convert all old "Array" tags into "String" tags so the search index works.
                Only run this once.
            </p>

            <div className="p-4 bg-white dark:bg-gray-800 rounded shadow mb-6 w-full max-w-md text-center">
                <p className="font-mono text-sm dark:text-green-400">{status}</p>
            </div>

            <button
                onClick={runMigration}
                disabled={processing}
                className="px-6 py-3 bg-red-600 text-white font-bold rounded hover:bg-red-700 disabled:opacity-50"
            >
                {processing ? 'Migrating Data...' : 'RUN MIGRATION NOW'}
            </button>
        </div>
    );
};

export default MigrationPage;