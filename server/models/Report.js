const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reportShema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    status: { type: String, enum: ["OK", "DEFECT"], required: true },
    supplierId: { type: Schema.Types.ObjectId, ref: "Supplier", required: true },
    images: { type: [String], default: [] },
    createdAt: { type: String, default: Date() },
});

module.exports = mongoose.model("Report", reportShema);
