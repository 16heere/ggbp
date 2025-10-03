import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/userContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const SubscriptionPage = () => {
    const [paymentType, setPaymentType] = useState("subscription"); // or "one-time"
    const [email, setEmail] = useState("");
    const [confirmEmail, setConfirmEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const [error, setError] = useState("");
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate("/course");
        }
    }, [user, navigate]);

    const handleSubscribeNow = async () => {
        if (
            !email ||
            !confirmEmail ||
            !password ||
            !confirmPassword ||
            !isChecked
        ) {
            alert("Please fill out all fields");
            return;
        }

        if (email !== confirmEmail) {
            alert("Emails do not match");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        try {
            const endpoint =
                paymentType === "one-time"
                    ? "/subscription/checkout-one-time"
                    : "/subscription/create-checkout-session";

            const response = await axios.post(
                `${process.env.REACT_APP_API_ENDPOINT}${endpoint}`,
                { email, password }
            );

            window.location.href = response.data.url;
        } catch (error) {
            setError(
                error.response?.data?.message ||
                    "Subscription failed. Please try again."
            );
            console.error("Error creating checkout session:", error);
            alert("Subscription failed. Please try again.");
        }
    };

    return (
        <div className="subscription-page">
            <div className="subscription-card">
                <h2 className="price">£150</h2>
                <p className="billing-info">Billed Monthly</p>
                <h3 className="course-name">GGBP Course</h3>
                <ul className="benefits">
                    <li>✓ Access to all course materials</li>
                    <li>✓ New content added every month</li>
                    <li>✓ Exclusive community support</li>
                    <li>✓ Monthly progress tracking</li>
                    <li>✓ Cancel anytime</li>
                </ul>
                <div className="payment-options">
                    <label>
                        <input
                            type="radio"
                            name="paymentType"
                            value="subscription"
                            checked={paymentType === "subscription"}
                            onChange={(e) => setPaymentType(e.target.value)}
                        />
                        Monthly (£120/month)
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="paymentType"
                            value="one-time"
                            checked={paymentType === "one-time"}
                            onChange={(e) => setPaymentType(e.target.value)}
                        />
                        One-Time (£999 lifetime access)
                    </label>
                </div>
                <form className="subscription-form">
                    {error && <p className="error-message">{error}</p>}
                    <div className="subscription-inputs">
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
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <label htmlFor="confirmEmail">Confirm Email</label>
                        <input
                            type="email"
                            placeholder="Confirm your email"
                            value={confirmEmail}
                            onChange={(e) => setConfirmEmail(e.target.value)}
                            required
                        />
                        <label
                            htmlFor="password"
                            style={{
                                color: error ? "red" : "black",
                                letterSpacing: "2px",
                            }}
                        >
                            Password
                        </label>
                        <div className="password-container">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                autoComplete="current-password"
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <span
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FaEye /> : <FaEyeSlash />}
                            </span>
                        </div>
                        <label htmlFor="confirmPassword">
                            Confirm Password
                        </label>
                        <div className="password-container">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                autoComplete="new-password"
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
                                required
                            />
                        </div>
                    </div>

                    <div className="checkbox">
                        <input
                            type="checkbox"
                            id="tandc"
                            required
                            checked={isChecked}
                            onChange={(e) => setIsChecked(e.target.checked)}
                        />
                        <label htmlFor="tandc">
                            I agree to the{" "}
                            <Link to="/terms">Terms & Conditions</Link>
                        </label>
                    </div>
                    <button
                        type="button"
                        onClick={handleSubscribeNow}
                        disabled={!email || !password || !isChecked}
                    >
                        Subscribe Now
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SubscriptionPage;
