import React, { useState } from "react";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const AdminPanel = ({ videos, setVideos, fetchVideos }) => {
    const [quizzes, setQuizzes] = useState([]);
    const [questions, setQuestions] = useState([
        { question: "", options: ["", "", "", ""], answer: "", image: null },
    ]);
    const [selectedVideo, setSelectedVideo] = useState({
        id: null,
        name: null,
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
    const handleQuestionChange = (index, value) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index].question = value;
        setQuestions(updatedQuestions);
    };
    const handleOptionChange = (questionIndex, optionIndex, value) => {
        const updatedQuestions = [...questions];
        updatedQuestions[questionIndex].options[optionIndex] = value;
        setQuestions(updatedQuestions);
    };
    const handleAnswerChange = (index, value) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index].answer = value;
        setQuestions(updatedQuestions);
    };
    const addQuestion = () => {
        setQuestions([
            ...questions,
            { question: "", options: ["", "", "", ""], answer: "" },
        ]);
    };

    const removeQuestion = (index) => {
        const updatedQuestions = questions.filter((_, i) => i !== index);
        setQuestions(updatedQuestions);
    };

    const removeSubmittedQuestion = async (quizid) => {
        if (!quizid) {
            alert("Quiz not found");
            return;
        }

        const confirmRemoval = window.confirm(
            "Are you sure you want to remove the question? This action cannot be undone."
        );
        if (!confirmRemoval) {
            return;
        }

        try {
            const token = localStorage.getItem("token");
            await axios.delete(
                `${process.env.REACT_APP_API_ENDPOINT}/courses/quizzes/${quizid}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            const updatedQuizzes = quizzes.filter(
                (quiz) => quiz.quizid !== quizid
            );
            setQuizzes(updatedQuizzes);
        } catch (error) {
            console.error("Failed to remove quiz:", error.message);
        }
    };

    const handleImageUpload = async (file) => {
        const formData = new FormData();
        formData.append("image", file);

        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(
                `${process.env.REACT_APP_API_ENDPOINT}/courses/upload-image`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            return response.data.imageKey; // The URL of the uploaded image
        } catch (error) {
            console.error("Error uploading image:", error.message);
            return null;
        }
    };

    const submitQuiz = async () => {
        const incomplete = questions.some(
            (q) => !q.question || !q.answer || q.options.includes("")
        );
        if (incomplete)
            return alert("Please complete all fields before submitting!");

        for (const question of questions) {
            if (question.image) {
                question.image_url = await handleImageUpload(question.image);
            }
        }

        const payload = {
            videoId: selectedVideo.id,
            questions: questions.map(
                ({ question, options, answer, image_url }) => ({
                    question,
                    options,
                    answer,
                    image_url,
                })
            ),
        };

        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(
                `${process.env.REACT_APP_API_ENDPOINT}/courses/quizzes`,
                {
                    payload,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setQuizzes([...quizzes, ...response.data]); // Append new questions
            setQuestions([
                {
                    question: "",
                    options: ["", "", "", ""],
                    answer: "",
                    image: null,
                },
            ]);
            alert("Quiz added successfully!");
        } catch (error) {
            console.error("Failed to add quiz:", error.message);
        }
        // Replace this with your API call to submit the quiz
        alert("Quiz added successfully!");
        setQuestions([
            {
                question: "",
                options: ["", "", "", ""],
                answer: "",
                image: null,
            },
        ]);
        document.getElementById("image-input").value = "";
    };
    const fetchQuizzes = async (videoId, videoTitle) => {
        setSelectedVideo({ id: videoId, name: videoTitle });

        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `${process.env.REACT_APP_API_ENDPOINT}/courses/videos/${videoId}/quizzes`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            const fetchedQuizzes = response.data.map((quiz) => ({
                quizid: quiz.quizid,
                question: quiz.question,
                options: quiz.options,
                answer: quiz.answer,
            }));

            setQuizzes(fetchedQuizzes);
        } catch (error) {
            console.error("Failed to fetch quizzes:", error.message);
        }
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

    const handleImageChange = (index, file) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index].image = file;
        setQuestions(updatedQuestions);
    };

    const handleDragEnd = async (result) => {
        if (!result.destination) return;

        const { source, destination } = result;

        // Check if the drag happened across levels
        if (source.droppableId !== destination.droppableId) {
            const sourceLevel = source.droppableId;
            const destinationLevel = destination.droppableId;

            // Get the video being moved
            const sourceVideos = [...groupedVideos[sourceLevel]];
            const [movedVideo] = sourceVideos.splice(source.index, 1);

            // Update the video's level and append it to the destination level
            movedVideo.level = destinationLevel;
            const destinationVideos = [
                ...groupedVideos[destinationLevel],
                movedVideo,
            ];

            // Update the state of groupedVideos
            const updatedGroupedVideos = {
                ...groupedVideos,
                [sourceLevel]: sourceVideos,
                [destinationLevel]: destinationVideos,
            };

            // Flatten the updatedGroupedVideos into the main videos array
            const updatedVideos = Object.values(updatedGroupedVideos).flat();
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

                // Update the videos with the response from the server
                setVideos(response.data.videos);
            } catch (error) {
                console.error("Failed to update video order:", error.message);
                alert("Failed to update video order. Refreshing...");
                fetchVideos(); // Reload videos from the API to ensure consistency
            }

            return;
        }

        // If within the same level, reorder as usual
        const level = source.droppableId;
        const levelVideos = [...groupedVideos[level]];
        const [movedVideo] = levelVideos.splice(source.index, 1);
        levelVideos.splice(destination.index, 0, movedVideo);

        const updatedGroupedVideos = {
            ...groupedVideos,
            [level]: levelVideos,
        };

        const updatedVideos = Object.values(updatedGroupedVideos).flat();
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

            setVideos(response.data.videos);
        } catch (error) {
            console.error("Failed to update video order:", error.message);
            alert("Failed to update video order. Refreshing...");
            fetchVideos();
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
                                                        <div className="buttons">
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
                                                                            video.id,
                                                                            video.title
                                                                        ) // Call fetchQuizzes here
                                                                }
                                                                style={{
                                                                    backgroundColor:
                                                                        "purple",
                                                                }}
                                                            >
                                                                Manage Quizzes
                                                            </button>
                                                        </div>
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
            {selectedVideo.id && (
                <div className="quiz-management">
                    <h3>Quiz Management for {selectedVideo.name}</h3>

                    {quizzes.map((quiz) => (
                        <div
                            key={quiz.quizid}
                            style={{
                                border: "1px solid #ccc",
                                padding: "10px",
                                marginBottom: "10px",
                            }}
                        >
                            <p>
                                <strong>Question:</strong> {quiz.question}
                            </p>
                            <ul>
                                {quiz.options.map((option, index) => (
                                    <li key={index}>{option}</li>
                                ))}
                            </ul>
                            <p>
                                <strong>Answer:</strong> {quiz.answer}
                            </p>
                            <button
                                onClick={() =>
                                    removeSubmittedQuestion(quiz.quizid)
                                }
                                style={{
                                    backgroundColor: "red",
                                    color: "white",
                                    cursor: "pointer",
                                }}
                            >
                                Remove Question
                            </button>
                        </div>
                    ))}
                    <h2>Unsubmitted Quiz</h2>
                    <div style={{ margin: "20px" }}>
                        <h1>Add Quiz</h1>
                        {questions.map((q, index) => (
                            <div key={index} style={{ marginBottom: "20px" }}>
                                <label>
                                    Question {index + 1}:
                                    <input
                                        type="text"
                                        value={q.question}
                                        onChange={(e) =>
                                            handleQuestionChange(
                                                index,
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter question"
                                        style={{
                                            display: "block",
                                            margin: "10px 0",
                                            width: "300px",
                                        }}
                                    />
                                </label>
                                <label>
                                    Image (optional):
                                    <input
                                        type="file"
                                        id="image-input"
                                        accept="image/*"
                                        onChange={(e) =>
                                            handleImageChange(
                                                index,
                                                e.target.files[0]
                                            )
                                        }
                                        style={{
                                            display: "block",
                                            marginTop: "10px",
                                        }}
                                    />
                                </label>
                                <div>
                                    {q.options.map((option, optIndex) => (
                                        <div
                                            key={optIndex}
                                            style={{ marginBottom: "5px" }}
                                        >
                                            <label>
                                                Option {optIndex + 1}:
                                                <input
                                                    type="text"
                                                    value={option}
                                                    onChange={(e) =>
                                                        handleOptionChange(
                                                            index,
                                                            optIndex,
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder={`Option ${
                                                        optIndex + 1
                                                    }`}
                                                    style={{
                                                        width: "200px",
                                                        marginLeft: "10px",
                                                    }}
                                                />
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                <label>
                                    Answer:
                                    <input
                                        type="text"
                                        value={q.answer}
                                        onChange={(e) =>
                                            handleAnswerChange(
                                                index,
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter correct answer"
                                        style={{
                                            display: "block",
                                            margin: "10px 0",
                                            width: "200px",
                                        }}
                                    />
                                </label>
                                <button
                                    onClick={() => removeQuestion(index)}
                                    style={{
                                        marginTop: "10px",
                                        padding: "5px 10px",
                                        backgroundColor: "red",
                                        color: "white",
                                        border: "none",
                                        cursor: "pointer",
                                    }}
                                >
                                    Remove Question
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={addQuestion}
                            style={{ margin: "10px", padding: "10px 20px" }}
                        >
                            Add Another Question
                        </button>
                        <button
                            onClick={submitQuiz}
                            style={{ padding: "10px 20px" }}
                        >
                            Submit Quiz
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
