require("dotenv");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose")

const PORT = process.env.PORT;
const DB_URL = process.env.DB_URL;
const app = express();

app.listen(PORT, "0.0.0.0", DB_URL);
