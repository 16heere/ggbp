import axios from "axios";
import React, { useState } from "react";

const AdminResearchPanel = ({ refreshArticles }) => {
    const [formData, setFormData] = useState({
        title: "",
        subtitle: "",
        content: "",
        image: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, image: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append("title", formData.title);
        data.append("subtitle", formData.subtitle);
        data.append("content", formData.content);
        if (formData.image) data.append("news-image", formData.image);

        try {
            const token = localStorage.getItem("token");
            await axios.post(
                `${process.env.REACT_APP_API_ENDPOINT}/courses/research`,
                data,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            alert("Article added successfully!");
            document.getElementById("title-input").value = "";
            document.getElementById("subtitle-input").value = "";
            document.getElementById("content-input").value = "";
            document.getElementById("image-input").value = "";
            if (refreshArticles) refreshArticles();
        } catch (error) {
            console.error("Error adding article:", error);
        }
    };

    return (
        <div className="admin-research-panel">
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="title"
                    id="title-input"
                    placeholder="Title"
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="subtitle"
                    id="subtitle-input"
                    placeholder="Subtitle"
                    onChange={handleChange}
                />
                <textarea
                    name="content"
                    id="content-input"
                    placeholder="Body content"
                    onChange={handleChange}
                />
                <input
                    type="file"
                    id="image-input"
                    accept="image/*"
                    name="image"
                    onChange={handleFileChange}
                />
                <button type="submit">Add Article</button>
            </form>
        </div>
    );
};

export default AdminResearchPanel;
