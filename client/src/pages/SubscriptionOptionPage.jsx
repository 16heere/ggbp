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
                <h2>
                    {paymentType === "subscription"
                        ? "🟦 Tier 1 - Monthly – £99/mo"
                        : paymentType === "one-time"
                          ? "🟧 Tier 2 - Lifetime Access – £999"
                          : "🟥 Tier 3 - 1-1 Mentorship Package – £2500"}
                </h2>

                <p className="billing-info">
                    {paymentType === "subscription"
                        ? "Billed monthly, cancel anytime"
                        : paymentType === "one-time"
                          ? "One-time payment for full lifetime access"
                          : "Includes full course + personal mentorship"}
                </p>

                {paymentType === "subscription" && (
                    <p style={{ marginBottom: "20px" }}>
                        The perfect entry point into the crypto world. Unlock
                        the foundations of profitable trading with structured
                        guidance
                    </p>
                )}
                {paymentType === "one-time" && (
                    <p style={{ marginBottom: "20px" }}>
                        Commit Once. Learn Forever. Designed for those who want{" "}
                        <strong>lifetime access</strong> without ongoing
                        subscriptions.
                    </p>
                )}
                {paymentType === "one-to-one" && (
                    <p style={{ marginBottom: "20px" }}>
                        Direct Access. Elite mentorship. This is the highest
                        level of access - built for those who want{" "}
                        <strong>hands-on guidance and transformation.</strong>
                    </p>
                )}
                <ul className="benefits">
                    {paymentType === "subscription" && (
                        <>
                            <li>
                                📚 Full access to my{" "}
                                <strong>Crypto Mastery Course</strong>
                            </li>
                            <li>
                                📊 Weekly market updates & insights so you never
                                trade blind
                            </li>
                            <li>
                                💬 Access to an exclusive community of traders
                            </li>
                            <li>
                                🤝 Direct 1-1 Support from me (DMs/ Quick help
                                when needed)
                            </li>
                            <li>✖️ Cancel anytime</li>
                        </>
                    )}
                    {paymentType === "one-time" && (
                        <>
                            <li>
                                📚 Full access to my{" "}
                                <strong>Crypto Mastery Course</strong>
                            </li>
                            <li>
                                📊 Weekly market updates & insights so you never
                                trade blind
                            </li>
                            <li>
                                💬 Access to an exclusive community of traders
                            </li>
                            <li>
                                🤝 Direct 1-1 Support from me (DMs/ Quick help
                                when needed)
                            </li>
                            <li>
                                ♾️ Lifetime access to all my courses, community,
                                and weekly updates
                            </li>
                        </>
                    )}
                    {paymentType === "one-to-one" && (
                        <>
                            <li>
                                ☑️ Everything inlcuded in{" "}
                                <strong>Genesis</strong>
                            </li>
                            <li>🌎 Everything in blockchain</li>
                            <li>
                                📞 Weekly 1-1 calls with me (personalised
                                mentorship)
                            </li>
                            <li>
                                📑 <strong>Custom trading strategies</strong>{" "}
                                designed around your goals
                            </li>
                            <li>
                                🔎{" "}
                                <strong>
                                    Portfolio reviews & optimisation
                                </strong>
                            </li>
                            <li>
                                ⚡ Direct{" "}
                                <strong>
                                    priority access via WhatsApp/Telegram
                                </strong>
                            </li>
                            <li>
                                🤝 Networking opportunities with other
                                high-level traders & investors
                            </li>
                        </>
                    )}
                </ul>

                {paymentType === "subscription" && (
                    <p style={{ marginBottom: "20px" }}>
                        Ideal for beginners and traders who want consistent
                        mentorship and are just starting out.
                    </p>
                )}
                {paymentType === "one-time" && (
                    <p style={{ marginBottom: "20px" }}>
                        Best for serious learners who want to invest once and
                        keep building forever.
                    </p>
                )}
                {paymentType === "one-to-one" && (
                    <p style={{ marginBottom: "20px" }}>
                        Best for serious learners who want to invest once and
                        keep building forever.
                    </p>
                )}

                <div className="payment-options">
                    <label>
                        <input
                            type="radio"
                            name="paymentType"
                            value="subscription"
                            checked={paymentType === "subscription"}
                            onChange={() => setPaymentType("subscription")}
                        />
                        Monthly £99/month
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="paymentType"
                            value="one-time"
                            checked={paymentType === "one-time"}
                            onChange={() => setPaymentType("one-time")}
                        />
                        Lifetime Access £999
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="paymentType"
                            value="one-to-one"
                            checked={paymentType === "one-to-one"}
                            onChange={() => setPaymentType("one-to-one")}
                        />
                        1-1 Mentorship £2500
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
