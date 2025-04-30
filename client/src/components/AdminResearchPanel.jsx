import axios from "axios";
import React, { useState } from "react";

const AdminResearchPanel = ({ refreshArticles }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        subtitle: "",
        content: "",
        image: "",
        isPremium: false,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleCheckboxChange = (e) => {
        setFormData({ ...formData, isPremium: e.target.checked });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, image: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (
            !formData.title ||
            !formData.subtitle ||
            !formData.content ||
            !formData.image
        ) {
            alert("Please fill in all fields before submitting.");
            return;
        }

        if (loading) return;
        setLoading(true);

        const data = new FormData();
        data.append("title", formData.title);
        data.append("subtitle", formData.subtitle);
        data.append("content", formData.content);
        data.append("isPremium", formData.isPremium);
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
        } finally {
            setLoading(false);
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
                <label class="checkmark-container">
                    <input
                        type="checkbox"
                        name="isPremium"
                        checked={formData.isPremium}
                        onChange={handleCheckboxChange}
                    />
                    <div class="checkmark">
                        <svg
                            width="800px"
                            height="800px"
                            viewBox="0 0 36 36"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                            role="img"
                            class="icon No"
                            preserveAspectRatio="xMidYMid meet"
                        >
                            <circle
                                fill="#E6E7E8"
                                cx="18"
                                cy="18"
                                r="18"
                            ></circle>
                        </svg>
                        <p class="No name">Not Premium</p>
                        <svg
                            fill="#000000"
                            width="800px"
                            height="800px"
                            viewBox="0 0 32 32"
                            version="1.1"
                            class="icon Yes"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M31.835 9.233l-4.371-8.358c-0.255-0.487-0.915-0.886-1.464-0.886h-10.060c-0.011-0.001-0.022-0.003-0.033-0.004-0.009 0-0.018 0.003-0.027 0.004h-9.88c-0.55 0-1.211 0.398-1.47 0.883l-4.359 8.197c-0.259 0.486-0.207 1.248 0.113 1.696l15.001 20.911c0.161 0.224 0.375 0.338 0.588 0.338 0.212 0 0.424-0.11 0.587-0.331l15.247-20.758c0.325-0.444 0.383-1.204 0.128-1.691zM29.449 8.988h-5.358l2.146-6.144zM17.979 1.99h6.436l-1.997 5.716zM20.882 8.988h-9.301l4.396-6.316zM9.809 8.034l-2.006-6.044h6.213zM21.273 10.988l-5.376 15.392-5.108-15.392h10.484zM13.654 25.971l-10.748-14.983h5.776zM23.392 10.988h5.787l-11.030 15.018zM5.89 2.575l2.128 6.413h-5.539z"></path>
                        </svg>
                        <p class="Yes name">Premium</p>
                    </div>
                </label>
                <button type="submit" disabled={loading}>
                    {loading ? "Adding..." : "Add Article"}
                </button>
            </form>
        </div>
    );
};

export default AdminResearchPanel;
