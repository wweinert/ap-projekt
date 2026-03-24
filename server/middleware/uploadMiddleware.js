const path = require("path");
const fs = require("fs");
const multer = require("multer");
const reportImageDir = path.join(__dirname, "../uploads/reports/images");

if (!fs.existsSync(reportImageDir)) {
    fs.mkdirSync(reportImageDir, { recursive: true });
}
const storage = multer.diskStorage({
    destination: (_res, _file, cb) => {
        cb(null, reportImageDir);
    },
    filename: (_req, file, cb) => {
        const originalExtension = path.extname(file.originalname || "").toLowerCase();
        const extension = originalExtension || ".jpg";

        cb(null, `report_${Date.now()}_${Math.random() * 1_000_000}${extension}`);
    },
});

const fileFilter = (_req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (!allowedMimeTypes.includes(file.mimetype)) {
        return cd(new Error("Nur JPG JPEG PNG und WEBP sind erlaubt"));
    }

    cb(null, true);
};

exports.uploadReportImages = multer({
    storage,
    fileFilter,
    limits: {
        sileSize: 5 * 1024 * 1024,
        files: 5,
    },
}).array("images", 5);
