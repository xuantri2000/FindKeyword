const express = require("express");
const fs = require("fs");
const path = require("path");
const Log = require("../models/logModel");

const router = express.Router();

// Lấy danh sách file .json trong thư mục /data mà chưa có trong Log
router.get("/", async (req, res) => {
	try {
		// Lọc danh sách file chỉ lấy file .json
		const allJsonFiles = fs.readdirSync(global.searchToolDataDir).filter(file => file.endsWith(".json"));

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

// Lấy danh sách log bị lỗi (giới hạn 50 records mới nhất)
router.get("/errors", async (req, res) => {
	try {
		// Lấy danh sách file có success = false từ Log, sắp xếp mới nhất trước, giới hạn 50
		const failedLogs = await Log.find({ success: false }, { filename: 1, created_at: 1, _id: 0 })
			.sort({ created_at: -1 }) // Sắp xếp giảm dần theo thời gian (mới nhất trước)
			.limit(50); // Giới hạn 50 records

		res.status(200).json({ failedJsonFiles: failedLogs });
	} catch (error) {
		res.status(500).json({ error: "Error fetching failed files", details: error.message });
	}
});

module.exports = router;
