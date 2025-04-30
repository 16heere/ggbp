import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { loginUser } from "../api/api";
import { UserContext } from "../context/userContext";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState();
    const [error, setError] = useState(false);
    const navigate = useNavigate();
    const { user, handleLogin } = useContext(UserContext);

    useEffect(() => {
        if (user) {
            navigate("/course");
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const response = await loginUser({ email, password });
            const { user } = response.data;

            handleLogin(user);
            alert("Login successful!");
            navigate("/course");
        } catch (error) {
            setError(
                error.response?.data?.message || "Invalid email or password."
            );
            console.error(
                "Login error:",
                error.response ? error.response.data : error.message
            );
            alert(
                "Login failed: " +
                    (error.response?.data?.message || "Unknown error")
            );
        }
    };

    return (
        <div className="login-page">
            <form onSubmit={handleSubmit} className="login-form">
                <h2>Login</h2>

                {/* Show error message */}
                {error && <p className="error-message">{error}</p>}

                <div className="login-inputs">
                    <label
                        htmlFor="email"
                        style={{
                            color: error ? "red" : "black",
                            letterSpacing: "2px",
                        }}
                    >
                        Email
                    </label>
                    <input
                        type="email"
                        placeholder="yourname@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <div className="password-container">
                        <label
                            htmlFor="password"
                            style={{
                                color: error ? "red" : "black",
                                letterSpacing: "2px",
                            }}
                        >
                            Password
                        </label>

                        <div className="password-input-container">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="*********"
                                value={password}
                                autoComplete="current-password"
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <span
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FaEye /> : <FaEyeSlash />}
                            </span>
                        </div>
                    </div>
                </div>

                <button type="submit">Login</button>
                <p>
                    Want to resubscribe?{" "}
                    <Link to="/resubscribe">Click here</Link>.
                </p>
            </form>
        </div>
    );
};

export default LoginPage;
