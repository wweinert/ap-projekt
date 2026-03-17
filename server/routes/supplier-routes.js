const express = require("express");

const router = express.Router();

const supplierController = require("../controllers/supplier-controller");

router.post("/", supplierController.createSupplier);
router.get("/", supplierController.getSuppliers);

module.exports = router;
