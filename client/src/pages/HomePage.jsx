import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap/dist/css/bootstrap.min.css";
import ArticleCarousel from "../components/ArticleCarousel";
import Marquee from "react-fast-marquee";
import ScrollerCard from "../components/ScrollerCard";

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
            <Marquee
                gradient={false}
                speed={60}
                pauseOnHover={true}
                style={{ padding: "10px" }}
            >
                {prices &&
                    prices.map((price, index) => (
                        <ScrollerCard item={price} key={index} index={index} />
                    ))}
            </Marquee>
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
                        {/* <button onClick={() => navigate("/subscribe")}>
                            Get Involved
                        </button> */}
                    </div>
                </div>
            </div>

            <div className="course-info">
                <div className="course-info-title">
                    <h2>What our Program Includes</h2>
                </div>

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
                            src="/assets/optimized/IMG_7594.webp"
                            srcSet="/assets/optimized/IMG_7594-200.webp 200w, /assets/optimized/IMG_7594-400.webp 400w, /assets/optimized/IMG_7594-800.webp 800w"
                            sizes="(max-width: 400px) 200px, (max-width: 768px) 400px, 800px"
                            alt="Education"
                            className="course-image"
                            loading="lazy"
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
                            src="/assets/optimized/IMG_7595.webp"
                            srcSet="/assets/optimized/IMG_7595-200.webp 200w, /assets/optimized/IMG_7595-400.webp 400w, /assets/optimized/IMG_7595-800.webp 800w"
                            sizes="(max-width: 400px) 200px, (max-width: 768px) 400px, 800px"
                            alt="Insights"
                            className="course-image"
                            loading="lazy"
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
                            src="/assets/optimized/IMG_7593.webp"
                            srcSet="/assets/optimized/IMG_7593-200.webp 200w, /assets/optimized/IMG_7593-400.webp 400w, /assets/optimized/IMG_7593-800.webp 800w"
                            sizes="(max-width: 400px) 200px, (max-width: 768px) 400px, 800px"
                            alt="Market Analysis"
                            className="course-image"
                            loading="lazy"
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
                            src="/assets/optimized/IMG_7596.webp"
                            srcSet="/assets/optimized/IMG_7596-200.webp 200w, /assets/optimized/IMG_7596-400.webp 400w, /assets/optimized/IMG_7596-800.webp 800w"
                            sizes="(max-width: 400px) 200px, (max-width: 768px) 400px, 800px"
                            alt="Network"
                            className="course-image"
                            loading="lazy"
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

            <section className="more-info-container fade-in">
                <h3>AND MUCH MORE</h3>
                <div className="more-info">
                    {[
                        {
                            img: "IMG_7596.webp",
                            title: "Live Streams",
                            desc: "Join live sessions with crypto experts and gain actionable insights.",
                        },
                        {
                            img: "weekly-outlooks.webp",
                            title: "Weekly Outlooks",
                            desc: "Prepare with weekly market trends and key opportunities.",
                        },
                        {
                            img: "coin-picks.webp",
                            title: "Coin Picks",
                            desc: "Access handpicked coin recommendations for maximum growth.",
                        },
                        {
                            img: "market-analysis.webp",
                            title: "Market Analysis",
                            desc: "Clear analysis of trends and macroeconomic factors.",
                        },
                        {
                            img: "portfolio-tips.webp",
                            title: "Personalised Portfolio Tips",
                            desc: "Receive tailored advice to optimise your portfolio.",
                        },
                    ].map((item, i) => (
                        <motion.div
                            key={i}
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
                                src={`/assets/optimized/${item.img}`}
                                srcSet={`/assets/optimized/${item.img.replace(
                                    ".webp",
                                    "-200.webp"
                                )} 200w, /assets/optimized/${item.img.replace(
                                    ".webp",
                                    "-400.webp"
                                )} 400w, /assets/optimized/${item.img.replace(
                                    ".webp",
                                    "-800.webp"
                                )} 800w`}
                                sizes="(max-width: 400px) 200px, (max-width: 768px) 400px, 800px"
                                alt={item.title}
                                className="info-image-large"
                                loading="lazy"
                            />
                            <div className="info-content">
                                <h4>{item.title}</h4>
                                <p>{item.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            <ArticleCarousel />

            <section className="founders-section fade-in">
                <h2 className="section-title text-center mb-4">
                    Meet the Founders
                </h2>
                <div className="founders-container d-flex justify-content-center gap-4 flex-wrap">
                    {[
                        {
                            name: "Sarven M.",
                            role: "Co-Founder & Mentor",
                            image: "/assets/sarven.jpeg",
                            linkedin:
                                "https://www.linkedin.com/in/sarven-m-257243245/",
                            description:
                                "Sarven is a co-founder of GGBP and a dedicated mentor committed to making crypto education clear, actionable, and accessible. With years of experience in trading and mentoring, Sarven focuses on building long-term success for members by combining technical analysis, risk management, and mindset coaching.",
                        },
                        {
                            name: "Mikail A.",
                            role: "Co-Founder & Strategy Lead",
                            image: "/assets/mikail.jpeg",
                            linkedin:
                                "https://www.linkedin.com/in/mikail-anser-856b50228/",
                            description:
                                "Mikail is one of the world's leading cryptocurrency traders, who has amassed over 8 figures in cryptocurrency at the age of 20. Within GGBP, he aids students to reach similar accolodaes and change their financial situation through cryptocurrency. His education and expertise has built some of the industry's best performing traders.",
                        },
                        {
                            name: "Eshar H.",
                            role: "Lead Developer",
                            image: "/assets/eshar.jpg",
                            linkedin: "https://www.linkedin.com/in/esharheer/",
                            description:
                                "Eshar engineered the entire function of GGBP from a technological perspective. He has excelled in building the GGBP platform, and actively operates in maintaining functionality. Helping to facilitate delivery of cryptocurrency's leading education & insights.",
                        },
                    ].map((founder, index) => (
                        <motion.div
                            key={index}
                            className="founder-card text-center"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 * index }}
                            viewport={{ once: true }}
                        >
                            <img
                                src={founder.image}
                                alt={founder.name}
                                className="founder-image rounded-circle mb-3"
                                loading="lazy"
                            />
                            <h5 className="founder-name mb-1">
                                {founder.name}
                            </h5>
                            <p className="founder-role text-muted mb-2">
                                {founder.role}
                            </p>
                            <p className="founder-description mb-3">
                                {founder.description}
                            </p>
                            <a
                                href={founder.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="founder-button btn btn-outline-primary btn-sm"
                            >
                                View LinkedIn
                            </a>
                        </motion.div>
                    ))}
                </div>
            </section>

            <div className="section-divider"></div>

            <section className="reviews-container fade-in">
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
                    className="trustpilot-widget"
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
            </section>
        </div>
    );
};

export default HomePage;
