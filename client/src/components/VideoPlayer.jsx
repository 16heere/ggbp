import React, { useState } from "react";
const VideoPlayer = ({ video, onClose, onWatched }) => {
    const [isWatched, setIsWatched] = useState(false);

    const handleTimeUpdate = (event) => {
        const videoElement = event.target;
        const progress =
            (videoElement.currentTime / videoElement.duration) * 100;
        // Mark as watched and notify parent
        if (progress === 100 && !isWatched) {
            setIsWatched(true);
            onWatched(video.id, Math.floor(videoElement.duration));
        }
    };

    if (!video || !video.url) return null;

    return (
        <div className="video-modal">
            <div className="video-modal-content">
                <button className="close-button" onClick={onClose}>
                    ✖
                </button>
                <h2>{video.title}</h2>
                <video width="100%" controls onTimeUpdate={handleTimeUpdate}>
                    <source src={video.url} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div>
        </div>
    );
};

export default VideoPlayer;
