import React, { useState } from "react";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const AdminPanel = ({ videos, setVideos, fetchVideos }) => {
    const [newVideo, setNewVideo] = useState({ title: "", file: null });
    const [videoDuration, setVideoDuration] = useState(null);
    const [newVideoLevel, setNewVideoLevel] = useState("beginner");
    const [newPowerPoint, setNewPowerPoint] = useState(null);
    const [quizQuestions, setQuizQuestions] = useState([
        { question: "", options: ["", "", "", ""], answer: "" },
    ]);

    const [loading, setLoading] = useState(false);
    const levels = ["beginner", "intermediate", "advanced"];

    const groupedVideos = levels.reduce((groups, level) => {
        groups[level] = videos.filter((video) => video.level === level);
        return groups;
    }, {});

    const handleAddVideo = async () => {
        if (!newVideo.title || !newVideo.file) {
            alert("Title and video file are required");
            return;
        }

        if (
            quizQuestions.some(
                (q) => !q.question || q.options.some((o) => !o) || !q.answer
            )
        ) {
            alert("Please complete all quiz questions, options, and answers.");
            return;
        }

        const formData = new FormData();
        formData.append("title", newVideo.title);
        formData.append("video", newVideo.file);
        formData.append("position", videos.length + 1);
        formData.append("duration", videoDuration);
        formData.append("level", newVideoLevel);
        formData.append("quiz", JSON.stringify(quizQuestions));

        if (newPowerPoint) {
            formData.append("powerpoint", newPowerPoint);
        }

        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(
                `${process.env.REACT_APP_API_ENDPOINT}/courses/videos`,
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
                    level: newVideoLevel,
                },
            ]);
            setNewVideo({ title: "", file: null });
            setNewPowerPoint(null);
            setQuizQuestions([
                { question: "", options: ["", "", "", ""], answer: "" },
            ]);
            document.getElementById("file-input").value = "";
            document.getElementById("powerpoint-input").value = "";
        } catch (error) {
            console.error("Failed to add video:", error.message);
        } finally {
            setLoading(false); // Stop loading
        }
    };

    const handleQuizChange = (index, field, value) => {
        const updatedQuestions = [...quizQuestions];
        if (field === "question") {
            updatedQuestions[index].question = value;
        } else if (field.startsWith("option")) {
            const optionIndex = parseInt(field.replace("option", ""), 10);
            updatedQuestions[index].options[optionIndex] = value;
        } else if (field === "answer") {
            updatedQuestions[index].answer = value;
        }
        setQuizQuestions(updatedQuestions);
    };

    const addQuestion = () => {
        setQuizQuestions((prev) => [
            ...prev,
            { question: "", options: ["", "", "", ""], answer: "" },
        ]);
    };

    const removeQuestion = (index) => {
        setQuizQuestions((prev) => prev.filter((_, i) => i !== index));
    };

    const handleAddQuiz = async (videoId, quiz) => {
        try {
            const token = localStorage.getItem("token");
            await axios.post(
                `${process.env.REACT_APP_API_ENDPOINT}/quizzes`,
                { videoId, ...quiz },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Quiz added successfully!");
            setQuizDetails({
                videoId: "",
                title: "",
                questions: [
                    { question: "", options: ["", "", "", ""], answer: "" },
                ],
            });
            fetchVideos();
        } catch (error) {
            console.error("Failed to add quiz:", error.message);
        }
    };

    const handleRemoveQuiz = async (quizId) => {
        if (
            !window.confirm(
                "Are you sure you want to delete this quiz? This action cannot be undone."
            )
        ) {
            return;
        }

        try {
            const token = localStorage.getItem("token");
            await axios.delete(
                `${process.env.REACT_APP_API_ENDPOINT}/quizzes/${quizId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Quiz removed successfully!");
            fetchVideos(); // Update videos and quizzes after removal
        } catch (error) {
            console.error("Failed to remove quiz:", error.message);
        }
    };

    const handleRemoveVideo = async (videoId) => {
        if (
            !window.confirm(
                "Are you sure you want to delete this video? This action cannot be undone."
            )
        ) {
            return;
        }

        try {
            const token = localStorage.getItem("token");
            await axios.delete(
                `${process.env.REACT_APP_API_ENDPOINT}/courses/videos/${videoId}`,
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

        const { source, destination } = result;

        if (
            source.index === destination.index &&
            source.droppableId === destination.droppableId
        ) {
            return;
        }

        const updatedVideos = [...videos];

        // Optimistically update the UI
        const movedVideo = updatedVideos[source.index];
        updatedVideos.splice(source.index, 1);
        updatedVideos.splice(destination.index, 0, movedVideo);

        setVideos(updatedVideos);

        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(
                `${process.env.REACT_APP_API_ENDPOINT}/courses/videos/update-position`,
                {
                    positions: updatedVideos.map((video, index) => ({
                        id: video.id,
                        position: index + 1,
                        level: video.level,
                    })),
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setVideos(response.data.videos); // Use the response to ensure the final state is accurate
        } catch (error) {
            console.error("Failed to update video order:", error.message);
            alert("Failed to update video order. Refreshing...");
            fetchVideos(); // Reload videos from the API to ensure consistency
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
                <select
                    value={newVideoLevel}
                    onChange={(e) => setNewVideoLevel(e.target.value)}
                    required
                >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                </select>
                <input
                    type="file"
                    id="powerpoint-input"
                    accept=".pptx"
                    onChange={(e) => setNewPowerPoint(e.target.files[0])} // Handle PowerPoint upload
                />
                <h3>Quiz Questions</h3>
                {quizQuestions.map((question, index) => (
                    <div key={index} className="question-form">
                        <input
                            type="text"
                            placeholder={`Question ${index + 1}`}
                            value={question.question}
                            onChange={(e) =>
                                handleQuizChange(
                                    index,
                                    "question",
                                    e.target.value
                                )
                            }
                        />
                        {question.options.map((option, i) => (
                            <input
                                key={i}
                                type="text"
                                placeholder={`Option ${i + 1}`}
                                value={option}
                                onChange={(e) =>
                                    handleQuizChange(
                                        index,
                                        `option${i}`,
                                        e.target.value
                                    )
                                }
                            />
                        ))}
                        <input
                            type="text"
                            placeholder="Answer"
                            value={question.answer}
                            onChange={(e) =>
                                handleQuizChange(
                                    index,
                                    "answer",
                                    e.target.value
                                )
                            }
                        />
                        <button onClick={() => removeQuestion(index)}>
                            Remove
                        </button>
                    </div>
                ))}
                <button onClick={addQuestion}>Add Question</button>
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
                {levels.map((level) => (
                    <div key={level} className="video-section">
                        <h3>
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                        </h3>
                        <Droppable droppableId={level}>
                            {(provided) => (
                                <ul
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className="video-list"
                                >
                                    {groupedVideos[level].map(
                                        (video, index) => (
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
                                                        <span>
                                                            {video.title}
                                                        </span>
                                                        <button
                                                            onClick={() =>
                                                                handleRemoveVideo(
                                                                    video.id
                                                                )
                                                            }
                                                        >
                                                            Remove
                                                        </button>
                                                    </li>
                                                )}
                                            </Draggable>
                                        )
                                    )}
                                    {provided.placeholder}
                                </ul>
                            )}
                        </Droppable>
                    </div>
                ))}
            </DragDropContext>
        </div>
    );
};

export default AdminPanel;
