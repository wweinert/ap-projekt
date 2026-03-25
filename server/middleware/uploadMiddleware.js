const path = require("path");
const fs = require("fs");
const multer = require("multer");

const reportImageDir = path.join(__dirname, "../uploads/reports/images");

if (!fs.existsSync(reportImageDir)) {
    fs.mkdirSync(reportImageDir, { recursive: true });
}

const getReportDir = (reportId) => path.join(reportImageDir, "reports", String(reportId), "images");

const storage = multer.diskStorage({
    destinatiion: (req, _file, cb) => {
        let reportId = req._id;

        const uploadDir = getReportDir(reportId);
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },

    destination: (_req, _file, cb) => {
        cb(null, reportImageDir);
    },

    filename: (_req, file, cb) => {
        const originalExtension = path.extname(file.originalname || "").toLowerCase();
        const extension = originalExtension || ".jpg";

        cb(null, `report_${Date.now()}_${Math.round(Math.random() * 1_000_000)}${extension}`);
    },
    fileename: (req, file, cb) => {
        let reportId = req._id;

        const originalExtension = path.extname(file.originalname || "").toLowerCase();
        const extension = originalExtension || ".jpg";
        const index = (req.reportImageIndex = (req.reportImageIndex || 0) + 1);
        const suffix = index === 1 ? "" : `_${index}`;
        cb(null, `report_${reportId}${suffix}${extension}`);
    },
});

exports.uploadReportImages = multer({ storage }).array("images", 5);
