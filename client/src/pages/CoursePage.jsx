import React, { useState, useEffect, useContext } from "react";
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
    const [selectedVideo, setSelectedVideo] = useState(null);
    const { user } = useContext(UserContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user !== null && user !== undefined) {
            setLoading(false);
            if (!user.isSubscribed) {
                navigate("/"); // Redirect if not subscribed
            }
        }
    }, [user, navigate]);

    useEffect(() => {
        if (!loading) {
            fetchVideos();
            fetchProgress();
        }
    }, [loading]);

    const fetchVideos = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `${process.env.REACT_APP_API_ENDPOINT}/courses/videos`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setVideos(response.data);
        } catch (error) {
            console.error("Failed to fetch videos:", error.message);
        }
    };
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

    const openVideo = async (video) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `${process.env.REACT_APP_API_ENDPOINT}/courses/videos/${video.id}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setSelectedVideo({ ...video, url: response.data.url });
        } catch (error) {
            console.error("Failed to load video:", error.message);
        }
    };

    const closeVideo = () => setSelectedVideo(null);

    const unsubscribe = async () => {
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

    return (
        <div className="course-page">
            <h1>Course Content</h1>
            {user?.isAdmin && (
                <AdminPanel videos={videos} setVideos={setVideos} />
            )}
            <div className={`sidebar ${sidebarOpen ? "" : "closed"}`}>
                <FaAngleRight
                    size={30}
                    className="sidebar-toggle-icon fa-angle-right"
                    color="#007bff"
                    onClick={() => setSidebarOpen(false)}
                />

                <div className="video-list">
                    <CourseProgress progress={progress} />
                    <ul>
                        {videos.map((video) => (
                            <li
                                key={video.id}
                                className={`video-item ${
                                    selectedVideo?.id === video.id
                                        ? "active"
                                        : ""
                                }`}
                                onClick={() => openVideo(video)}
                            >
                                {video.title}
                            </li>
                        ))}
                    </ul>
                    {user?.isSubscribed && !user?.isAdmin && (
                        <p className="unsubscribe-link" onClick={unsubscribe}>
                            Unsubscribe
                        </p>
                    )}
                </div>
            </div>

            {/* Sidebar Toggle Button */}
            {!sidebarOpen && (
                <FaBars
                    size={30}
                    className="sidebar-toggle-icon fa-bars"
                    color="#007bff"
                    onClick={() => setSidebarOpen(true)}
                />
            )}

            {selectedVideo && (
                <VideoPlayer
                    video={selectedVideo}
                    onClose={closeVideo}
                    onWatched={onVideoWatched}
                />
            )}
        </div>
    );
};

export default CoursePage;
