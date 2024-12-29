import React, { useContext } from "react";
import { Route, Routes, Link, useNavigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SubscriptionPage from "./pages/SubscriptionPage";
import CoursePage from "./pages/CoursePage";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import { FaLinkedin, FaInstagram, FaTwitter, FaTiktok } from "react-icons/fa6";
import { UserContext } from "./context/userContext";
import ResubscribePage from "./pages/ResubscribePage";
import ResearchPage from "./pages/ResearchPage";
import ArticlePage from "./pages/ArticlePage";

const App = () => {
    const { user, logout } = useContext(UserContext);
    const navigate = useNavigate();

    return (
        <div className="content-container">
            <header className="navbar">
                <h1>
                    <Link to="/">
                        <img src="/assets/ggbp LOGO white wide.png" alt="" />
                    </Link>
                </h1>
                <nav>
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
            <main className="container">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/subscribe" element={<SubscriptionPage />} />
                    <Route path="/resubscribe" element={<ResubscribePage />} />
                    <Route path="/course" element={<CoursePage />} />
                    <Route path="/research" element={<ResearchPage />} />
                    <Route path="/research/:id" element={<ArticlePage />} />
                </Routes>
            </main>
            <footer className="footer">
                <p>© 2024 GGBP. All rights reserved.</p>
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
