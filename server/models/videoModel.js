// videoModel.js
const db = require("./db");

// Get videos by course ID
const getVideosByCourseId = async (courseId) => {
    const query = `SELECT * FROM videos WHERE course_id = $1`;
    const values = [courseId];
    const result = await db.query(query, values);
    return result.rows;
};

// Additional methods for videos can go here

module.exports = {
    getVideosByCourseId,
};
