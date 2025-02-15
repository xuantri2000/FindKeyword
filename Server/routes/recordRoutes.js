const express = require("express");
const path = require("path");
const fs = require("fs");
const { handleFileError } = require("../utils/ExceptionCatch");
const router = express.Router();

const Record = require("../models/recordModel");
const Log = require("../models/logModel");

router.post("/insert", async (req, res) => {
    try {
        const filenames = req.body;
        if (!Array.isArray(filenames) || filenames.length === 0) {
            return res.status(400).json({ error: "Danh sách file không hợp lệ!" });
        }

        const operations = [];
        const errorMessages = [];
        const logEntries = [];

        // 📌 Truy vấn Log để kiểm tra file nào đã được xử lý trước đó
        const existingLogs = await Log.find({ filename: { $in: filenames } }).lean();
        const existingFilenames = new Set(existingLogs.map(log => log.filename));

        for (const filename of filenames) {
            // Nếu filename đã tồn tại trong Log, bỏ qua và báo lỗi
            if (existingFilenames.has(filename)) {
                errorMessages.push(`⚠️ File ${filename} đã được xử lý.`);
                continue;
            }

            const filePath = path.join(global.searchToolDataDir, filename);

            try {
                const fileData = fs.readFileSync(filePath, "utf-8");
                const records = JSON.parse(fileData); // Giả sử file chứa một mảng JSON

                if (!Array.isArray(records)) {
                    errorMessages.push(`⚠️ File ${filename} không chứa mảng JSON hợp lệ.`);
                    logEntries.push({ filename, success: false });
                    continue;
                }

                for (const record of records) {
                    operations.push({
                        updateOne: {
                            filter: { username: record.username, password: record.password },
                            update: {
                                $setOnInsert: {
                                    url_path: record.url_path,
                                    filename: filename,
                                    run_time: record.run_time,
                                },
                            },
                            upsert: true,
                        },
                    });
                }

                // Nếu file xử lý thành công, lưu log với success = true
                logEntries.push({ filename, success: true });

            } catch (error) {
				logEntries.push({ filename, success: false });
                errorMessages.push(handleFileError(filename, error));
            }
        }

		//Ghi trạng thái xử lý vào Log
		await Log.insertMany(logEntries);

        // Nếu không có dữ liệu hợp lệ để insert, trả về lỗi 422
        if (operations.length === 0) {
            return res.status(422).json({ errors: errorMessages });
        }

        // Thực hiện thao tác ghi dữ liệu
        const upSertRecords = await Record.bulkWrite(operations);

        res.status(201).json({
            message: `Thêm thành công ${upSertRecords.upsertedCount} tài khoản mới!`,
            errors: errorMessages.length ? errorMessages : null,
        });

    } catch (error) {
        console.error("Lỗi khi insert records:", error);
        res.status(500).json({ error: "Đã xảy ra lỗi khi thêm tài khoản mới!", details: error.message });
    }
});

// 📌 Route: Lấy records theo trang (Pagination)
router.get("/", async (req, res) => {
    try {
        // Lấy `page` và `limit` từ query parameters, mặc định là page 1, 100 records mỗi trang
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;

        // Tính vị trí bắt đầu (skip)
        const skip = (page - 1) * limit;

        // Lấy dữ liệu có phân trang
        const records = await Record.find()
            .sort({ _id: -1 }) // Lấy những record mới nhất trước
            .skip(skip) // Bỏ qua `skip` bản ghi đầu tiên
            .limit(limit); // Giới hạn `limit` records mỗi trang

        // Tổng số records trong DB
        const totalRecords = await Record.countDocuments();

        // Trả về dữ liệu kèm thông tin phân trang
        res.status(200).json({
            page,
            limit,
            totalRecords,
            totalPages: Math.ceil(totalRecords / limit),
            data: records,
        });
    } catch (error) {
        res.status(500).json({ error: "Error fetching records", details: error.message });
    }
});


module.exports = router;
