// src/pages/ResubscribePage.jsx
import React, { useState } from "react";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";

const ResubscribePage = () => {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");

    const handleResubscribe = async () => {
        setError(""); // Clear any previous error messages

        if (!email) {
            setError("Please enter a valid email address.");
            return;
        }

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_ENDPOINT}/subscription/resubscribe-session`,
                {
                    email,
                    successUrl: "https://ggbp.org.uk//course",
                    cancelUrl: "https://ggbp.org.uk/",
                }
            );

            const { sessionId } = response.data;

            // Redirect to Stripe Checkout
            const stripe = await loadStripe(
                process.env.REACT_APP_STRIPE_PUBLIC_KEY
            );
            stripe.redirectToCheckout({ sessionId });
        } catch (error) {
            console.error("Failed to create Stripe session:", error.message);
            setError(
                error.response.data.message
                    ? error.response.data.message
                    : "Failed to create Stripe session. Please try again later."
            );
        }
    };

    return (
        <div className="resubscribe-page">
            <h2>Resubscribe to the Course</h2>
            <p>Enter your email to start the subscription process again.</p>
            {error && <p className="error-message">{error}</p>}
            <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="email-input"
            />
            <button onClick={handleResubscribe} className="resubscribe-button">
                Resubscribe
            </button>
        </div>
    );
};

export default ResubscribePage;
