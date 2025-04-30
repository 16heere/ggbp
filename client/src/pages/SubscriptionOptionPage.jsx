import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SubscriptionOptionPage = () => {
    const [paymentType, setPaymentType] = useState("subscription");
    const navigate = useNavigate();

    const handleNext = () => {
        navigate("/subscribe/form", { state: { paymentType } });
    };

    return (
        <div className="subscription-page">
            <div className="subscription-card">
                <h2 className="price">
                    {paymentType === "subscription" ? "£150/mo" : "£1000"}
                </h2>
                <p className="billing-info">
                    {paymentType === "subscription"
                        ? "Billed Monthly"
                        : "One-Time Lifetime Access"}
                </p>
                <h3 className="course-name">GGBP Course</h3>
                <ul className="benefits">
                    <li>✓ Access to all course materials</li>
                    <li>✓ New content added every month</li>
                    <li>✓ Exclusive community support</li>
                    <li>✓ Progress tracking</li>
                    <li>✓ Cancel anytime</li>
                </ul>

                <div className="payment-options">
                    <label>
                        <input
                            type="radio"
                            name="paymentType"
                            value="subscription"
                            checked={paymentType === "subscription"}
                            onChange={() => setPaymentType("subscription")}
                        />
                        Monthly (£150/month)
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="paymentType"
                            value="one-time"
                            checked={paymentType === "one-time"}
                            onChange={() => setPaymentType("one-time")}
                        />
                        One-Time (£1000 lifetime access)
                    </label>
                </div>

                <button onClick={handleNext} className="continue-button">
                    Continue
                </button>
            </div>
        </div>
    );
};

export default SubscriptionOptionPage;
