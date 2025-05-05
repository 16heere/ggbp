const express = require("express");
const {
    loginUser,
    logoutUser,
    addVideo,
    removeVideo,
    getVideos,
    getUser,
    getVideoById,
    updateVideoPositions,
    getUserProgress,
    updateWatchedSeconds,
    unsubscribeUser,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    getQuizzesByVideo,
    getQuizAttempt,
    setQuizAttempt,
    deleteQuizAttempt,
    showWeeklyOutlooks,
    toggleWatchedVideo,
} = require("../controllers/courseController");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const multer = require("multer");
const multerS3 = require("multer-s3-v2");
const { s3 } = require("../config/digitalOceanConfig");
const {
    addResearchArticle,
    getResearchArticles,
    deleteResearchArticle,
    getResearchArticleById,
} = require("../controllers/researchController");

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: "ggbp",
        acl: "private",
        key: function (req, file, cb) {
            if (file.fieldname === "video") {
                cb(null, `videos/${Date.now()}-${file.originalname}`);
            } else if (file.fieldname === "powerpoint") {
                cb(null, `powerpoints/${Date.now()}-${file.originalname}`);
            } else if (file.fieldname === "image") {
                cb(null, `quiz-images/${Date.now()}-${file.originalname}`);
            } else if (file.fieldname === "news-image") {
                cb(null, `news-image/${Date.now()}-${file.originalname}`);
            } else {
                cb(new Error("Invalid field name for file upload."));
            }
        },
    }),
});

const router = express.Router();

const uploadImage = (req, res) => {
    try {
        // Check if the file was uploaded
        if (!req.files || !req.files.image || req.files.image.length === 0) {
            return res.status(400).json({ message: "No image file uploaded." });
        }

        // Get the uploaded image file metadata
        const uploadedImage = req.files.image[0];

        // Construct the storage key format (already provided by Multer S3)
        const imageKey = uploadedImage.key;

        res.status(200).json({ imageKey });
    } catch (error) {
        console.error("Error uploading quiz image:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// User routes
router.post("/login", loginUser); // Login
router.post("/logout", protect, logoutUser);
//subscribe
router.post("/unsubscribe", protect, unsubscribeUser);

router.get("/user", protect, getUser);
router.get("/user-progress", protect, getUserProgress); // Protect this route

router.get("/videos", protect, getVideos);
router.post("/videos/watched", protect, updateWatchedSeconds);
router.post("/videos/toggle-watched", protect, toggleWatchedVideo);

router.get("/videos/:id", protect, getVideoById);
// Admin routes
router.post(
    "/videos",
    (req, res, next) => {
        console.log("🔥 Received POST /videos");
        console.log("Origin:", req.headers.origin);
        console.log("Body:", req.body);
        next();
    },
    protect,
    adminOnly,
    upload.fields([
        { name: "video", maxCount: 1 },
        { name: "powerpoint", maxCount: 1 },
    ]),
    addVideo
); // Add a video
router.delete("/videos/:id", protect, adminOnly, removeVideo); // Remove a video
router.post(
    "/videos/update-position",
    protect,
    adminOnly,
    updateVideoPositions
);
router.get("/videos", protect, getVideos); // Get all videos (accessible to all users)

router.post("/quizzes", protect, adminOnly, createQuiz);
router.put("/quizzes/:id", protect, adminOnly, updateQuiz);
router.delete("/quizzes/:id", protect, adminOnly, deleteQuiz);

router.get("/videos/:videoId/quizzes", protect, getQuizzesByVideo);

router.get("/quiz-attempt/:videoId", protect, getQuizAttempt);
router.post("/quiz-attempt", protect, setQuizAttempt);
router.delete("/quiz-attempts/:videoId", protect, deleteQuizAttempt);
router.post(
    "/upload-image",
    protect,
    adminOnly,
    upload.fields([{ name: "image", maxCount: 1 }]),
    uploadImage
);

router.post(
    "/research",
    protect,
    adminOnly,
    upload.fields([{ name: "news-image", maxCount: 1 }]),
    addResearchArticle
);
router.get("/research", getResearchArticles);
router.delete("/research/:id", protect, adminOnly, deleteResearchArticle);
router.get("/research/:id", getResearchArticleById);

router.get("/weekly-outlooks", protect, showWeeklyOutlooks);

module.exports = router;
