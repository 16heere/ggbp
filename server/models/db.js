const { Pool } = require("pg");
require("dotenv").config();

// PostgreSQL connection pool
const db = new Pool({
    connectionString: process.env.DB_URL,
    ssl:
        process.env.NODE_ENV === "production"
            ? { rejectUnauthorized: false }
            : false,
});

db.on("connect", () => {
    console.log("Connected to the PostgreSQL database.");
});

db.on("error", (err) => {
    console.error("PostgreSQL connection error:", err.message);
    process.exit(-1);
});

module.exports = db;
