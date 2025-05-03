import React, { useState, useContext, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../context/userContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const SubscriptionFormPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const paymentType = location.state?.paymentType || "subscription";
    const { user } = useContext(UserContext);

    const [email, setEmail] = useState("");
    const [confirmEmail, setConfirmEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState("stripe");
    const [error, setError] = useState("");

    useEffect(() => {
        if (user) navigate("/course");
    }, [user, navigate]);

    const validateFields = () => {
        if (
            !email ||
            !confirmEmail ||
            !password ||
            !confirmPassword ||
            !isChecked
        )
            return "Please fill out all fields";
        if (email !== confirmEmail) return "Emails do not match";
        if (password !== confirmPassword) return "Passwords do not match";
        return null;
    };

    const handleSubmit = async () => {
        const validationError = validateFields();
        if (validationError) {
            alert(validationError);
            return;
        }

        if (selectedMethod === "crypto" && paymentType === "subscription") {
            return alert(
                "Crypto is not supported for subscriptions. Please use Stripe."
            );
        }

        try {
            if (selectedMethod === "stripe") {
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
            } else {
                // Crypto payment only allowed for one-time and one-to-one
                if (paymentType === "subscription") {
                    return alert("Crypto not supported for subscriptions.");
                }

                const response = await axios.post(
                    `${process.env.REACT_APP_API_ENDPOINT}/subscription/crypto-payment`,
                    { email, password, paymentType }
                );

                window.location.href = response.data.url;
            }
        } catch (error) {
            setError(error.response?.data?.message || "Payment failed.");
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

                {error && <p className="error-message">{error}</p>}

                <form className="subscription-form">
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

                    <div className="payment-method-options">
                        <label>
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="stripe"
                                checked={selectedMethod === "stripe"}
                                onChange={() => setSelectedMethod("stripe")}
                            />
                            <span>💳 Pay with Stripe</span>
                        </label>

                        {paymentType !== "subscription" && (
                            <label>
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="crypto"
                                    checked={selectedMethod === "crypto"}
                                    onChange={() => setSelectedMethod("crypto")}
                                />
                                <span>🪙 Pay with USDT (TRC20)</span>
                            </label>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        style={{ marginTop: "1rem" }}
                    >
                        {(selectedMethod || "stripe") === "stripe"
                            ? "Pay with Stripe"
                            : "Pay with Crypto"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SubscriptionFormPage;
