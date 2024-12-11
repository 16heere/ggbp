const db = require("./db");

// Create a new user
const createUser = async (userData) => {
    const { email, password } = userData;
    const query = `INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id`;
    const values = [email, password];
    const result = await db.query(query, values);
    return result.rows[0]; // Return the inserted user's ID
};

// Get a user by email
const getUserByEmail = async (email) => {
    const query = `SELECT * FROM users WHERE email = $1`;
    const result = await db.query(query, [email]);
    return result.rows[0]; // Return the user object
};

// Update progress for a user
const updateProgress = async (userId, progress) => {
    const query = `UPDATE users SET progress = $1 WHERE id = $2`;
    await db.query(query, [progress, userId]);
};

module.exports = { createUser, getUserByEmail, updateProgress };
