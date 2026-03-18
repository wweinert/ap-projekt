const express = require("express");

const router = express.Router();

const reportController = require("../controllers/report-controller");

router.get("/", reportController.getReports);
router.get("/:id", reportController.getReportById);
router.put("/:id", reportController.updateById);

router.delete("/:id/delete", reportController.deleteById);

router.post("/supplier/:supplierId", reportController.createReport);
router.get("/supplier/:supplierId", reportController.getByAllSupplierId);

module.exports = router;
