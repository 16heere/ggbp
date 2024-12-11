const adminOnly = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ message: "Access denied: admin only" });
    }
    next();
};

module.exports = { adminOnly };
