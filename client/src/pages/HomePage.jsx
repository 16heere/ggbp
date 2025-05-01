import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import Scroller from "../components/Scroller";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap/dist/css/bootstrap.min.css";
import ArticleCarousel from "../components/ArticleCarousel";

const HomePage = () => {
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
    const [prices, setPrices] = useState([]);

    const fetchPrices = async () => {
        const pairs = [
            "BTC-USD",
            "ETH-USD",
            "XRP-USD",
            "SUI-USD",
            "SOL-USD",
            "ADA-USD",
        ];
        const baseUrl = "https://api.exchange.coinbase.com/products";
        try {
            const priceData = await Promise.all(
                pairs.map(async (pair) => {
                    const response = await axios.get(
                        `${baseUrl}/${pair}/ticker`
                    );

                    const statsResponse = await axios.get(
                        `${baseUrl}/${pair}/stats`
                    );

                    const { price } = response.data;
                    const { open, last } = statsResponse.data;
                    const currentPrice = parseFloat(last);
                    const openPrice = parseFloat(open);

                    // Calculate 24-hour percentage change
                    const change24h =
                        ((currentPrice - openPrice) / openPrice) * 100;
                    const baseCurrency = pair.split("-")[0];
                    const logoPath = `/assets/${baseCurrency}.svg`;
                    return {
                        pair,
                        price: parseFloat(price).toFixed(2),
                        change24h: change24h.toFixed(2),
                        logo: logoPath,
                    };
                })
            );
            setPrices([...priceData, ...priceData]);
        } catch (error) {
            console.error("Error fetching prices:", error.message);
        }
    };

    useEffect(() => {
        const trustpilotElement = document.querySelector(".trustpilot-widget");
        if (window.Trustpilot && trustpilotElement) {
            window.Trustpilot.loadFromElement(trustpilotElement);
        }
        fetchPrices();
    }, []);

    return (
        <div className="home-page">
            <Scroller items={prices} speed="fast" direction="left" />
            <motion.div
                className="first-info"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
            >
                <h1>Begin Your Trading Journey</h1>
                <motion.div className="courses">
                    <div
                        className="course crypto-course"
                        initial={{ scale: 0.9, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        viewport={{ once: true }}
                    >
                        <p>
                            GGBP offers a clear and secure path to navigating
                            crypto, removing the confusion of going solo and
                            protecting users from scams and misinformation often
                            found on social media
                        </p>
                        {/* <button onClick={() => navigate("/subscribe")}>
                            Get Involved
                        </button> */}
                    </div>
                </motion.div>
            </motion.div>

            <div className="course-info">
                <motion.div
                    className="course-info-title"
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    viewport={{ once: true }}
                >
                    <h2>What our Program Includes</h2>
                </motion.div>

                <div className="course-info-points">
                    <motion.div
                        className="course-info-point"
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{
                            duration: 0.8,
                            ease: "easeOut",
                            delay: 0.2,
                        }}
                        viewport={{ once: true }}
                    >
                        <img
                            src="/assets/IMG_7594.png"
                            alt="Education"
                            className="course-image"
                        />
                        <h4>Education</h4>
                        <p>
                            Elevate your investing skills to the next level.
                            Gain access to comprehensive courses, 50+ hours of
                            tutorials, and expert-crafted articles.
                        </p>
                    </motion.div>

                    <motion.div
                        className="course-info-point"
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{
                            duration: 0.8,
                            ease: "easeOut",
                            delay: 0.4,
                        }}
                        viewport={{ once: true }}
                    >
                        <img
                            src="/assets/IMG_7595.png"
                            alt="Insights"
                            className="course-image"
                        />
                        <h4>Insights You Can Trust</h4>
                        <p>
                            Discover and invest in opportunities backed by
                            expert analysis.
                        </p>
                    </motion.div>

                    <motion.div
                        className="course-info-point"
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{
                            duration: 0.8,
                            ease: "easeOut",
                            delay: 0.6,
                        }}
                        viewport={{ once: true }}
                    >
                        <img
                            src="/assets/IMG_7593.png"
                            alt="Market Analysis"
                            className="course-image"
                        />
                        <h4>Market Analysis</h4>
                        <p>
                            Safeguard your investments against unpredictable
                            market volatility.
                        </p>
                    </motion.div>

                    <motion.div
                        className="course-info-point"
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{
                            duration: 0.8,
                            ease: "easeOut",
                            delay: 0.8,
                        }}
                        viewport={{ once: true }}
                    >
                        <img
                            src="/assets/IMG_7596.png"
                            alt="Network"
                            className="course-image"
                        />
                        <h4>Network</h4>
                        <p>
                            Collaborate and learn alongside the sharpest minds
                            in crypto, and connect directly with 8-figure
                            traders. 1-1 Sessions on demand.
                        </p>
                    </motion.div>
                </div>
            </div>

            <motion.div
                className="more-info-container"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                    duration: 1,
                    ease: "easeInOut",
                }}
                viewport={{ once: true }}
            >
                <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    viewport={{ once: true }}
                >
                    AND MUCH MORE
                </motion.h3>

                <div className="more-info">
                    <motion.div
                        className="more-info-point"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.8,
                            ease: "easeOut",
                            delay: 0.2,
                        }}
                        viewport={{ once: true }}
                    >
                        <img
                            src="/assets/live-stream.png"
                            alt="Live Streams"
                            className="info-image-large"
                            loading="lazy"
                        />
                        <div className="info-content">
                            <h4>Live Streams</h4>
                            <p>
                                Join live sessions with crypto experts and gain
                                actionable insights.
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        className="more-info-point"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.8,
                            ease: "easeOut",
                            delay: 0.4,
                        }}
                        viewport={{ once: true }}
                    >
                        <img
                            src="/assets/weekly-outlooks.png"
                            alt="Weekly Outlooks"
                            className="info-image-large"
                            loading="lazy"
                        />
                        <div className="info-content">
                            <h4>Weekly Outlooks</h4>
                            <p>
                                Prepare with weekly market trends and key
                                opportunities.
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        className="more-info-point"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.8,
                            ease: "easeOut",
                            delay: 0.6,
                        }}
                        viewport={{ once: true }}
                    >
                        <img
                            src="/assets/coin-picks.png"
                            alt="Coin Picks"
                            className="info-image-large"
                            loading="lazy"
                        />
                        <div className="info-content">
                            <h4>Coin Picks</h4>
                            <p>
                                Access handpicked coin recommendations for
                                maximum growth.
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        className="more-info-point"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.8,
                            ease: "easeOut",
                            delay: 0.8,
                        }}
                        viewport={{ once: true }}
                    >
                        <img
                            src="/assets/market-analysis.png"
                            alt="Market Analysis"
                            className="info-image-large"
                            loading="lazy"
                        />
                        <div className="info-content">
                            <h4>Market Analysis</h4>
                            <p>
                                Clear analysis of trends and macroeconomic
                                factors.
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        className="more-info-point"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.8,
                            ease: "easeOut",
                            delay: 1,
                        }}
                        viewport={{ once: true }}
                    >
                        <img
                            src="/assets/portfolio-tips.png"
                            alt="Personalized Portfolio Tips"
                            className="info-image-large"
                            loading="lazy"
                        />
                        <div className="info-content">
                            <h4>Personalised Portfolio Tips</h4>
                            <p>
                                Receive tailored advice to optimise your
                                portfolio.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                viewport={{ once: true }}
            >
                <h2 className="feature-article-title">Featured Articles</h2>
                <ArticleCarousel />
            </motion.div>
            <div className="section-divider"></div>
            <motion.div
                className="reviews-container"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                viewport={{ once: true }}
            >
                <div className="reviews">
                    <h3 className="reviews-title">What Our Users Say</h3>
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
            </motion.div>
        </div>
    );
};

export default HomePage;
