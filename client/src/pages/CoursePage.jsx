import React, { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CourseProgress from "../components/CourseProgress";
import VideoPlayer from "../components/VideoPlayer";
import { UserContext } from "../context/userContext";
import AdminPanel from "./AdminPanel";
import { FaAngleRight, FaBars } from "react-icons/fa";

const CoursePage = () => {
    const [progress, setProgress] = useState(0);
    const [videos, setVideos] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [sidebarRight, setSidebarRight] = useState(0);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const { user } = useContext(UserContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    const openVideo = useCallback(
        async (video) => {
            if (!video) return;
            if (selectedVideo?.id === video.id) {
                setSelectedVideo({
                    ...video,
                    url: selectedVideo.url,
                    powerpointUrl: selectedVideo.powerpointUrl,
                });
                return;
            }
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(
                    `${process.env.REACT_APP_API_ENDPOINT}/courses/videos/${video.id}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                setSelectedVideo({
                    ...video,
                    url: response.data.url,
                    powerpointUrl: response.data.powerpointUrl,
                });
            } catch (error) {
                console.error("Failed to load video:", error.message);
            }
        },
        [selectedVideo]
    );

    const fetchVideos = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `${process.env.REACT_APP_API_ENDPOINT}/courses/videos`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setVideos(response.data);
            if (!selectedVideo && response.data.length > 0) {
                openVideo(response.data[0]);
            }
        } catch (error) {
            console.error("Failed to fetch videos:", error.message);
        }
    }, [selectedVideo, openVideo]);

    useEffect(() => {
        const adjustSidebarPosition = () => {
            const container = document.querySelector(".container");
            if (container) {
                const containerStyle = window.getComputedStyle(container);
                const marginRight = parseFloat(containerStyle.marginRight) || 0;
                setSidebarRight(marginRight);
            }
        };

        adjustSidebarPosition();
        window.addEventListener("resize", adjustSidebarPosition);

        return () =>
            window.removeEventListener("resize", adjustSidebarPosition);
    }, []);

    useEffect(() => {
        console.log("Selected video updated:", selectedVideo);
    }, [selectedVideo]);

    useEffect(() => {
        if (user !== null && user !== undefined) {
            setLoading(false);
            if (!user.isSubscribed) {
                navigate("/");
            }
        }
    }, [user, navigate]);

    useEffect(() => {
        if (!loading) {
            fetchVideos();
            fetchProgress();
        }
    }, [loading, fetchVideos]);

    const fetchProgress = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `${process.env.REACT_APP_API_ENDPOINT}/courses/user-progress`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setProgress(() => response.data.progress);
        } catch (error) {
            console.error("Failed to fetch progress:", error.message);
        }
    };

    const onVideoWatched = async (videoId, videoDuration) => {
        try {
            const token = localStorage.getItem("token");
            await axios.post(
                `${process.env.REACT_APP_API_ENDPOINT}/courses/videos/watched`,
                { videoId, videoDuration },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setVideos((prevVideos) =>
                prevVideos.map((video) =>
                    video.id === videoId ? { ...video, watched: true } : video
                )
            );
            fetchProgress();
        } catch (error) {
            console.error("Failed to update watched seconds:", error.message);
        }
    };

    const unsubscribe = async () => {
        const confirmUnsubscribe = window.confirm(
            "Are you sure you want to unsubscribe? This action cannot be undone."
        );
        if (!confirmUnsubscribe) {
            return;
        }
        try {
            const token = localStorage.getItem("token");
            await axios.post(
                `${process.env.REACT_APP_API_ENDPOINT}/courses/unsubscribe`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            alert("You have successfully unsubscribed.");
            navigate("/");
        } catch (error) {
            console.error("Failed to unsubscribe:", error.message);
        }
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    const groupedVideos = videos.reduce((groups, video) => {
        if (!groups[video.level]) {
            groups[video.level] = [];
        }
        groups[video.level].push(video);
        return groups;
    }, {});

    return (
        <div className="course-page">
            {user?.isAdmin && (
                <AdminPanel
                    videos={videos}
                    setVideos={setVideos}
                    fetchVideos={fetchVideos}
                />
            )}
            <div
                className={`sidebar ${sidebarOpen ? "" : "closed"}`}
                style={{ right: `calc(-${sidebarRight}px - 20px)` }}
            >
                <FaAngleRight
                    size={30}
                    className="sidebar-toggle-icon fa-angle-right"
                    color="purple"
                    onClick={() => setSidebarOpen(false)}
                />
                <div className="video-list">
                    <CourseProgress progress={progress} />
                    {Object.entries(groupedVideos).map(
                        ([level, levelVideos]) => (
                            <div key={level} className="level-section">
                                <details className="level-dropdown">
                                    <summary className="level-summary">
                                        {level.charAt(0).toUpperCase() +
                                            level.slice(1)}
                                    </summary>
                                    <ul className="video-list">
                                        {levelVideos.map((video) => (
                                            <li
                                                key={video.id}
                                                className={`video-item ${
                                                    selectedVideo?.id ===
                                                    video.id
                                                        ? "active"
                                                        : ""
                                                } ${
                                                    video.watched
                                                        ? "watched"
                                                        : ""
                                                }`}
                                                onClick={() => openVideo(video)}
                                            >
                                                {video.title}
                                            </li>
                                        ))}
                                    </ul>
                                </details>
                            </div>
                        )
                    )}
                    {user?.isSubscribed && !user?.isAdmin && (
                        <p className="unsubscribe-link" onClick={unsubscribe}>
                            Unsubscribe
                        </p>
                    )}
                </div>
            </div>

            {/* Sidebar Toggle Button */}
            {!sidebarOpen && (
                <div className="fa-bars-container">
                    <FaBars
                        size={30}
                        className="sidebar-toggle-icon fa-bars"
                        color="purple"
                        onClick={() => setSidebarOpen(true)}
                    />
                </div>
            )}
            <div className={`video-container ${sidebarOpen ? "" : "expanded"}`}>
                {selectedVideo && (
                    <div>
                        <VideoPlayer
                            video={selectedVideo}
                            onWatched={onVideoWatched}
                        />
                        {selectedVideo.powerpointUrl && (
                            <a
                                href={selectedVideo.powerpointUrl}
                                download
                                className="download-powerpoint-button"
                            >
                                Download PowerPoint
                            </a>
                        )}
                    </div>
                )}
            </div>
            {/* Display the selected video on the page */}
        </div>
    );
};

export default CoursePage;
