const express = require("express");
const fs = require("fs");
const path = require("path");
const Log = require("../models/logModel");

const router = express.Router();

// 📌 Route: Lấy danh sách file .json trong thư mục /data mà chưa có trong Log
router.get("/", async (req, res) => {
    try {
        const dataDir = path.join(__dirname, "../data"); // Đường dẫn tới thư mục /data

        // Lọc danh sách file chỉ lấy file .json
        const allJsonFiles = fs.readdirSync(dataDir).filter(file => file.endsWith(".json"));

        // Kiểm tra các file .json này đã tồn tại trong MongoDB chưa
        const existingLogs = await Log.find({ filename: { $in: allJsonFiles } }, "filename");
        const existingFileNames = new Set(existingLogs.map(log => log.filename));

        // Lọc ra các file .json chưa có trong DB
        const newJsonFiles = allJsonFiles.filter(file => !existingFileNames.has(file));

        res.status(200).json({ newJsonFiles });
    } catch (error) {
        res.status(500).json({ error: "Error fetching files", details: error.message });
    }
});

module.exports = router;
