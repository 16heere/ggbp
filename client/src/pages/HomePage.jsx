import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const HomePage = () => {
    const navigate = useNavigate();
    const reviews = [
        {
            name: "Rajan Rama",
            content:
                "I used to be scared of crypto, but now it's my main source of income",
        },
        {
            name: "Luke Richards",
            content:
                "This service is for sure worth the money and I'd recommend it to anyone who would like to understand and truly get into the world of trading",
        },
        { name: "Eshar Heer", content: "I wish I joined sooner" },
        {
            name: "Jessica Mitchell",
            content:
                "I had been scammed before so I was skeptical, but this was the first mentorship that delivered on every promise",
        },
        {
            name: "Ethan Caldwell",
            content:
                "The mentors actually care and give you step by step tools & 1-1 help",
        },
        {
            name: "Olaoluwa Olaofe",
            content: "The strategies they teach here are pure gold...",
        },
    ];

    useEffect(() => {
        const trustpilotElement = document.querySelector(".trustpilot-widget");
        if (window.Trustpilot && trustpilotElement) {
            window.Trustpilot.loadFromElement(trustpilotElement);
        }
    }, []);

    return (
        <div className="home-page">
            <div className="first-info">
                <h1>Begin Your Trading Journey</h1>
                <div className="courses">
                    <div className="course crypto-course">
                        <p>
                            GGBP offers a clear and secure path to navigating
                            crypto, removing the confusion of going solo and
                            protecting users from scams and misinformation often
                            found on social media
                        </p>
                        <button onClick={() => navigate("/subscribe")}>
                            Get Involved
                        </button>
                    </div>
                </div>
            </div>

            <div className="course-info">
                <div className="course-info-title">
                    <h2>What our Program Includes</h2>
                </div>
                <div className="course-info-points">
                    <div className="course-info-point">
                        <img
                            src="/assets/IMG_7594.png"
                            alt="Education"
                            className="course-image"
                        />
                        {/* <h2 className="course-info-point-circle">1</h2> */}
                        <h4>Education</h4>
                        <p>
                            Elevate your investing skills to the next level.
                            Gain access to comprehensive courses, 50+ hours of
                            tutorials, and expert-crafted articles.
                        </p>
                    </div>
                    <div className="course-info-point">
                        <img
                            src="/assets/IMG_7595.png"
                            alt="Insights"
                            className="course-image"
                        />
                        {/* <h2 className="course-info-point-circle">2</h2> */}
                        <h4>Insights You Can Trust</h4>
                        <p>
                            Discover and invest in opportunities backed by
                            expert analysis.
                        </p>
                    </div>
                    <div className="course-info-point">
                        <img
                            src="/assets/IMG_7593.png"
                            alt="Market Analysis"
                            className="course-image"
                        />
                        {/* <h2 className="course-info-point-circle">3</h2> */}
                        <h4>Market Analysis</h4>
                        <p>
                            Safeguard your investments against unpredictable
                            market volatility.
                        </p>
                    </div>
                    <div className="course-info-point">
                        <img
                            src="/assets/IMG_7596.png"
                            alt="Network"
                            className="course-image"
                        />
                        {/* <h2 className="course-info-point-circle">4</h2> */}
                        <h4>Network</h4>
                        <p>
                            Collaborate and learn alongside the sharpest minds
                            in crypto, and connect directly with 8-figure
                            traders. 1-1 Sessions on demand.
                        </p>
                    </div>
                </div>
            </div>
            <div className="reviews">
                <h2>What Our Users Say</h2>
                <div
                    id="carouselExampleControls"
                    className="carousel slide"
                    data-bs-ride="carousel"
                    data-bs-interval="10000"
                >
                    <div className="carousel-inner">
                        {reviews.map((review, index) => (
                            <div
                                className={`carousel-item ${
                                    index === 0 ? "active" : ""
                                }`}
                                key={index}
                            >
                                <div className="review text-center">
                                    <p className="review-content">
                                        "{review.content}"
                                    </p>
                                    <h3 className="review-author">
                                        - {review.name}
                                    </h3>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button
                        className="carousel-control-prev"
                        type="button"
                        data-bs-target="#carouselExampleControls"
                        data-bs-slide="prev"
                    >
                        <span
                            className="carousel-control-prev-icon"
                            aria-hidden="true"
                        ></span>
                        <span className="visually-hidden">Previous</span>
                    </button>
                    <button
                        className="carousel-control-next"
                        type="button"
                        data-bs-target="#carouselExampleControls"
                        data-bs-slide="next"
                    >
                        <span
                            className="carousel-control-next-icon"
                            aria-hidden="true"
                        ></span>
                        <span className="visually-hidden">Next</span>
                    </button>
                </div>
            </div>
            <div
                class="trustpilot-widget"
                data-locale="en-GB"
                data-template-id="56278e9abfbbba0bdcd568bc"
                data-businessunit-id="6761cdf3148b1d5d425fd96b"
                data-style-height="52px"
                data-style-width="100%"
            >
                <a
                    href="https://uk.trustpilot.com/review/ggbp.org.uk"
                    target="_blank"
                    rel="noreferrer"
                >
                    Trustpilot
                </a>
            </div>
            <div className="section-divider"></div>

            <div className="more-info-container">
                <h3>AND MUCH MORE</h3>
                <div className="more-info">
                    <div className="more-info-point">
                        <img
                            src="/assets/live-stream.png"
                            alt="Live Streams"
                            className="info-image-large"
                        />
                        <div className="info-content">
                            <h4>Live Streams</h4>
                            <p>
                                Join live sessions with crypto experts and gain
                                actionable insights.
                            </p>
                        </div>
                    </div>
                    <div className="more-info-point">
                        <img
                            src="/assets/weekly-outlooks.png"
                            alt="Weekly Outlooks"
                            className="info-image-large"
                        />
                        <div className="info-content">
                            <h4>Weekly Outlooks</h4>
                            <p>
                                Prepare with weekly market trends and key
                                opportunities.
                            </p>
                        </div>
                    </div>
                    <div className="more-info-point">
                        <img
                            src="/assets/coin-picks.png"
                            alt="Coin Picks"
                            className="info-image-large"
                        />
                        <div className="info-content">
                            <h4>Coin Picks</h4>
                            <p>
                                Access handpicked coin recommendations for
                                maximum growth.
                            </p>
                        </div>
                    </div>
                    <div className="more-info-point">
                        <img
                            src="/assets/market-analysis.png"
                            alt="Market Analysis"
                            className="info-image-large"
                        />
                        <div className="info-content">
                            <h4>Market Analysis</h4>
                            <p>
                                Clear analysis of trends and macroeconomic
                                factors.
                            </p>
                        </div>
                    </div>
                    <div className="more-info-point">
                        <img
                            src="/assets/portfolio-tips.png"
                            alt="Personalized Portfolio Tips"
                            className="info-image-large"
                        />
                        <div className="info-content">
                            <h4>Personalized Portfolio Tips</h4>
                            <p>
                                Receive tailored advice to optimize your
                                portfolio.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
