import React, { useContext, useState } from "react";
import { Route, Routes, Link, useNavigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SubscriptionPage from "./pages/SubscriptionPage";
import CoursePage from "./pages/CoursePage";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import {
    FaLinkedin,
    FaInstagram,
    FaTwitter,
    FaTiktok,
    FaBars,
} from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import { UserContext } from "./context/userContext";
import ResubscribePage from "./pages/ResubscribePage";
import ResearchPage from "./pages/ResearchPage";
import ArticlePage from "./pages/ArticlePage";
import TermsAndConditions from "./pages/TermsAndConditions";
import WeeklyOutlooks from "./pages/WeeklyOutlooks";
import ScrollToTop from "./components/ScrollToTop";

const App = () => {
    const { user, logout } = useContext(UserContext);
    const navigate = useNavigate();
    const [navSidebarOpen, setNavSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setNavSidebarOpen(!navSidebarOpen);
    };

    return (
        <div className="content-container">
            <header className="navbar">
                <h1>
                    <Link to="/">
                        <img src="/assets/ggbp LOGO white wide.png" alt="" />
                    </Link>
                </h1>
                <button className="hamburger" onClick={toggleSidebar}>
                    <FaBars />
                </button>
                <nav>
                    <button
                        className="research-btn"
                        onClick={() => navigate("/")}
                    >
                        Home
                    </button>
                    <button
                        className="research-btn"
                        onClick={() => navigate("/research")}
                    >
                        Research
                    </button>
                    {!user && <Link to="/login">Login</Link>}
                    {/* {!user && (
                        <Link className="subscribe-btn" to="/subscribe">
                            Subscribe
                        </Link>
                    )} */}

                    {user && user.isSubscribed && (
                        <Link to="/course">Course</Link>
                    )}

                    {user && user.isSubscribed && (
                        <Link to="/weekly-outlooks">Weekly Outlooks</Link>
                    )}
                    {user && (
                        <button
                            onClick={() => logout(navigate)}
                            className="logout-button"
                        >
                            Logout
                        </button>
                    )}
                </nav>
            </header>
            <div className={`nav-sidebar ${navSidebarOpen ? "open" : ""}`}>
                <button className="close-btn" onClick={toggleSidebar}>
                    <IoClose />
                </button>
                <button
                    className="research-btn"
                    onClick={() => {
                        navigate("/");
                        toggleSidebar();
                    }}
                >
                    Home
                </button>
                <button
                    className="research-btn"
                    onClick={() => {
                        navigate("/research");
                        toggleSidebar();
                    }}
                >
                    Research
                </button>
                {!user && (
                    <Link
                        classname="login-button"
                        to="/login"
                        onClick={toggleSidebar}
                    >
                        Login
                    </Link>
                )}
                {/* {!user && (
                        <Link className="subscribe-btn" to="/subscribe" onClick={toggleSidebar}>>
                            Subscribe
                        </Link>
                    )} */}

                {user && user.isSubscribed && (
                    <Link to="/course" onClick={toggleSidebar}>
                        Course
                    </Link>
                )}

                {user && user.isSubscribed && (
                    <Link to="/weekly-outlooks" onClick={toggleSidebar}>
                        Weekly Outlooks
                    </Link>
                )}
                {user && (
                    <button
                        onClick={() => logout(navigate)}
                        className="logout-button"
                    >
                        Logout
                    </button>
                )}
            </div>
            <main className="container">
                <ScrollToTop />
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/subscribe" element={<SubscriptionPage />} />
                    <Route path="/resubscribe" element={<ResubscribePage />} />
                    <Route path="/course" element={<CoursePage />} />
                    <Route path="/research" element={<ResearchPage />} />
                    <Route path="/research/:id" element={<ArticlePage />} />
                    <Route path="/terms" element={<TermsAndConditions />} />
                    <Route
                        path="/weekly-outlooks"
                        element={<WeeklyOutlooks />}
                    />
                </Routes>
            </main>
            <footer className="footer">
                <p>© 2024 GGBP. All rights reserved.</p>
                <div className="footer-links">
                    <Link to="/terms" className="footer-link">
                        Terms and Conditions
                    </Link>
                </div>
                <div className="socials">
                    <a
                        href="https://x.com/ggbpx"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-link"
                    >
                        <FaTwitter size={30} />
                    </a>
                    <a
                        href="https://www.instagram.com/ggbp"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-link"
                    >
                        <FaInstagram size={30} />
                    </a>
                    <a
                        href="https://www.linkedin.com/company/ggbp-get-gbp/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-link"
                    >
                        <FaLinkedin size={30} />
                    </a>
                    <a
                        href="https://www.tiktok.com/@ggbp"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-link"
                    >
                        <FaTiktok size={30} />
                    </a>
                </div>
            </footer>
        </div>
    );
};

export default App;
