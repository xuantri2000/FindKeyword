const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const recordRoutes = require("./routes/recordRoutes");
const logRoutes = require("./routes/logRoutes");
const blackListRoutes = require("./routes/blackListRoutes");
const targetListRoutes = require("./routes/targetListRoutes");

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/search_kh";

global.searchToolDataDir = path.join(__dirname, "data");

app.use(cors());
app.use(express.json());

// Kết nối MongoDB
mongoose.connect(MONGO_URI).then(() => {
    console.log("Connected to MongoDB");
}).catch(err => {
    console.error("MongoDB connection error:", err);
});

// Sử dụng routes
app.use("/records", recordRoutes);
app.use("/logs", logRoutes);
app.use("/blacklists", blackListRoutes);
app.use("/targets", targetListRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
