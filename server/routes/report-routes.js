const express = require("express");

const router = express.Router();

const reportController = require("../controllers/report-controller");
const { uploadReportImages } = require("../middlewares/uploadMiddleware");
const { requireAuth } = require("../middlewares/auth-middleware");
const ensureReportId = require("../middlewares/ensureReportId");

router.get("/", requireAuth, reportController.getReports);
router.get("/supplier/:supplierId", requireAuth, reportController.getAllBySupplierId);
router.get("/:id/pdf", requireAuth, reportController.generatePdfById);
router.get("/:id", requireAuth, reportController.getReportById);

router.post("/", requireAuth, ensureReportId, uploadReportImages, reportController.createReport);
router.patch("/:id", requireAuth, reportController.updateById);
router.delete("/:id/delete", requireAuth, reportController.deleteById);

module.exports = router;
