// src/components/AdBanner.js
import React, { useEffect } from 'react';

const AdBanner = ({ 
    slotId = "8358319749", // Replace with your default Ad Slot ID
    format = "auto", 
    className = "" 
}) => {

    useEffect(() => {
        try {
            // This pushes the ad request to Google's script
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error("AdSense Error:", e);
        }
    }, []);

    return (
        // The container handles the spacing and gray background placeholder
        <div className={`w-full my-6 flex justify-center items-center bg-gray-800/30 border border-white/5 rounded-xl overflow-hidden min-h-[100px] ${className}`}>
            
            {/* The AdSense Tag */}
            <ins className="adsbygoogle"
                style={{ display: 'block', width: '100%' }}
                data-ad-client="ca-pub-1608316244906634"
                data-ad-slot={slotId}
                data-ad-format={format}
                data-full-width-responsive="true"
            />
            
            {/* Optional: Text to show it's an ad space (useful for dev) */}
            <span className="text-xs text-gray-600 absolute pointer-events-none">
                Advertisement
            </span>
        </div>
    );
};

export default AdBanner;