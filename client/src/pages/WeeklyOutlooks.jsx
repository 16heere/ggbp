import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/WeeklyOutlooks.css";
import { FaCheckCircle, FaEye } from "react-icons/fa";

const WeeklyOutlooks = () => {
    const [videos, setVideos] = useState([]);
    const [isWatched, setIsWatched] = useState(false);

    const onVideoWatched = async (videoId, videoDuration) => {
        try {
            await axios.post(
                `${process.env.REACT_APP_API_ENDPOINT}/courses/videos/watched`,
                { videoId, videoDuration },
                {
                    withCredentials: true,
                }
            );
            setVideos((prevVideos) =>
                prevVideos.map((video) =>
                    video.id === videoId ? { ...video, watched: true } : video
                )
            );
        } catch (error) {
            console.error("Failed to update watched seconds:", error.message);
        }
    };

    useEffect(() => {
        const fetchWeeklyOutlooks = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_ENDPOINT}/courses/weekly-outlooks`,
                    { withCredentials: true }
                );
                console.log(response.data);
                setVideos(response.data);
            } catch (error) {
                console.error("Error fetching weekly outlooks:", error.message);
            }
        };

        fetchWeeklyOutlooks();
    }, []);

    const handleTimeUpdate = (event, id) => {
        const videoElement = event.target;
        const progress =
            (videoElement.currentTime / videoElement.duration) * 100;

        if (progress === 100 && !isWatched) {
            setIsWatched(true);
            onVideoWatched(id, Math.floor(videoElement.duration));
        }
    };

    return (
        <div className="weekly-outlooks-page">
            <h1>Weekly Outlooks</h1>
            <div className="video-grid">
                {videos.map((video) => (
                    <div key={video.id} className="video-card">
                        <video
                            controls
                            className="video-player"
                            src={`${video.s3_key}`}
                            onTimeUpdate={(e) => handleTimeUpdate(e, video.id)}
                        />

                        <p className="video-date">
                            {video.title}
                            {video.watched ? (
                                <FaCheckCircle color="green" size={25} />
                            ) : (
                                <FaEye color="purple" size={25} />
                            )}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WeeklyOutlooks;
