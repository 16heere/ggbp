import React, { useState } from "react";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const AdminPanel = ({ videos, setVideos, fetchVideos }) => {
    const [quizzes, setQuizzes] = useState([]);
    const [selectedVideoId, setSelectedVideoId] = useState(null);
    const [newQuizTitle, setNewQuizTitle] = useState("");
    const [newQuestion, setNewQuestion] = useState({
        question: "",
        options: [],
        answer: "",
    });
    const [newVideo, setNewVideo] = useState({ title: "", file: null });
    const [videoDuration, setVideoDuration] = useState(null);
    const [newVideoLevel, setNewVideoLevel] = useState("beginner");
    const [newPowerPoint, setNewPowerPoint] = useState(null);
    const [loading, setLoading] = useState(false);
    const levels = ["beginner", "intermediate", "advanced"];

    const groupedVideos = levels.reduce((groups, level) => {
        groups[level] = videos.filter((video) => video.level === level);
        return groups;
    }, {});

    const fetchQuizzes = async (videoId) => {
        setSelectedVideoId(videoId);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `${process.env.REACT_APP_API_ENDPOINT}/courses/videos/${videoId}/quizzes`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setQuizzes(response.data);
        } catch (error) {
            console.error("Failed to fetch quizzes:", error.message);
        }
    };

    // Add a new quiz
    const handleAddQuiz = async () => {
        if (!newQuizTitle || !selectedVideoId) {
            alert("Quiz title and video selection are required.");
            return;
        }
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(
                `${process.env.REACT_APP_API_ENDPOINT}/courses/quizzes`,
                { title: newQuizTitle, videoId: selectedVideoId },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setQuizzes([...quizzes, response.data]);
            setNewQuizTitle("");
        } catch (error) {
            console.error("Failed to add quiz:", error.message);
        }
    };

    // Remove a quiz
    const handleRemoveQuiz = async (quizId) => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(
                `${process.env.REACT_APP_API_ENDPOINT}/courses/quizzes/${quizId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setQuizzes(quizzes.filter((quiz) => quiz.id !== quizId));
        } catch (error) {
            console.error("Failed to remove quiz:", error.message);
        }
    };

    // Add a question to a quiz
    const handleAddQuestion = async (quizId) => {
        if (
            !newQuestion.question ||
            !newQuestion.options.length ||
            !newQuestion.answer
        ) {
            alert("Complete all fields for the question.");
            return;
        }
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(
                `${process.env.REACT_APP_API_ENDPOINT}/courses/quizzes/${quizId}/questions`,
                newQuestion,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setQuizzes(
                quizzes.map((quiz) =>
                    quiz.id === quizId
                        ? {
                              ...quiz,
                              questions: [...quiz.questions, response.data],
                          }
                        : quiz
                )
            );
            setNewQuestion({ question: "", options: [], answer: "" });
        } catch (error) {
            console.error("Failed to add question:", error.message);
        }
    };

    // Handle adding options to the question
    const addOption = () => {
        setNewQuestion((prev) => ({
            ...prev,
            options: [...prev.options, ""],
        }));
    };

    const updateOption = (index, value) => {
        const updatedOptions = [...newQuestion.options];
        updatedOptions[index] = value;
        setNewQuestion((prev) => ({ ...prev, options: updatedOptions }));
    };

    const removeOption = (index) => {
        const updatedOptions = newQuestion.options.filter(
            (_, i) => i !== index
        );
        setNewQuestion((prev) => ({ ...prev, options: updatedOptions }));
    };

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
        formData.append("level", newVideoLevel);

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
            document.getElementById("file-input").value = "";
            document.getElementById("powerpoint-input").value = "";
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
                                                        <button
                                                            onClick={
                                                                () =>
                                                                    fetchQuizzes(
                                                                        video.id
                                                                    ) // Call fetchQuizzes here
                                                            }
                                                        >
                                                            Manage Quizzes
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
            {selectedVideoId && (
                <div className="quiz-management">
                    <h3>Quiz Management for Selected Video</h3>

                    {/* Add New Quiz */}
                    <div className="add-quiz-form">
                        <input
                            type="text"
                            placeholder="Quiz Title"
                            value={newQuizTitle}
                            onChange={(e) => setNewQuizTitle(e.target.value)}
                            className="quiz-input"
                        />
                        <button
                            onClick={handleAddQuiz}
                            className="add-quiz-button"
                        >
                            Add Quiz
                        </button>
                    </div>

                    {/* Display Existing Quizzes */}
                    {quizzes.length > 0 ? (
                        <div className="quizzes-list">
                            <h4>Existing Quizzes</h4>
                            <ul>
                                {quizzes.map((quiz) => (
                                    <li key={quiz.id} className="quiz-item">
                                        <div className="quiz-header">
                                            <span>{quiz.title}</span>
                                            <button
                                                onClick={() =>
                                                    handleRemoveQuiz(quiz.id)
                                                }
                                                className="remove-quiz-button"
                                            >
                                                Remove Quiz
                                            </button>
                                        </div>

                                        {/* Add Question Form */}
                                        <div className="add-question-form">
                                            <input
                                                type="text"
                                                placeholder="Question"
                                                value={newQuestion.question}
                                                onChange={(e) =>
                                                    setNewQuestion((prev) => ({
                                                        ...prev,
                                                        question:
                                                            e.target.value,
                                                    }))
                                                }
                                                className="question-input"
                                            />
                                            {newQuestion.options.map(
                                                (option, index) => (
                                                    <div
                                                        key={index}
                                                        className="option-item"
                                                    >
                                                        <input
                                                            type="text"
                                                            placeholder={`Option ${
                                                                index + 1
                                                            }`}
                                                            value={option}
                                                            onChange={(e) =>
                                                                updateOption(
                                                                    index,
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            className="option-input"
                                                        />
                                                        <button
                                                            onClick={() =>
                                                                removeOption(
                                                                    index
                                                                )
                                                            }
                                                            className="remove-option-button"
                                                        >
                                                            X
                                                        </button>
                                                    </div>
                                                )
                                            )}
                                            <button
                                                onClick={addOption}
                                                className="add-option-button"
                                            >
                                                Add Option
                                            </button>
                                            <input
                                                type="text"
                                                placeholder="Correct Answer"
                                                value={newQuestion.answer}
                                                onChange={(e) =>
                                                    setNewQuestion((prev) => ({
                                                        ...prev,
                                                        answer: e.target.value,
                                                    }))
                                                }
                                                className="answer-input"
                                            />
                                            <button
                                                onClick={() =>
                                                    handleAddQuestion(quiz.id)
                                                }
                                                className="add-question-button"
                                            >
                                                Add Question
                                            </button>
                                        </div>

                                        {/* Display Questions for the Quiz */}
                                        <div className="questions-list">
                                            <h5>Questions</h5>
                                            {quiz.questions &&
                                            quiz.questions.length > 0 ? (
                                                <ul>
                                                    {quiz.questions.map(
                                                        (question) => (
                                                            <li
                                                                key={
                                                                    question.id
                                                                }
                                                                className="question-item"
                                                            >
                                                                <span>
                                                                    {
                                                                        question.question
                                                                    }
                                                                </span>
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            ) : (
                                                <p>No questions added yet.</p>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <p>No quizzes found for this video.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
