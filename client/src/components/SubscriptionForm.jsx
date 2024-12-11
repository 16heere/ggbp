import React, { useState } from "react";
import { subscribeUser } from "../api/api";
import { useNavigate } from "react-router-dom";

const SubscriptionForm = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await subscribeUser({ email, password });
            alert("Subscription successful! You can now log in.");
            navigate("/");
        } catch (error) {
            alert("Subscription failed: " + error.response.data.message);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
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
                required
                requiredminlength="8"
                pattern="(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}"
                title="Password must be at least 8 characters long, contain a number, and a capital letter."
            />
            <button type="submit">Subscribe</button>
        </form>
    );
};

export default SubscriptionForm;
