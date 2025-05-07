import React, { useEffect, useState } from "react";
import axios from "axios";
import ResearchCard from "./ResearchCard";
import {
    MdOutlineKeyboardDoubleArrowRight,
    MdOutlineKeyboardDoubleArrowLeft,
} from "react-icons/md";

const ArticleCarousel = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [articles, setArticles] = useState([]);
    // Show 3 articles at a time
    const articlesToShow = 3;

    const fetchArticles = async () => {
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_API_ENDPOINT}/courses/research`
            );
            setArticles(response.data);
        } catch (error) {
            console.error("Error fetching articles:", error.message);
        }
    };

    useEffect(() => {
        fetchArticles();
    }, []);

    const handleNext = () => {
        if (currentIndex < articles.length - articlesToShow) {
            setCurrentIndex((prevIndex) => prevIndex + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex((prevIndex) => prevIndex - 1);
        }
    };
    console.log(articles);
    if (!articles || articles.length <= 0) {
        return <></>;
    }

    return (
        <section className="featured-articles fade-in">
            <h2 className="feature-article-title">Featured Articles</h2>
            <div className="article-carousel">
                <button
                    className="carousel-button prev"
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                >
                    <svg width="0" height="0">
                        <linearGradient
                            id="blue-gradient"
                            x1="100%"
                            y1="100%"
                            x2="0%"
                            y2="0%"
                        >
                            <stop offset="0%" />
                            <stop offset="100%" />
                        </linearGradient>
                    </svg>
                    <MdOutlineKeyboardDoubleArrowLeft size={50} />
                </button>
                <div className="carousel-track-container">
                    <div
                        className="carousel-track"
                        style={{
                            transform: `translateX(-${currentIndex * (100 / 3)}%)`,
                        }}
                    >
                        {articles &&
                            articles.map((article, index) => (
                                <div className="carousel-section" key={index}>
                                    <ResearchCard article={article} />
                                </div>
                            ))}
                    </div>
                </div>
                <button
                    className="carousel-button next"
                    onClick={handleNext}
                    disabled={currentIndex >= articles.length - 3}
                >
                    <MdOutlineKeyboardDoubleArrowRight size={50} />
                </button>
            </div>
        </section>
    );
};

export default ArticleCarousel;
