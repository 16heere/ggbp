// courseModel.js
const db = require("./db");

// Get all courses
const getAllCourses = async () => {
    const query = `SELECT * FROM courses`;
    const result = await db.query(query);
    return result.rows;
};

// Get course by ID
const getCourseById = async (id) => {
    const query = `SELECT * FROM courses WHERE id = $1`;
    const values = [id];
    const result = await db.query(query, values);
    return result.rows[0];
};

// Create a new course
const createCourse = async (courseData) => {
    const { name, description, createdBy } = courseData;
    const query = `INSERT INTO courses (name, description, created_by) VALUES ($1, $2, $3) RETURNING *`;
    const values = [name, description, createdBy];
    const result = await db.query(query, values);
    return result.rows[0];
};

// Update a course
const updateCourse = async (id, courseData) => {
    const { name, description } = courseData;
    const query = `UPDATE courses SET name = $1, description = $2 WHERE id = $3 RETURNING *`;
    const values = [name, description, id];
    const result = await db.query(query, values);
    return result.rows[0];
};

// Delete a course
const deleteCourse = async (id) => {
    const query = `DELETE FROM courses WHERE id = $1`;
    const values = [id];
    await db.query(query, values);
};

module.exports = {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
};
