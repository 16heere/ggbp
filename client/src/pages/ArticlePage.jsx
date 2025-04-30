import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { UserContext } from "../context/userContext";
const ArticlePage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useContext(UserContext);
    const [article, setArticle] = useState();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const fetchArticle = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_ENDPOINT}/courses/research/${id}`,
                    {
                        withCredentials: true,
                    }
                );
                const articleData = response.data;
                if (articleData.is_premium && !user?.isSubscribed) {
                    setArticle({ ...articleData, isLocked: true });
                } else {
                    setArticle({ ...articleData, isLocked: false });
                }
            } catch (error) {
                console.error("Error fetching article:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchArticle();
    }, [id, user]);

    if (loading) {
        return (
            <div class="newtons-cradle">
                <div class="newtons-cradle__dot"></div>
                <div class="newtons-cradle__dot"></div>
                <div class="newtons-cradle__dot"></div>
                <div class="newtons-cradle__dot"></div>
            </div>
        );
    }

    if (article?.isLocked) {
        return (
            <div className="locked-page">
                <h1>🔒 This Article is Locked</h1>
                <p>You need to subscribe to access premium articles.</p>
                <button onClick={() => navigate("/login")}>
                    Subscribe Now
                </button>
            </div>
        );
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
            <h1 className="article-title">{article.title}</h1>
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
