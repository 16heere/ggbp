import React, { useState, useContext, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../context/userContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const SubscriptionFormPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const paymentType = location.state?.paymentType || "subscription";

    const [email, setEmail] = useState("");
    const [confirmEmail, setConfirmEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const [error, setError] = useState("");
    const { user } = useContext(UserContext);

    useEffect(() => {
        if (user) navigate("/course");
    }, [user, navigate]);

    const handleSubscribeNow = async () => {
        if (
            !email ||
            !confirmEmail ||
            !password ||
            !confirmPassword ||
            !isChecked
        ) {
            return alert("Please fill out all fields");
        }
        if (email !== confirmEmail) return alert("Emails do not match");
        if (password !== confirmPassword)
            return alert("Passwords do not match");

        try {
            const endpoint =
                paymentType === "one-time"
                    ? "/subscription/checkout-one-time"
                    : paymentType === "one-to-one"
                      ? "/subscription/checkout-one-to-one"
                      : "/subscription/create-checkout-session";

            const response = await axios.post(
                `${process.env.REACT_APP_API_ENDPOINT}${endpoint}`,
                { email, password }
            );

            window.location.href = response.data.url;
        } catch (error) {
            setError(error.response?.data?.message || "Subscription failed.");
            alert("Subscription failed. Please try again.");
        }
    };

    return (
        <div className="subscription-page">
            <div className="subscription-card">
                <h2>
                    {paymentType === "subscription"
                        ? "Monthly Plan"
                        : paymentType === "one-time"
                          ? "One-Time Payment"
                          : "1-1 Mentorship Plan"}
                </h2>

                <form className="subscription-form">
                    {error && <p className="error-message">{error}</p>}
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="email"
                        placeholder="Confirm Email"
                        value={confirmEmail}
                        onChange={(e) => setConfirmEmail(e.target.value)}
                    />
                    <div className="password-container">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <span
                            onClick={() => setShowPassword(!showPassword)}
                            className="toggle-password"
                        >
                            {showPassword ? <FaEye /> : <FaEyeSlash />}
                        </span>
                    </div>
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <div className="checkbox">
                        <input
                            type="checkbox"
                            id="tandc"
                            checked={isChecked}
                            onChange={(e) => setIsChecked(e.target.checked)}
                        />
                        <label htmlFor="tandc">
                            I agree to the{" "}
                            <Link to="/terms">Terms & Conditions</Link>
                        </label>
                    </div>
                    <button type="button" onClick={handleSubscribeNow}>
                        Pay Now
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SubscriptionFormPage;
