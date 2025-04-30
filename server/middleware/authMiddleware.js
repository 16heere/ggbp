const jwt = require("jsonwebtoken");
const db = require("../models/db");

const protect = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res
            .status(401)
            .json({ message: "Not authorized, token missing" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const result = await db.query(
            "SELECT id, email, is_admin, token FROM users WHERE id = $1",
            [decoded.id]
        );

        if (result.rows.length === 0) {
            return res
                .status(403)
                .json({ message: "Access denied: user not found" });
        }

        const user = result.rows[0];

        if (user.token !== token) {
            return res
                .status(401)
                .json({ message: "Session invalid or logged in elsewhere" });
        }

        req.user = {
            id: user.id,
            email: user.email,
            is_admin: user.is_admin,
        };

        next();
    } catch (error) {
        return res
            .status(401)
            .json({ message: "Not authorized, token invalid or expired" });
    }
};

module.exports = { protect };
