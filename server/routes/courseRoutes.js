const express = require("express");
const {
    loginUser,
    addVideo,
    removeVideo,
    getVideos,
    getUser,
    getVideoById,
    updateVideoPositions,
    getUserProgress,
    updateWatchedSeconds,
    unsubscribeUser,
} = require("../controllers/courseController");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const multer = require("multer");
const multerS3 = require("multer-s3-v2");
const { s3 } = require("../config/digitalOceanConfig");

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: "ggbp", // Your Spaces bucket
        acl: "private",
        key: function (req, file, cb) {
            cb(null, `videos/${Date.now()}-${file.originalname}`);
        },
    }),
});

const router = express.Router();

// User routes
router.post("/login", loginUser); // Login

//subscribe
router.post("/unsubscribe", protect, unsubscribeUser);

router.get("/user", protect, getUser);
router.get("/user-progress", protect, getUserProgress); // Protect this route

router.get("/videos", protect, getVideos);
router.post("/videos/watched", protect, updateWatchedSeconds);
router.get("/videos/:id", protect, getVideoById);
// Admin routes
router.post("/videos", protect, adminOnly, upload.single("video"), addVideo); // Add a video
router.delete("/videos/:id", protect, adminOnly, removeVideo); // Remove a video
router.post(
    "/videos/update-position",
    protect,
    adminOnly,
    updateVideoPositions
);
router.get("/videos", protect, getVideos); // Get all videos (accessible to all users)

module.exports = router;
