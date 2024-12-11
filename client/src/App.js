import React, { useContext } from "react";
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
    FaFacebook,
    FaTiktok,
} from "react-icons/fa6";
import { UserContext } from "./context/userContext";
import ResubscribePage from "./pages/ResubscribePage"; // Import the component

const App = () => {
    const { user, logout } = useContext(UserContext);
    const navigate = useNavigate();

    return (
        <div className="content-container">
            <header className="navbar">
                <h1>
                    <Link to="/">GGBP</Link>
                </h1>
                <nav>
                    {!user && <Link to="/login">Login</Link>}
                    {!user && <Link to="/subscribe">Subscribe</Link>}
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
                </Routes>
            </main>
            <footer className="footer">
                <p>© 2024 GGBP. All rights reserved.</p>
                <div className="socials">
                    <a
                        href="https://www.facebook.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-link"
                    >
                        <FaFacebook size={50} />
                    </a>
                    <a
                        href="https://www.twitter.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-link"
                    >
                        <FaTwitter size={50} />
                    </a>
                    <a
                        href="https://www.instagram.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-link"
                    >
                        <FaInstagram size={50} />
                    </a>
                    <a
                        href="https://www.linkedin.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-link"
                    >
                        <FaLinkedin size={50} />
                    </a>
                    <a
                        href="https://tiktok.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-link"
                    >
                        <FaTiktok size={50} />
                    </a>
                </div>
            </footer>
        </div>
    );
};

export default App;
