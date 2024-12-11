import React, { useState } from "react";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const AdminPanel = ({ videos, setVideos }) => {
    const [newVideo, setNewVideo] = useState({ title: "", file: null });
    const [videoDuration, setVideoDuration] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleAddVideo = async () => {
        if (!newVideo.title || !newVideo.file) {
            alert("Title and video file are required");
            return;
        }

        const formData = new FormData();
        formData.append("title", newVideo.title);
        formData.append("video", newVideo.file);
        formData.append("position", videos.length + 1);
        formData.append("duration", videoDuration);

        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(
                "http://localhost:5000/api/courses/videos",
                formData,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            const addedVideo = response.data;
            setVideos((prev) => [
                ...prev,
                {
                    id: addedVideo.id,
                    title: addedVideo.title,
                    position: addedVideo.position,
                    videoData: addedVideo.videoData,
                    duration: videoDuration,
                },
            ]);
            setNewVideo({ title: "", file: null });
            document.getElementById("file-input").value = "";
        } catch (error) {
            console.error("Failed to add video:", error.message);
        } finally {
            setLoading(false); // Stop loading
        }
    };

    const handleRemoveVideo = async (videoId) => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(
                `http://localhost:5000/api/courses/videos/${videoId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setVideos(videos.filter((video) => video.id !== videoId)); // Remove locally
            alert("Video removed successfully!");
        } catch (error) {
            console.error("Failed to remove video:", error.message);
        }
    };

    const handleDragEnd = async (result) => {
        if (!result.destination) return;

        const reorderedVideos = Array.from(videos);
        const [movedVideo] = reorderedVideos.splice(result.source.index, 1);
        reorderedVideos.splice(result.destination.index, 0, movedVideo);

        // Update positions locally
        const updatedPositions = reorderedVideos.map((video, index) => ({
            id: video.id,
            position: index + 1,
        }));
        setVideos(reorderedVideos);

        try {
            const token = localStorage.getItem("token");
            await axios.post(
                "http://localhost:5000/api/courses/videos/update-position",
                { positions: updatedPositions },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (error) {
            console.error("Failed to update video order:", error.message);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];

        if (file && file.type === "video/mp4") {
            const reader = new FileReader();

            reader.onload = (e) => {
                const arrayBuffer = e.target.result;
                const blob = new Blob([arrayBuffer], { type: file.type });

                // Use a video element in memory
                const video = document.createElement("video");
                video.preload = "metadata";

                video.onloadedmetadata = () => {
                    URL.revokeObjectURL(video.src); // Free up memory
                    setVideoDuration(Math.floor(video.duration)); // Set duration in state
                };

                video.onerror = () => {
                    console.error("Error loading video metadata.");
                };

                video.src = URL.createObjectURL(blob); // Create temporary URL for the video blob
            };
            reader.onerror = () => {
                console.error("Error reading file.");
            };

            reader.readAsArrayBuffer(file);
        } else {
            console.error("Please upload a valid MP4 file.");
        }
        setNewVideo({ ...newVideo, file: e.target.files[0] });
    };

    return (
        <div className="admin-panel">
            <h2 className="admin-panel-title">Admin Panel</h2>
            <div className="add-video-form">
                <input
                    type="text"
                    placeholder="Video Title"
                    value={newVideo.title}
                    onChange={(e) =>
                        setNewVideo({ ...newVideo, title: e.target.value })
                    }
                    className="add-video-input"
                />
                <input
                    type="file"
                    id="file-input"
                    accept="video/mp4"
                    onChange={handleFileChange}
                    className="add-video-input"
                />
                <button
                    onClick={handleAddVideo}
                    className="add-video-button"
                    disabled={loading} // Disable button during upload
                >
                    {loading ? "Uploading..." : "Add Video"}
                </button>
            </div>
            {loading && <div className="loading-spinner"></div>}
            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="video-list">
                    {(provided) => (
                        <ul
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="video-list"
                        >
                            {videos.map((video, index) => (
                                <Draggable
                                    key={video.id}
                                    draggableId={`${video.id}`}
                                    index={index}
                                >
                                    {(provided) => (
                                        <li
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className="video-list-item"
                                        >
                                            <span className="video-title">
                                                {video.title}
                                            </span>
                                            <button
                                                onClick={() =>
                                                    handleRemoveVideo(video.id)
                                                }
                                                className="remove-video-button"
                                            >
                                                Remove
                                            </button>
                                        </li>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </ul>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    );
};

export default AdminPanel;
