import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
const ArticlePage = () => {
    const { id } = useParams();
    const [article, setArticle] = useState();

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(
                    `${process.env.REACT_APP_API_ENDPOINT}/courses/research/${id}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                setArticle(response.data);
            } catch (error) {
                console.error("Error fetching article:", error);
            }
        };

        fetchArticle();
    }, [id]);

    if (!article) {
        return <p>Loading...</p>;
    }

    const parseContent = (content) => {
        return content.split("\n").map((line, index) => {
            const trimmedLine = line.trim();

            // Check for headings based on number of hashtags
            if (trimmedLine.startsWith("### ")) {
                return (
                    <h3 key={index} className="article-heading">
                        {trimmedLine.replace("### ", "")}
                    </h3>
                );
            } else if (trimmedLine.startsWith("## ")) {
                return (
                    <h2 key={index} className="article-heading">
                        {trimmedLine.replace("## ", "")}
                    </h2>
                );
            } else if (trimmedLine.startsWith("# ")) {
                return (
                    <h1 key={index} className="article-heading">
                        {trimmedLine.replace("# ", "")}
                    </h1>
                );
            } else if (trimmedLine) {
                return (
                    <p key={index} className="article-paragraph">
                        {trimmedLine}
                    </p>
                );
            }
            return null; // Ignore empty lines
        });
    };

    return (
        <div className="article-page">
            <header className="article-header">
                <h1 className="article-title">{article.title}</h1>
            </header>
            <div className="article-content">
                <img
                    className="article-image"
                    src={article.image}
                    alt={article.title}
                />
                <h2 className="article-subtitle">{article.subtitle}</h2>
                <div className="article-body">
                    {parseContent(article.content)}
                </div>
            </div>
        </div>
    );
};

export default ArticlePage;
