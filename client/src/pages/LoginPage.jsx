import React, { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../api/api";
import { UserContext } from "../context/userContext";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const { user, handleLogin } = useContext(UserContext);

    useEffect(() => {
        if (user) {
            navigate("/course");
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await loginUser({ email, password });
            const { token, user } = response.data;
            localStorage.setItem("token", token);
            localStorage.setItem("loginTime", Date.now().toString());
            handleLogin(user, token);
            alert("Login successful!");
            navigate("/course");
        } catch (error) {
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
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Login</button>
                {/* <p>
                    Want to resubscribe?{" "}
                    <Link to="/resubscribe">Click here</Link>.
                </p> */}
            </form>
        </div>
    );
};

export default LoginPage;
