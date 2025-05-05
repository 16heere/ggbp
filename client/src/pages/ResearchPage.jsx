import React, { useContext, useEffect, useState } from "react";
import ResearchCard from "../components/ResearchCard";
import { UserContext } from "../context/userContext";
import AdminResearchPanel from "../components/AdminResearchPanel";
import axios from "axios";

const ResearchPage = () => {
    const { user } = useContext(UserContext);
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchArticles = async () => {
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_API_ENDPOINT}/courses/research`,
                { withCredentials: true }
            );
            setArticles(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching articles: ", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArticles();
    }, []);

    const handleRemove = (id) => {
        setArticles((prev) => prev.filter((article) => article.id !== id));
    };

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
    return (
        <div className="research-page">
            <h1>Research Articles</h1>
            {console.log(loading)}
            {user?.is_admin && (
                <AdminResearchPanel
                    key={user.id}
                    refreshArticles={fetchArticles}
                />
            )}
            <div className="articles">
                {articles.map((article) => (
                    <>
                        <ResearchCard
                            key={article.id}
                            article={article}
                            onRemove={handleRemove}
                        />
                    </>
                ))}
            </div>
        </div>
    );
};

export default ResearchPage;
