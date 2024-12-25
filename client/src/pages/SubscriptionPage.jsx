import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/userContext";

const SubscriptionPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate("/course");
        }
    }, [user, navigate]);

    const handleSubscribeNow = async () => {
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
                    <input
                        type="password"
                        placeholder="Choose a password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="button" onClick={handleSubscribeNow}>
                        Subscribe Now
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SubscriptionPage;
