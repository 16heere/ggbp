import React, { useState } from "react";
import axios from "axios";

const SubscriptionPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubscribeNow = async () => {
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_ENDPOINT}/subscription/create-checkout-session`,
                {
                    email,
                    password,
                }
            );

            window.location.href = response.data.url; // Redirect to Stripe Checkout
        } catch (error) {
            console.error("Error creating checkout session:", error);
            alert("Subscription failed. Please try again.");
        }
    };

    return (
        <div className="subscription-page">
            <div className="subscription-card">
                <h2>£20</h2>
                <h3>GGBP Course</h3>
                <p>Billed Monthly</p>
                <ul>
                    <li>Access to all course materials</li>
                    <li>New content added every month</li>
                    <li>Exclusive community support</li>
                    <li>Monthly progress tracking</li>
                    <li>Cancel anytime</li>
                </ul>
                <form className="subscription-form">
                    <h2>Subscribe Now</h2>
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
