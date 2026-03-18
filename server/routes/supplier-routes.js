const express = require("express");

const router = express.Router();

const supplierController = require("../controllers/supplier-controller");

router.post("/", supplierController.createSupplier);
router.get("/", supplierController.getSuppliers);
router.get("/:id/", supplierController.getSupplierById);
router.put("/:id/", supplierController.updateById);

module.exports = router;
