import React, { useState } from "react";

const VideoPlayer = ({ video, onWatched }) => {
    const [isWatched, setIsWatched] = useState(false);

    const handleTimeUpdate = (event) => {
        const videoElement = event.target;
        const progress =
            (videoElement.currentTime / videoElement.duration) * 100;
        // Mark as watched and notify parent
        if (progress >= 90 && !isWatched) {
            setIsWatched(true);
            onWatched(video.id, Math.floor(videoElement.duration));
        }
    };

    if (!video || !video.url) return null;

    return (
        <div className="video-player">
            <h2>{video.title}</h2>
            <video
                key={video.url}
                width="100%"
                controls
                onTimeUpdate={handleTimeUpdate}
            >
                <source src={video.url} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
        </div>
    );
};

export default React.memo(VideoPlayer, (prevProps, nextProps) => {
    return (
        prevProps.video.id === nextProps.video.id &&
        prevProps.video.url === nextProps.video.url
    );
});
