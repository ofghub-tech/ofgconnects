// src/components/Avatar.js
import React, { useState, useEffect } from 'react';

const Avatar = ({ url, name, size = 'md', className = '' }) => {
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        setImageError(false);
    }, [url]);

    // Added 'xs' for Shorts cards
    const sizeClasses = {
        xs: 'w-6 h-6 text-[10px]',        // 24px (Shorts Card Overlay)
        sm: 'w-8 h-8 text-xs',            // 32px (Video Card / Top Bar)
        md: 'w-10 h-10 text-sm',          // 40px (Standard / Comments)
        lg: 'w-[90px] h-[90px] text-4xl', // 90px (My Space Header)
        xl: 'w-[120px] h-[120px] text-5xl' // 120px (Settings Page)
    };

    // Default to 'md' if size is invalid
    const sizeClass = sizeClasses[size] || sizeClasses.md;

    const baseClass = `rounded-full flex items-center justify-center overflow-hidden bg-gray-800 flex-shrink-0 ${sizeClass} ${className}`;

    // 1. Show Image if available and not broken
    if (url && !imageError) {
        return (
            <div className={baseClass}>
                <img 
                    src={url} 
                    alt={name || 'User'} 
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)} 
                />
            </div>
        );
    }

    // 2. Fallback: Show First Letter
    const initial = name ? name.charAt(0).toUpperCase() : 'U';
    
    return (
        <div className={baseClass}>
            <span className="font-bold text-white select-none">
                {initial}
            </span>
        </div>
    );
};

export default Avatar;