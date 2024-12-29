const db = require("../models/db");
const { s3 } = require("../config/digitalOceanConfig");
const addResearchArticle = async (req, res) => {
    const { title, subtitle, content } = req.body;
    console.log(req.files["news-image"]);
    const image = req.files["news-image"]
        ? req.files["news-image"][0].key
        : null;

    try {
        const query = `
            INSERT INTO research_articles (title, subtitle, image, content)
            VALUES ($1, $2, $3, $4) RETURNING id, title, subtitle, image, content
        `;
        const result = await db.query(query, [title, subtitle, image, content]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error adding research article:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

const getResearchArticles = async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM research_articles");

        const articlesWithSignedUrls = result.rows.map((article) => {
            const article_key = article.image;
            const signedUrl = s3.getSignedUrl("getObject", {
                Bucket: "ggbp",
                Key: article_key,
                Expires: 3600,
            });
            return { ...article, image: signedUrl };
        });
        res.status(200).json(articlesWithSignedUrls);
    } catch (error) {
        console.error("Error fetching articles:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

const deleteResearchArticle = async (req, res) => {
    const { id } = req.params;
    console.log(id);
    try {
        const result = await db.query(
            "SELECT image from research_articles WHERE id = $1",
            [id]
        );
        console.log(result.rows);
        const article_key = result.rows[0].image;
        await db.query("DELETE FROM research_articles WHERE id = $1", [id]);
        await new Promise((resolve, reject) => {
            s3.deleteObject(
                {
                    Bucket: "ggbp",
                    Key: article_key,
                },
                (err, data) => {
                    if (err) {
                        console.error(
                            "Error deleting object from Spaces:",
                            err
                        );
                        return reject(err);
                    }
                    resolve(data);
                }
            );
        });

        res.status(200).json({ message: "Article deleted successfully." });
    } catch (error) {
        console.error("Error deleting article:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

const getResearchArticleById = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await db.query(
            "SELECT * from research_articles WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Article not found" });
        }

        const article_key = result.rows[0].image;
        let signedUrl = null;
        if (article_key) {
            signedUrl = s3.getSignedUrl("getObject", {
                Bucket: "ggbp",
                Key: article_key,
                Expires: 3600,
            });
        }

        const article = {
            ...result.rows[0],
            image: signedUrl,
        };

        res.status(200).json(article);
    } catch (error) {
        console.error("Error fetching article by ID:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    addResearchArticle,
    getResearchArticles,
    deleteResearchArticle,
    getResearchArticleById,
};
