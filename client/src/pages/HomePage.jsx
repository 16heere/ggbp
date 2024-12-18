import React from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const HomePage = () => {
    const reviews = [
        { name: "John Doe", content: "This program changed my life!" },
        { name: "Jane Smith", content: "Highly recommend this program." },
        { name: "Alex Johnson", content: "Great support and community!" },
    ];

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
                        <Link to="/subscribe">
                            {" "}
                            <button>Get Started</button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="course-info">
                <div className="course-info-title">
                    <h2>What our Program Includes</h2>
                </div>
                <div className="course-info-points">
                    <div className="course-info-point">
                        <h2 className="course-info-point-circle">1</h2>
                        <h4>Education</h4>
                        <p>
                            Elevate you investing skills to the next level. Gain
                            access to comprehensive courses, 50+ hours and
                            counting of in-depth tutorials, and several
                            expert-crafted articles
                        </p>
                    </div>
                    <div className="course-info-point">
                        <h2 className="course-info-point-circle">2</h2>
                        <h4>Insights You Can Trust</h4>
                        <p>
                            Discover and invest in opportunities backed by
                            expert analysis
                        </p>
                    </div>
                    <div className="course-info-point">
                        <h2 className="course-info-point-circle">3</h2>
                        <h4>Market Analysis</h4>
                        <p>
                            Safeguard your investments against unpredictable
                            market volatility
                        </p>
                    </div>
                    <div className="course-info-point">
                        <h2 className="course-info-point-circle">4</h2>
                        <h4>Network</h4>
                        <p>
                            Collaborate and learn alongside the sharpest minds
                            in crypto, and connect directly with 8-figure
                            traders. 1-1 Sessions on demand
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
        </div>
    );
};

export default HomePage;
