const mongoose = require("mongoose");

const supplierShema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    contactEmail: { type: String, trim: true },
    phone: { type: String, trim: true },
    notes: { type: String, trim: true },
    createdAt: { type: String },
    isActive: { type: Boolean },
});

module.exports = mongoose.model("Supplier", supplierShema);
