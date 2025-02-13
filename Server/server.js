const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const recordRoutes = require("./routes/recordRoutes");

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/search_kh";

app.use(cors());
app.use(express.json());

// Kết nối MongoDB
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Connected to MongoDB");
}).catch(err => {
    console.error("MongoDB connection error:", err);
});

// Sử dụng routes
app.use("/records", recordRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
