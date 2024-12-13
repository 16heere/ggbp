const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../models/db");
const { s3 } = require("../config/digitalOceanConfig");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// Login user
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const query = `
            SELECT 
                u.id, 
                u.email, 
                u.password, 
                u.is_admin, 
                s.status AS subscription_status 
            FROM users u
            LEFT JOIN subscriptions s ON u.id = s.user_id
            WHERE u.email = $1
        `;
        const result = await db.query(query, [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const user = result.rows[0];
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = generateToken(user.id);

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                isAdmin: user.is_admin,
                isSubscribed: user.subscription_status,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Subscribe user
const subscribeUser = async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const query = `INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id`;
        const result = await db.query(query, [email, hashedPassword]);

        res.status(201).json({
            userId: result.rows[0].id,
            message: "User subscribed successfully.",
        });
    } catch (error) {
        if (error.code === "23505") {
            res.status(400).json({ message: "User already exists" });
        } else {
            res.status(500).json({
                message: "Error subscribing user",
                error: error.message,
            });
        }
    }
};

// Create subscription (dummy implementation for testing)
const createSubscription = async (req, res) => {
    res.status(200).json({ message: "Subscription created successfully." });
};

const getUserProgress = async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch the user's watched minutes
        const userResult = await db.query(
            "SELECT SUM(watched_duration) AS watched_duration FROM user_video_watch WHERE user_id = $1",
            [userId]
        );
        const watchedSeconds = userResult.rows[0].watched_duration;

        // Fetch total video duration
        const videoResult = await db.query(
            "SELECT SUM(duration) AS total_duration FROM videos"
        );
        const totalDuration = videoResult.rows[0].total_duration;
        // Calculate progress
        const progress =
            totalDuration > 0 ? (watchedSeconds / totalDuration) * 100 : 0;
        res.status(200).json({ progress });
    } catch (error) {
        console.error("Error fetching progress:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

const getUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const query = `
            SELECT 
                u.id, 
                u.email, 
                u.password, 
                u.is_admin, 
                s.status AS subscription_status 
            FROM users u
            LEFT JOIN subscriptions s ON u.id = s.user_id
            WHERE u.id = $1
        `;
        const result = await db.query(query, [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error fetching user data:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};
const addVideo = async (req, res) => {
    if (!req.user.isAdmin) {
        return res
            .status(403)
            .json({ message: "Access denied: Admin privileges required" });
    }

    const { title, position, duration, level } = req.body;
    const videoFile = req.files.video ? req.files.video[0] : null; // Get video file
    const powerpointFile = req.files.powerpoint
        ? req.files.powerpoint[0]
        : null;

    if (!title || !videoFile || position === undefined) {
        return res
            .status(400)
            .json({ message: "Title, video file, and position are required" });
    }

    try {
        // videoFile.key will be something like "videos/1632840923-YourVideoName.mp4"
        const videoKey = videoFile.key;
        const powerpointKey = powerpointFile ? powerpointFile.key : null;

        // Insert video metadata (without binary data) into the database
        const insertQuery = `
        INSERT INTO videos (title, s3_key, position, duration, level, powerpoint_key)
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
      `;
        const result = await db.query(insertQuery, [
            title,
            videoKey,
            position,
            duration,
            level,
            powerpointKey,
        ]);
        const newVideoId = result.rows[0].id;

        res.status(201).json({
            id: newVideoId,
            title,
            position,
            s3_key: videoKey,
            powerpoint_key: powerpointKey,
            duration,
            level,
            message: "Video added successfully",
        });
    } catch (error) {
        console.error("Error adding video:", error.message);
        if (error.code === "23505") {
            res.status(400).json({
                message: "Video position or title conflict",
            });
        } else {
            res.status(500).json({ message: "Server error" });
        }
    }
};

const removeVideo = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    if (!req.user.isAdmin) {
        return res.status(403).json({ message: "Access denied: Admin only" });
    }

    try {
        // 1. Fetch the video details first to get s3_key and duration
        const videoResult = await db.query(
            "SELECT s3_key, duration, position, level FROM videos WHERE id = $1",
            [id]
        );

        if (videoResult.rows.length === 0) {
            return res.status(404).json({ message: "Video not found" });
        }

        const { s3_key, duration, position, level } = videoResult.rows[0];

        // 2. Find all users who watched this video
        const usersWhoWatched = await db.query(
            "SELECT user_id FROM user_video_watch WHERE video_id = $1",
            [id]
        );

        // 3. Delete quizzes associated with the video
        const quizResult = await db.query(
            "SELECT id FROM quizzes WHERE video_id = $1",
            [id]
        );
        const quizIds = quizResult.rows.map((row) => row.id);

        // Delete user attempts for the quizzes
        if (quizIds.length > 0) {
            await db.query(
                "DELETE FROM quiz_attempts WHERE quiz_id = ANY($1::uuid[])",
                [quizIds]
            );

            // Delete questions for the quizzes
            await db.query(
                "DELETE FROM quiz_questions WHERE quiz_id = ANY($1::uuid[])",
                [quizIds]
            );

            // Delete quizzes
            await db.query("DELETE FROM quizzes WHERE id = ANY($1::uuid[])", [
                quizIds,
            ]);
        }

        // 3. Delete references from user_video_watch
        await db.query("DELETE FROM user_video_watch WHERE video_id = $1;", [
            id,
        ]);

        // 4. Delete from videos table
        const deleteResult = await db.query(
            "DELETE FROM videos WHERE id = $1 RETURNING id;",
            [id]
        );

        if (deleteResult.rowCount === 0) {
            // If for some reason the video wasn't actually deleted, return an error
            return res
                .status(404)
                .json({ message: "Video not found in videos table" });
        }

        await db.query(
            "UPDATE videos SET position = position - 1 WHERE position > $1 AND level = $2;",
            [position, level]
        );

        // 5. Update watched_seconds for each user who watched this video
        const userIds = usersWhoWatched.rows.map((row) => row.user_id);
        for (const userId of userIds) {
            await db.query(
                "UPDATE users SET watched_seconds = watched_seconds - $1 WHERE id = $2",
                [duration, userId]
            );
        }

        await new Promise((resolve, reject) => {
            s3.deleteObject(
                {
                    Bucket: "ggbp", // Your bucket name
                    Key: s3_key, // The key of the object to delete
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

        res.status(200).json({ message: "Video removed successfully" });
    } catch (error) {
        console.error("Error removing video:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

// Get all videos
const getVideos = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await db.query(
            `
        SELECT 
            v.id, 
            v.title, 
            v.position, 
            v.duration, 
            v.level, 
            v.powerpoint_key,
            COALESCE(uv.watched_duration >= v.duration, false) AS watched
        FROM videos v
        LEFT JOIN user_video_watch uv 
        ON v.id = uv.video_id AND uv.user_id = $1
        ORDER BY v.position ASC
        `,
            [userId]
        );
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getVideoById = async (req, res) => {
    const { id } = req.params;

    try {
        const query = "SELECT s3_key, powerpoint_key FROM videos WHERE id = $1";
        const result = await db.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Video not found" });
        }

        const { s3_key, powerpoint_key } = result.rows[0];

        const signedUrl = s3.getSignedUrl("getObject", {
            Bucket: "ggbp",
            Key: s3_key,
            Expires: 3600,
        });

        let powerpointSignedUrl = null;
        if (powerpoint_key) {
            powerpointSignedUrl = await s3.getSignedUrlPromise("getObject", {
                Bucket: "ggbp",
                Key: powerpoint_key,
                Expires: 3600,
            });
        }

        // Return the signed URL as JSON (instead of sending binary data)
        res.status(200).json({
            url: signedUrl,
            powerpointUrl: powerpointSignedUrl,
        });
    } catch (error) {
        console.error("Error fetching video:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

const updateVideoPositions = async (req, res) => {
    const { positions } = req.body; // Array of { id, position, level }
    console.log("Positions Payload:", positions);

    if (!Array.isArray(positions)) {
        return res
            .status(400)
            .json({ message: "Positions must be an array of objects" });
    }

    let client;

    try {
        client = await db.connect(); // Use transactions for atomic updates
        await client.query("BEGIN");

        const groupedPositions = positions.reduce((acc, curr) => {
            acc[curr.level] = acc[curr.level] || [];
            acc[curr.level].push(curr);
            return acc;
        }, {});

        for (const [level, levelPositions] of Object.entries(
            groupedPositions
        )) {
            await client.query(
                "SELECT id FROM videos WHERE level = $1 FOR UPDATE",
                [level]
            );

            // Temporarily clear positions
            const tempPosition = -100000;
            await client.query(
                "UPDATE videos SET position = position + $1 WHERE level = $2",
                [tempPosition, level]
            );

            // Reassign positions
            for (const { id, position } of levelPositions) {
                await client.query(
                    "UPDATE videos SET position = $1 WHERE id = $2 AND level = $3",
                    [position, id, level]
                );
            }
        }

        await client.query("COMMIT");

        // Fetch the updated videos
        const updatedVideos = await client.query(`
            SELECT * 
            FROM videos
            ORDER BY 
                CASE 
                    WHEN level = 'beginner' THEN 1
                    WHEN level = 'intermediate' THEN 2
                    WHEN level = 'advanced' THEN 3
                    ELSE 4 -- Optional: for unexpected levels
                END,
                position
        `);
        res.status(200).json({
            message: "Positions updated successfully",
            videos: updatedVideos.rows,
        });
    } catch (error) {
        console.error("Error updating video positions:", error.message);
        await client.query("ROLLBACK");
        res.status(500).json({ message: "Server error" });
    } finally {
        client.release();
    }
};

const updateWatchedSeconds = async (req, res) => {
    try {
        const { videoId, videoDuration } = req.body;
        const userId = req.user.id;

        // Check if the video has already been watched
        const watchedCheck = await db.query(
            "SELECT COUNT(*) FROM user_video_watch WHERE user_id = $1 AND video_id = $2",
            [userId, videoId]
        );

        if (watchedCheck.rows[0].count > 0) {
            return res.status(200).json({ message: "Video already watched." });
        }

        // Add to user_video_watch
        await db.query(
            "INSERT INTO user_video_watch (user_id, video_id, watched_duration) VALUES ($1, $2, $3)",
            [userId, videoId, videoDuration]
        );

        // Update user's watched_seconds
        await db.query(
            "UPDATE users SET watched_seconds = watched_seconds + $1 WHERE id = $2",
            [videoDuration, userId]
        );

        res.status(200).json({
            message: "Watched seconds updated successfully.",
        });
    } catch (error) {
        console.error("Error updating watched seconds:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

const unsubscribeUser = async (req, res) => {
    try {
        const userId = req.user.id;

        // Update subscription status to 'inactive'
        await db.query(
            "UPDATE subscriptions SET status = false WHERE user_id = $1",
            [userId]
        );

        res.status(200).json({
            message: "You have successfully unsubscribed.",
        });
    } catch (error) {
        console.error("Error unsubscribing user:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};
const resubscribeUser = async (req, res) => {
    try {
        const userId = req.user.id;

        // Update subscription status to 'active'
        await db.query(
            "UPDATE subscriptions SET status = true WHERE user_id = $1",
            [userId]
        );

        res.status(200).json({
            message: "You have successfully resubscribed.",
        });
    } catch (error) {
        console.error("Error resubscribing user:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

const addQuiz = async (req, res) => {
    const { videoId, title, questions } = req.body;

    try {
        const quizResult = await db.query(
            "INSERT INTO quizzes (video_id, title) VALUES ($1, $2) RETURNING id",
            [videoId, title]
        );

        const quizId = quizResult.rows[0].id;

        for (const question of questions) {
            await db.query(
                "INSERT INTO quiz_questions (quiz_id, question, options, correct_option) VALUES ($1, $2, $3, $4)",
                [
                    quizId,
                    question.text,
                    JSON.stringify(question.options),
                    question.correctOption,
                ]
            );
        }

        res.status(201).json({ message: "Quiz added successfully" });
    } catch (error) {
        console.error("Error adding quiz:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

const getQuiz = async (req, res) => {
    const { videoId } = req.params;

    try {
        const quiz = await db.query(
            "SELECT * FROM quizzes WHERE video_id = $1",
            [videoId]
        );

        if (!quiz.rows.length) {
            return res.status(404).json({ message: "Quiz not found" });
        }

        const questions = await db.query(
            "SELECT * FROM quiz_questions WHERE quiz_id = $1",
            [quiz.rows[0].id]
        );

        res.status(200).json({
            quiz: quiz.rows[0],
            questions: questions.rows,
        });
    } catch (error) {
        console.error("Error fetching quiz:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

const addQuizAttempt = async (req, res) => {
    const { quizId } = req.params;
    const { userId, answers } = req.body;

    try {
        const questions = await db.query(
            "SELECT id, correct_option FROM quiz_questions WHERE quiz_id = $1",
            [quizId]
        );

        let score = 0;

        questions.rows.forEach((question) => {
            if (answers[question.id] === question.correct_option) {
                score++;
            }
        });

        await db.query(
            "INSERT INTO quiz_attempts (user_id, quiz_id, score) VALUES ($1, $2, $3)",
            [userId, quizId, score]
        );

        res.status(200).json({ score, total: questions.rows.length });
    } catch (error) {
        console.error("Error submitting quiz:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

const removeQuiz = async (req, res) => {
    const { quizId } = req.params;

    try {
        await db.query("BEGIN");

        // Delete user attempts associated with the quiz
        await db.query("DELETE FROM quiz_attempts WHERE quiz_id = $1", [
            quizId,
        ]);

        // Delete questions associated with the quiz
        await db.query("DELETE FROM quiz_questions WHERE quiz_id = $1", [
            quizId,
        ]);

        // Delete the quiz
        await db.query("DELETE FROM quizzes WHERE id = $1", [quizId]);

        await db.query("COMMIT");
        res.status(200).json({ message: "Quiz removed successfully" });
    } catch (error) {
        await db.query("ROLLBACK");
        console.error("Error removing quiz:", error.message);
        res.status(500).json({ message: "Failed to remove quiz" });
    }
};

module.exports = {
    loginUser,
    subscribeUser,
    createSubscription,
    addVideo,
    removeVideo,
    getVideos,
    getUser,
    getVideoById,
    updateVideoPositions,
    getUserProgress,
    updateWatchedSeconds,
    unsubscribeUser,
    resubscribeUser,
    addQuiz,
    addQuizAttempt,
    getQuiz,
    removeQuiz,
};
