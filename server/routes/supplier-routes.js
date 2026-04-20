const express = require("express");

const router = express.Router();

const supplierController = require("../controllers/supplier-controller");
const { requireAuth, requireRole } = require("../middlewares/auth-middleware");

router.post("/", requireAuth, requireRole("admin"), supplierController.createSupplier);
router.get("/", requireAuth, supplierController.getSuppliers);
router.get("/:id/", requireAuth, supplierController.getSupplierById);
router.patch("/:id/", requireAuth, requireRole("admin"), supplierController.updateById);
router.patch("/:id/activity", requireAuth, requireRole("admin"), supplierController.setActivity);
router.get("/:id/pdf", requireAuth, supplierController.generatePdfById);

module.exports = router;
