import React, { useState } from "react";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const AdminPanel = ({ videos, setVideos, fetchVideos }) => {
    const [quizzes, setQuizzes] = useState([]);
    const [questions, setQuestions] = useState([
        { question: "", options: ["", "", "", ""], answer: "" },
    ]);
    const [selectVideoName, setSelectedVideoName] = useState(null);
    const [selectedVideoId, setSelectedVideoId] = useState(null);
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

    const removeSubmittedQuestion = (quizIndex, questionIndex) => {
        console.log(quizIndex);
        const updatedQuizzes = [...quizzes];
        updatedQuizzes[quizIndex].questions.splice(questionIndex, 1);
        setQuizzes(updatedQuizzes);
    };

    const submitQuiz = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(
                `${process.env.REACT_APP_API_ENDPOINT}/courses/quizzes`,
                {
                    videoId: selectedVideoId,
                    questions: questions,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setQuestions(response.data);
            setQuizzes([...quizzes, response.data]);
        } catch (error) {
            console.error("Failed to add quiz:", error.message);
        }
        // Replace this with your API call to submit the quiz
        alert("Quiz added successfully!");
        setQuestions([{ question: "", options: ["", "", "", ""], answer: "" }]);
    };
    const fetchQuizzes = async (videoId, videoTitle) => {
        setSelectedVideoName(videoTitle);
        setSelectedVideoId(videoId);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `${process.env.REACT_APP_API_ENDPOINT}/courses/videos/${videoId}/quizzes`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            const groupedQuizzes = response.data.reduce((acc, item) => {
                const { quizId, ...question } = item;
                acc[quizId] = acc[quizId] || [];
                acc[quizId].push(question);
                return acc;
            }, {});

            console.log(groupedQuizzes);
            // Convert grouped quizzes to array format
            const quizArray = Object.entries(groupedQuizzes).map(
                ([quizId, questions]) => ({
                    quizId,
                    questions,
                })
            );

            console.log(quizArray);

            setQuizzes(quizArray);
        } catch (error) {
            console.error("Failed to fetch quizzes:", error.message);
        }
    };

    // Add a new quiz
    // const handleAddQuiz = async () => {
    //     if (!selectedVideoId) {
    //         alert("Quiz title and video selection are required.");
    //         return;
    //     }

    //     const sampleQuestions = [newQuestion]; // Assuming one question for simplicity
    //     try {
    //         const token = localStorage.getItem("token");
    //         const response = await axios.post(
    //             `${process.env.REACT_APP_API_ENDPOINT}/courses/quizzes`,
    //             {
    //                 videoId: selectedVideoId,
    //                 questions: sampleQuestions,
    //             },
    //             {
    //                 headers: { Authorization: `Bearer ${token}` },
    //             }
    //         );
    //         setQuizzes([...quizzes, response.data]);
    //         setNewQuestion({ question: "", options: [], answer: "" });
    //     } catch (error) {
    //         console.error("Failed to add quiz:", error.message);
    //     }
    // };

    // Remove a quiz
    // const handleRemoveQuiz = async (quizTitle) => {
    //     try {
    //         const token = localStorage.getItem("token");
    //         const quizToRemove = quizzes.find(
    //             (quiz) => quiz.title === quizTitle
    //         );
    //         const quizId = quizToRemove?.questions[0]?.id; // Use any question ID in the quiz group

    //         if (!quizId) {
    //             alert("Quiz not found");
    //             return;
    //         }

    //         await axios.delete(
    //             `${process.env.REACT_APP_API_ENDPOINT}/courses/quizzes/${quizId}`,
    //             {
    //                 headers: { Authorization: `Bearer ${token}` },
    //             }
    //         );
    //         setQuizzes(quizzes.filter((quiz) => quiz.title !== quizTitle));
    //     } catch (error) {
    //         console.error("Failed to remove quiz:", error.message);
    //     }
    // };

    // Add a question to a quiz
    // const handleAddQuestion = async (quizTitle) => {
    //     if (
    //         !newQuestion.question ||
    //         !newQuestion.options.length ||
    //         !newQuestion.answer
    //     ) {
    //         alert("Complete all fields for the question.");
    //         return;
    //     }

    //     try {
    //         const token = localStorage.getItem("token");
    //         const quiz = quizzes.find((q) => q.title === quizTitle);
    //         if (!quiz) {
    //             alert("Quiz not found.");
    //             return;
    //         }

    //         const response = await axios.post(
    //             `${process.env.REACT_APP_API_ENDPOINT}/courses/quizzes/${quiz.questions[0].id}/questions`,
    //             { ...newQuestion, videoId: selectedVideoId, title: quizTitle },
    //             {
    //                 headers: { Authorization: `Bearer ${token}` },
    //             }
    //         );

    //         // Add the new question to the local state
    //         setQuizzes(
    //             quizzes.map((q) =>
    //                 q.title === quizTitle
    //                     ? { ...q, questions: [...q.questions, response.data] }
    //                     : q
    //             )
    //         );
    //         setNewQuestion({ question: "", options: [], answer: "" });
    //     } catch (error) {
    //         console.error("Failed to add question:", error.message);
    //     }
    // };

    // Handle adding options to the question
    // const addOption = () => {
    //     setNewQuestion((prev) => ({
    //         ...prev,
    //         options: [...prev.options, ""],
    //     }));
    // };

    // const updateOption = (index, value) => {
    //     const updatedOptions = [...newQuestion.options];
    //     updatedOptions[index] = value;
    //     setNewQuestion((prev) => ({ ...prev, options: updatedOptions }));
    // };

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
                                                                        video.id,
                                                                        video.title
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
                    <h3>Quiz Management for {selectVideoName}</h3>
                    {quizzes.length > 0 && (
                        <div>
                            <h2>Submitted Quizzes</h2>
                            {quizzes.map((quiz, quizIndex) => (
                                <div
                                    key={quiz.quizVideoId}
                                    style={{ marginBottom: "30px" }}
                                >
                                    {console.log(quiz)}
                                    <h3>
                                        Quiz for Video ID: {selectedVideoId}
                                    </h3>
                                    {quiz.questions.map(
                                        (question, questionIndex) => (
                                            <div
                                                key={questionIndex}
                                                style={{
                                                    border: "1px solid #ccc",
                                                    padding: "10px",
                                                    marginBottom: "10px",
                                                }}
                                            >
                                                <p>
                                                    <strong>
                                                        Question{" "}
                                                        {questionIndex + 1}:
                                                    </strong>{" "}
                                                    {question.question}
                                                </p>
                                                <ul>
                                                    {question.options.map(
                                                        (
                                                            option,
                                                            optionIndex
                                                        ) => (
                                                            <li
                                                                key={
                                                                    optionIndex
                                                                }
                                                            >
                                                                {option}
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                                <p>
                                                    <strong>Answer:</strong>{" "}
                                                    {question.answer}
                                                </p>
                                                <button
                                                    onClick={() =>
                                                        removeSubmittedQuestion(
                                                            quizIndex,
                                                            questionIndex
                                                        )
                                                    }
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
                                        )
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                    <h2>Unsubmitted Quiz</h2>
                    <div style={{ margin: "20px" }}>
                        <h1>Add Quiz</h1>
                        {questions.map((q, index) => (
                            <div key={index} style={{ marginBottom: "20px" }}>
                                <label>Question {index + 1}:</label>
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
                                <div>
                                    {q.options.map((option, optionIndex) => (
                                        <div key={optionIndex}>
                                            <label>
                                                Option {optionIndex + 1}:
                                            </label>
                                            <input
                                                type="text"
                                                value={option}
                                                onChange={(e) =>
                                                    handleOptionChange(
                                                        index,
                                                        optionIndex,
                                                        e.target.value
                                                    )
                                                }
                                                placeholder={`Enter option ${
                                                    optionIndex + 1
                                                }`}
                                                style={{
                                                    margin: "5px 0",
                                                    width: "200px",
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <label>Answer:</label>
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
                            Add Quiz
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
