const express = require("express");
const router = express.Router();
const dotenv = require("dotenv");
const { handleFileError } = require("../utils/ExceptionCatch");
const Record = require("../models/recordModel");

// Load biến môi trường từ file .env
dotenv.config();

// Hàm kiểm tra SECRET_KEY
function validateSecretKey(req) {
    const clientSecret = req.body.SECRET_KEY;
    const serverSecret = process.env.SECRET_KEY;

    return clientSecret && serverSecret && clientSecret === serverSecret;
}

// Hàm chuẩn hóa tên miền từ URL
function getNormalizedDomain(urlPath) {
    if (!urlPath.startsWith('http://') && !urlPath.startsWith('https://')) {
        urlPath = 'http://' + urlPath;
    }

    try {
        const url = new URL(urlPath);
        return url.hostname.toLowerCase();
    } catch (error) {
        return urlPath
            .replace(/^https?:\/\//, '')
            .split('/')[0]
            .toLowerCase();
    }
}

// Hàm lọc URL tương tự dựa trên username, password và domain đã chuẩn hóa
async function deduplicateAndDeleteRecords(data) {
    const uniqueEntries = new Map();
    const duplicateIds = [];

    for (const entry of data) {
        const normalizedDomain = getNormalizedDomain(entry.url_path);
        const uniqueKey = `${entry.username}|${entry.password}|${normalizedDomain}`;

        // Nếu đã có bản ghi tương tự, đánh dấu ID để xóa
        if (uniqueEntries.has(uniqueKey)) {
            duplicateIds.push(entry._id);
        } else {
            uniqueEntries.set(uniqueKey, entry);
        }
    }

    // Xóa các bản ghi trùng lặp
    if (duplicateIds.length > 0) {
        await Record.deleteMany({ _id: { $in: duplicateIds } });
    }

    return {
        filteredData: Array.from(uniqueEntries.values()),
        deletedCount: duplicateIds.length,
    };
}

// 📌 API để lọc các bản ghi lặp và xóa
router.post("/c3searchtool_filterrecords", async (req, res) => {
    try {
        // Kiểm tra SECRET_KEY
        if (!validateSecretKey(req)) {
            return res.status(401).json({ message: "Không có quyền truy cập! SECRET_KEY không hợp lệ." });
        }

        // Lấy toàn bộ dữ liệu từ MongoDB
        const data = await Record.find({}, { username: 1, password: 1, url_path: 1 });

        if (!data || data.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy bản ghi nào!" });
        }

        // Lọc các bản ghi trùng lặp và xóa
        const { filteredData, deletedCount } = await deduplicateAndDeleteRecords(data);

        res.status(200).json({ 
            message: `Lọc thành công! Đã xóa ${deletedCount} bản ghi trùng lặp. Giữ lại ${filteredData.length} bản ghi.`,
            data: filteredData
        });
    } catch (error) {
        console.error("Lỗi khi lọc URL tương tự:", error.message);
        res.status(500).json({ message: handleFileError("Lọc URL tương tự", error) });
    }
});

module.exports = router;
