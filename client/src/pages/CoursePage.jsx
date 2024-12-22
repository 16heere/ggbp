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
    const [userAnswers, setUserAnswers] = useState([]);
    const [feedback, setFeedback] = useState([]);
    const [completed, setCompleted] = useState(false);
    const [scoreSent, setScoreSent] = useState(false);
    const [answeredQuestions, setAnsweredQuestions] = useState(0);
    const [videos, setVideos] = useState([]);
    const [quiz, setQuiz] = useState();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [sidebarRight, setSidebarRight] = useState(0);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const { user } = useContext(UserContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [score, setScore] = useState(null);

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

    useEffect(() => {
        if (selectedVideo) {
            fetchQuizForVideo(selectedVideo.id);
        }
    }, [selectedVideo]);

    const fetchQuizForVideo = async (videoId) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `${process.env.REACT_APP_API_ENDPOINT}/courses/videos/${videoId}/quizzes`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setQuiz(response.data);
        } catch (error) {
            console.error("Failed to fetch quiz:", error.message);
        }
    };

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
    useEffect(() => {
        if (!user || !selectedVideo) return;
        // Fetch the user's previous attempt for this quiz
        const fetchQuizAttempt = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(
                    `${process.env.REACT_APP_API_ENDPOINT}/courses/quiz-attempt/${selectedVideo.id}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                if (response.data) {
                    setScore(response.data.score);
                    setCompleted(true);
                }
            } catch (error) {
                if (error.response?.status === 404) {
                    console.log("No previous quiz attempt found.");
                } else {
                    console.error(
                        "Failed to fetch quiz attempt:",
                        error.message
                    );
                }
            }
        };

        fetchQuizAttempt();
    }, [quiz, user, selectedVideo]);

    const handleAnswerClick = (questionIndex, selectedOption) => {
        const updatedAnswers = [...userAnswers];
        updatedAnswers[questionIndex] = selectedOption;
        setUserAnswers(updatedAnswers);

        // Check if the selected option is correct
        const isCorrect = quiz[questionIndex].answer === selectedOption;
        const updatedFeedback = [...feedback];
        updatedFeedback[questionIndex] = isCorrect ? "Correct!" : "Incorrect!";
        setFeedback(updatedFeedback);

        // Allow the next question to be answered
        if (questionIndex === answeredQuestions) {
            setAnsweredQuestions(answeredQuestions + 1);
        }

        // Automatically send score when the last question is answered
        if (questionIndex === quiz.length - 1 && !scoreSent) {
            handleSendScore(updatedAnswers);
        }
    };

    const handleSendScore = async (answers) => {
        const calculatedScore = answers.reduce((score, answer, index) => {
            return answer === quiz[index].answer ? score + 1 : score;
        }, 0);

        const totalQuestions = quiz.length; // Assuming `quiz` is an array of questions

        try {
            const token = localStorage.getItem("token");
            await axios.post(
                `${process.env.REACT_APP_API_ENDPOINT}/courses/quiz-attempt`,
                {
                    userId: user.id, // Assuming you have user data
                    videoId: selectedVideo.id, // Assuming you know the video ID
                    score: calculatedScore,
                    totalQuestions,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            alert("Score saved successfully!");
            setCompleted(true);
            setScore(calculatedScore);
        } catch (error) {
            console.error("Failed to save score:", error.message);
        }
    };

    const handleResetQuiz = async () => {
        // Reset quiz in the database
        try {
            const token = localStorage.getItem("token");
            await axios.delete(
                `${process.env.REACT_APP_API_ENDPOINT}/courses/quiz-attempts/${selectedVideo.id}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setUserAnswers([]);
            setFeedback([]);
            setAnsweredQuestions(0);
            setScoreSent(false);
            setScore(null);
            setCompleted(false);
        } catch (error) {
            console.error("Failed to reset quiz:", error.message);
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
                {quiz && (
                    <div className="quiz-container">
                        {selectedVideo?.watched ? (
                            completed ? (
                                <div>
                                    <h4>Quiz Completed!</h4>
                                    <p>
                                        Your Score: {score}/{quiz.length}
                                    </p>
                                    <button
                                        onClick={() => {
                                            handleResetQuiz();
                                        }}
                                    >
                                        Reset Quiz
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <h3>Quiz</h3>
                                    <ul>
                                        {quiz.map((q, questionIndex) => (
                                            <li
                                                key={q.quizid}
                                                style={{
                                                    marginBottom: "20px",
                                                    padding: "10px",
                                                    border: "1px solid #ccc",
                                                    borderRadius: "5px",
                                                }}
                                            >
                                                <p>
                                                    <strong>
                                                        Question{" "}
                                                        {questionIndex + 1}:
                                                    </strong>{" "}
                                                    {q.question}
                                                </p>
                                                <div>
                                                    {q.options.map(
                                                        (option, idx) => (
                                                            <button
                                                                key={idx}
                                                                onClick={() =>
                                                                    handleAnswerClick(
                                                                        questionIndex,
                                                                        option
                                                                    )
                                                                }
                                                                disabled={
                                                                    questionIndex >
                                                                        answeredQuestions ||
                                                                    userAnswers[
                                                                        questionIndex
                                                                    ] !==
                                                                        undefined
                                                                }
                                                                style={{
                                                                    margin: "5px",
                                                                    padding:
                                                                        "10px 20px",
                                                                    backgroundColor:
                                                                        userAnswers[
                                                                            questionIndex
                                                                        ] ===
                                                                        option
                                                                            ? "#d3d3d3"
                                                                            : "#f0f0f0",
                                                                    border: "1px solid #ccc",
                                                                    cursor:
                                                                        questionIndex >
                                                                        answeredQuestions
                                                                            ? "not-allowed"
                                                                            : "pointer",
                                                                }}
                                                            >
                                                                {option}
                                                            </button>
                                                        )
                                                    )}
                                                </div>
                                                {feedback[questionIndex] && (
                                                    <p
                                                        style={{
                                                            color:
                                                                feedback[
                                                                    questionIndex
                                                                ] === "Correct!"
                                                                    ? "green"
                                                                    : "red",
                                                            marginTop: "10px",
                                                        }}
                                                    >
                                                        {
                                                            feedback[
                                                                questionIndex
                                                            ]
                                                        }
                                                    </p>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )
                        ) : (
                            <div>
                                <h3>Quiz Locked</h3>
                                <p>
                                    You need to watch the video first to unlock
                                    the quiz.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
            {/* Display the selected video on the page */}
        </div>
    );
};

export default CoursePage;
