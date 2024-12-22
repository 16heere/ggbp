const jwt = require("jsonwebtoken");
const db = require("../models/db");

const protect = async (req, res, next) => {
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log(decoded);

            // Check if the user exists, is subscribed, and retrieve admin status
            const query = `
                SELECT u.is_admin, s.status 
                FROM users u
                LEFT JOIN subscriptions s ON u.id = s.user_id
                WHERE u.id = $1;
            `;
            const result = await db.query(query, [decoded.id]);

            if (result.rows.length === 0) {
                console.log("User is not subscribed.");
                return res
                    .status(403)
                    .json({ message: "Access denied: user not found" });
            }

            const user = result.rows[0];
            if (!user.status) {
                return res.status(403).json({
                    message: "Access denied: not subscribed or admin",
                });
            }

            // Attach user info to the request
            req.user = {
                id: decoded.id,
                isAdmin: user.is_admin,
                isSubscribed: user.status,
            };
            next(); // Proceed to the next middleware or route
        } catch (error) {
            console.error("Authorization error:", error.message);
            return res
                .status(401)
                .json({ message: "Not authorized, token failed" });
        }
    } else {
        return res.status(401).json({ message: "Not authorized, no token" });
    }
};

module.exports = { protect };
