const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../models/db");
const { s3 } = require("../config/digitalOceanConfig");

// Login user
const loginUser = async (req, res) => {
    console.log(req.body);
    const { email, password } = req.body;
    try {
        const result = await db.query(
            `
            SELECT u.id, u.email, u.password, u.is_admin, u.is_logged_in, s.status AS subscription_status
            FROM users u
            LEFT JOIN subscriptions s ON u.id = s.user_id
            WHERE u.email = $1
        `,
            [email]
        );
        if (result.rows.length === 0) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const user = result.rows[0];
        const match = await bcrypt.compare(password, user.password);
        console.log(match);
        if (!match)
            return res.status(401).json({ message: "Invalid credentials" });

        if (user.is_logged_in) {
            return res
                .status(403)
                .json({ message: "User already logged in elsewhere" });
        }

        await db.query("UPDATE users SET is_logged_in = TRUE WHERE id = $1", [
            user.id,
        ]);

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: "30d",
        });

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "Strict", // or "Lax" depending on your use case
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });

        res.json({
            user: {
                id: user.id,
                email: user.email,
                isAdmin: user.is_admin,
                isSubscribed: user.subscription_status,
            },
        });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

const logoutUser = async (req, res) => {
    const userId = req.user.id;
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
        });
        await db.query("UPDATE users SET is_logged_in = FALSE WHERE id = $1", [
            userId,
        ]);

        res.status(200).json({ message: "Logged out" });

        await db.query("UPDATE users SET is_logged_in = FALSE WHERE id = $1", [
            userId,
        ]);
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({
            message: "Logout failed",
            error: error.message,
        });
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

        // Fetch user's watched duration per level
        const levelProgressQuery = `
            SELECT v.level, 
                   SUM(uv.watched_duration) AS watched_duration,
                   SUM(v.duration) AS total_duration
            FROM videos v
            LEFT JOIN user_video_watch uv 
            ON v.id = uv.video_id AND uv.user_id = $1
            GROUP BY v.level;
        `;
        const levelProgressResult = await db.query(levelProgressQuery, [
            userId,
        ]);

        // Structure level-wise progress
        const levelProgress = {};
        let totalWatched = 0;
        let totalDuration = 0;

        levelProgressResult.rows.forEach((row) => {
            const watched = row.watched_duration || 0;
            const duration = row.total_duration || 1; // Avoid division by zero
            levelProgress[row.level] = (watched / duration) * 100;

            // Aggregate total progress
            totalWatched += watched;
            totalDuration += duration;
        });

        // Compute overall progress
        const overallProgress =
            totalDuration > 0 ? (totalWatched / totalDuration) * 100 : 0;

        res.status(200).json({
            overallProgress: overallProgress.toFixed(2),
            levelProgress,
        });
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

        const positionQuery = `
            SELECT COALESCE(MAX(position), 0) + 1 AS next_position
            FROM videos
            WHERE level = $1
        `;
        const positionResult = await db.query(positionQuery, [level]);
        const position = positionResult.rows[0].next_position;

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

    if (!req.user.isAdmin) {
        return res.status(403).json({ message: "Access denied: Admin only" });
    }

    try {
        // 1. Fetch the video details to get position and level
        const videoResult = await db.query(
            "SELECT s3_key, duration, position, level FROM videos WHERE id = $1",
            [id]
        );

        if (videoResult.rows.length === 0) {
            return res.status(404).json({ message: "Video not found" });
        }

        const { s3_key, duration, position, level } = videoResult.rows[0];

        // 2. Delete all references to the video
        await db.query("DELETE FROM user_video_watch WHERE video_id = $1", [
            id,
        ]);
        await db.query("DELETE FROM quizzes WHERE video_id = $1", [id]);
        await db.query("DELETE FROM quiz_attempts WHERE video_id = $1", [id]);

        // 3. Delete the video from the database
        const deleteResult = await db.query(
            "DELETE FROM videos WHERE id = $1 RETURNING id",
            [id]
        );

        if (deleteResult.rowCount === 0) {
            return res
                .status(404)
                .json({ message: "Video not found in videos table" });
        }

        // 4. Assign temporary positions to affected videos
        await db.query(
            "UPDATE videos SET position = -position WHERE level = $1 AND position > $2",
            [level, position]
        );

        // 5. Reassign the correct positions for videos in the same level
        const updatePositionsQuery = `
            WITH reordered_videos AS (
                SELECT id, ROW_NUMBER() OVER (ORDER BY position ASC) AS new_position
                FROM videos
                WHERE level = $1
            )
            UPDATE videos
            SET position = reordered_videos.new_position
            FROM reordered_videos
            WHERE videos.id = reordered_videos.id;
        `;
        await db.query(updatePositionsQuery, [level]);

        // 6. Delete the video file from the S3 bucket
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
        res.status(500).json({ message: "Server error", error: error.message });
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
    const { positions } = req.body;
    if (!Array.isArray(positions)) {
        return res
            .status(400)
            .json({ message: "Positions must be an array of objects" });
    }

    let client;

    try {
        client = await db.connect();
        await client.query("BEGIN");

        // Step 1: Assign temporary positions to break conflicts
        for (const { id, level } of positions) {
            const tempQuery = `
                UPDATE videos
                SET position = -position -- Temporarily set to a negative value
                WHERE id = $1 AND level = $2
            `;
            await client.query(tempQuery, [id, level]);
        }

        // Step 2: Assign the new positions from the request
        for (const { id, position, level } of positions) {
            const updateQuery = `
                UPDATE videos
                SET position = $1, level = $2
                WHERE id = $3
            `;
            await client.query(updateQuery, [position, level, id]);
        }

        await client.query("COMMIT");

        const updatedVideos = await client.query(`
            SELECT * FROM videos ORDER BY level, position
        `);

        res.status(200).json({ videos: updatedVideos.rows });
    } catch (error) {
        console.error("Error updating positions:", error.message);
        if (client) await client.query("ROLLBACK");
        res.status(500).json({ message: "Server error", error: error.message });
    } finally {
        if (client) client.release();
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

const createQuiz = async (req, res) => {
    const { payload } = req.body;
    const { videoId, questions } = payload;

    try {
        const query = `
            INSERT INTO quizzes (video_id, question, options, answer, image_url)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, video_id, question, options, answer, image_url
        `;
        const quizAttemptQuery = `DELETE from quiz_attempts WHERE video_id = $1`;
        await db.query(quizAttemptQuery, [videoId]);

        const insertedQuestions = [];
        for (const { question, options, answer, image_url } of questions) {
            const result = await db.query(query, [
                videoId,
                question,
                JSON.stringify(options),
                answer,
                image_url || null,
            ]);
            insertedQuestions.push(result.rows[0]);
        }

        res.status(201).json(insertedQuestions);
    } catch (error) {
        console.error("Error creating quiz:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

const updateQuiz = async (req, res) => {
    const { id } = req.params; // id represents one of the quiz rows

    try {
        // Fetch the original quiz's video_id and title
        const quizQuery = `SELECT video_id FROM quizzes WHERE id = $1`;
        const quizResult = await db.query(quizQuery, [id]);

        if (quizResult.rows.length === 0) {
            return res.status(404).json({ message: "Quiz not found" });
        }

        const { video_id, title: oldTitle } = quizResult.rows[0];
        // Update all rows for this quiz (matching video_id and oldTitle)
        const updateQuery = `
            UPDATE quizzes
            SET title = $1
            WHERE video_id = $2 AND title = $3
            RETURNING id, title
        `;
        const result = await db.query(updateQuery, [title, video_id, oldTitle]);

        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error updating quiz:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

const deleteQuiz = async (req, res) => {
    const { id } = req.params;

    try {
        // Delete all rows for this quiz
        await db.query(`DELETE FROM quizzes WHERE id = $1`, [id]);

        res.status(200).json({ message: "Quiz deleted successfully" });
    } catch (error) {
        console.error("Error deleting quiz:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

const getQuizzesByVideo = async (req, res) => {
    const { videoId } = req.params;

    try {
        const query = `
            SELECT id as quizId, question, options, answer, image_url
            FROM quizzes
            WHERE video_id = $1
        `;
        const result = await db.query(query, [videoId]);
        const updatedRows = await Promise.all(
            result.rows.map(async (row) => {
                if (row.image_url) {
                    const signedUrl = await s3.getSignedUrlPromise(
                        "getObject",
                        {
                            Bucket: "ggbp",
                            Key: row.image_url,
                            Expires: 3600, // 1 hour
                        }
                    );
                    return { ...row, image_url: signedUrl };
                }
                return row;
            })
        );

        res.status(200).json(updatedRows);
    } catch (error) {
        console.error("Error fetching quizzes:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

const getQuizAttempt = async (req, res) => {
    const userId = req.user.id;
    const { videoId } = req.params;

    try {
        const query = `
            SELECT * FROM quiz_attempts
            WHERE user_id = $1 AND video_id = $2;
        `;
        const result = await db.query(query, [userId, videoId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "No quiz attempt found." });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Error fetching quiz attempt:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};
const setQuizAttempt = async (req, res) => {
    const { userId, videoId, score, totalQuestions } = req.body;

    try {
        const query = `
        INSERT INTO quiz_attempts (user_id, video_id, score, total_questions)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id, video_id)
        DO UPDATE SET score = $3, total_questions = $4, completed_at = NOW()
        RETURNING *;
    `;
        const values = [userId, videoId, score, totalQuestions];
        const result = await db.query(query, values);

        res.status(201).json({
            message: "Quiz score saved successfully!",
            attempt: result.rows[0],
        });
    } catch (error) {
        console.error("Error saving quiz score:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

const deleteQuizAttempt = async (req, res) => {
    const userId = req.user.id;
    const { videoId } = req.params;

    try {
        // Delete all rows for this quiz
        await db.query(
            `DELETE FROM quiz_attempts WHERE user_id = $1 AND video_id = $2`,
            [userId, videoId]
        );

        res.status(200).json({ message: "Quiz deleted successfully" });
    } catch (error) {
        console.error("Error deleting quiz:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

const showWeeklyOutlooks = async (req, res) => {
    try {
        const userId = req.user.id;
        const query = `
            SELECT 
                v.id, 
                v.title, 
                v.s3_key, 
                v.duration,
                COALESCE(uv.watched_duration >= v.duration, false) AS watched
            FROM videos v
            LEFT JOIN user_video_watch uv
            ON v.id = uv.video_id AND uv.user_id = $1
            WHERE v.level = 'weekly outlooks'
            ORDER BY v.position DESC
        `;
        const result = await db.query(query, [userId]);

        const videosWithSignedUrl = result.rows.map((video) => {
            const signedUrl = s3.getSignedUrl("getObject", {
                Bucket: "ggbp",
                Key: video.s3_key,
                Expires: 3600,
            });

            return {
                ...video,
                s3_key: signedUrl,
            };
        });

        res.status(200).json(videosWithSignedUrl);
    } catch (error) {
        console.error("Error fetching weekly outlooks:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

const toggleWatchedVideo = async (req, res) => {
    try {
        const { videoId, watched, watchedDuration } = req.body;
        const userId = req.user.id;

        if (watched) {
            // Add watched video to the database
            await db.query(
                `INSERT INTO user_video_watch (user_id, video_id, watched_duration) 
                 VALUES ($1, $2, $3)
                 ON CONFLICT (user_id, video_id) 
                 DO UPDATE SET watched_duration = $3`,
                [userId, videoId, watchedDuration]
            );

            res.status(200).json({ message: "Video marked as watched." });
        } else {
            // Remove video from watched list
            await db.query(
                `DELETE FROM user_video_watch WHERE user_id = $1 AND video_id = $2`,
                [userId, videoId]
            );

            res.status(200).json({ message: "Video unmarked as watched." });
        }
    } catch (error) {
        console.error("Error updating watched status:", error.message);
        res.status(500).json({ message: "Server error" });
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
    createQuiz,
    updateQuiz,
    deleteQuiz,
    getQuizzesByVideo,
    getQuizAttempt,
    setQuizAttempt,
    deleteQuizAttempt,
    showWeeklyOutlooks,
    toggleWatchedVideo,
    logoutUser,
};
