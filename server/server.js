require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const PORT = process.env.PORT;
const DB_URL = process.env.DB_URL;
const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
const authRoutes = require("./routes/auth-routes.js");
const supplierRoutes = require("./routes/supplier-routes");
const reportRoutes = require("./routes/report-routes.js");

app.get("/health", (_req, res) => res.status(200).json({ message: "Server is working" }));
app.use("/api/auth", authRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/reports", reportRoutes);

mongoose
    .connect(DB_URL)
    .then(() => {
        app.listen(PORT, () => {
            console.log(`The server is working on the port ${PORT}`);
        });
    })
    .catch((err) => {
        console.log(`Error if connecting ${err.message}`);
    });
