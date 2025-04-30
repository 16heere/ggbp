const jwt = require("jsonwebtoken");
const db = require("../models/db");

const protect = async (req, res, next) => {
    let token = req.cookies.token;

    if (!token) {
        return res
            .status(401)
            .json({ message: "Not authorized, token missing" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const query = `
            SELECT u.id, u.email, u.is_admin, s.status, s.type
            FROM users u
            LEFT JOIN subscriptions s ON u.id = s.user_id
            WHERE u.id = $1;
        `;
        const result = await db.query(query, [decoded.id]);

        if (result.rows.length === 0) {
            return res
                .status(403)
                .json({ message: "Access denied: user not found" });
        }

        const user = result.rows[0];
        if (!user.status && !user.is_admin) {
            return res.status(403).json({
                message: "Access denied: not subscribed or admin",
            });
        }

        req.user = {
            id: user.id,
            email: user.email,
            is_admin: user.is_admin,
            subscription_status: user.status,
            subscription_type: user.type,
        };

        next();
    } catch (error) {
        console.error("Authorization error:", error.message);
        return res
            .status(401)
            .json({ message: "Not authorized, token failed" });
    }
};

module.exports = { protect };
