require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const PORT = process.env.PORT;
const DB_URL = process.env.DB_URL;
const app = express();

app.use(cors());
app.use(express.json());

// Routes
const supplierRoutes = require("./routes/supplier-routes");

app.use("/api/suppliers", supplierRoutes);

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
