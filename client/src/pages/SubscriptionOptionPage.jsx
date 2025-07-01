import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SubscriptionOptionPage = () => {
    const [paymentType, setPaymentType] = useState("one-time");
    const navigate = useNavigate();

    const handleNext = () => {
        navigate("/subscribe/form", { state: { paymentType } });
    };

    return (
        <div className="subscription-page">
            <div className="subscription-card">
                <h2>
                    {paymentType === "one-time"
                        ? "Lifetime Access – £999"
                        : "1-1 Mentorship Package – £2500"}
                </h2>

                <p className="billing-info">
                    {paymentType === "one-time"
                        ? "One-time payment for full lifetime access"
                        : "Includes full course + personal mentorship"}
                </p>

                <h3 className="course-name">GGBP Course</h3>
                <ul className="benefits">
                    <li>✓ Full access to all course materials</li>
                    <li>✓ Fresh content added every month</li>
                    <li>✓ Exclusive community support</li>
                    <li>✓ Progress tracking & accountability</li>
                    {paymentType === "one-to-one" && (
                        <li>✓ Dedicated 1-on-1 mentoring</li>
                    )}
                    <li>✓ Cancel anytime (monthly plan only)</li>
                </ul>

                <div className="payment-options">
                    <label>
                        <input
                            type="radio"
                            name="paymentType"
                            value="one-time"
                            checked={paymentType === "one-time"}
                            onChange={() => setPaymentType("one-time")}
                        />
                        Lifetime Access – £999
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="paymentType"
                            value="one-to-one"
                            checked={paymentType === "one-to-one"}
                            onChange={() => setPaymentType("one-to-one")}
                        />
                        1-1 Mentorship – £2500
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
