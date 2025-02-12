import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/userContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const SubscriptionPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate("/course");
        }
    }, [user, navigate]);

    const handleSubscribeNow = async () => {
        if (!email || !password || !isChecked) {
            alert("Please fill out all fields");
            return;
        }
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_ENDPOINT}/subscription/create-checkout-session`,
                {
                    email,
                    password,
                }
            );
            window.location.href = response.data.url;
        } catch (error) {
            console.error("Error creating checkout session:", error);
            alert("Subscription failed. Please try again.");
        }
    };

    return (
        <div className="subscription-page">
            <div className="subscription-card">
                <h2 className="price">£50</h2>
                <p className="billing-info">Billed Monthly</p>
                <h3 className="course-name">GGBP Course</h3>
                <ul className="benefits">
                    <li>✓ Access to all course materials</li>
                    <li>✓ New content added every month</li>
                    <li>✓ Exclusive community support</li>
                    <li>✓ Monthly progress tracking</li>
                    <li>✓ Cancel anytime</li>
                </ul>
                <form className="subscription-form">
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
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
