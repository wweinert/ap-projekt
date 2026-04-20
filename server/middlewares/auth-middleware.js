const jwt = require("jsonwebtoken");

exports.requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Nicht angemeldet" });
    }

    const token = authHeader.substring(7);

    try {
        const payload = jwt.verify(token, process.env.SECRET_KEY);
        req.user = payload;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Token ungültig oder abgelaufen" });
    }
};

exports.requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: "Keine Berechtigung" });
        }

        next();
    };
};
