const { Pool } = require("pg");
require("dotenv").config();

// PostgreSQL connection pool
const db = new Pool({
    host: process.env.DB_HOST, // e.g., 'localhost'
    user: process.env.DB_USER, // Your PostgreSQL user
    password: process.env.DB_PASSWORD, // Your PostgreSQL password
    database: process.env.DB_NAME, // Your PostgreSQL database name
    port: process.env.DB_PORT || 5432, // Default PostgreSQL port
    max: 10, // Maximum number of connections
});

db.on("connect", () => {
    console.log("Connected to the PostgreSQL database.");
});

db.on("error", (err) => {
    console.error("PostgreSQL connection error:", err.message);
    process.exit(-1);
});

module.exports = db;
