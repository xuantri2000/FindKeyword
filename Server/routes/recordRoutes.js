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
                            filter: { username: record.username, password: record.password, url_path: record.url_path },
                            update: {
                                $setOnInsert: {
                                    url_path: record.url_path,
                                    filename: filename,
                                    run_time: record.run_time,
                                    log_resource: record.filename,
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
			record: upSertRecords.upsertedCount
        });

    } catch (error) {
        console.error("Lỗi khi insert records:", error);
        res.status(500).json({ error: "Đã xảy ra lỗi khi thêm tài khoản mới!", details: error.message });
    }
});

router.get("/", async (req, res) => {
    try {
        const batch = parseInt(req.query.batch) || 1;
        const limit = parseInt(req.query.limit) || 1000;
        const searchQuery = req.query.query ? req.query.query.trim() : "";
        const sortField = req.query.sortField;
        const sortOrder = req.query.sortOrder;

        const skip = (batch - 1) * limit;

        let query = {};
        let sort = { _id: -1 }; // default sort

        if (searchQuery) {
			const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            query = {
                $or: [
                    { username: { $regex: escapedQuery, $options: "i" } },
                    { url_path: { $regex: escapedQuery, $options: "i" } }
                ]
            };
        }

        // Apply sorting if provided
        if (sortField && sortOrder) {
            sort = {
                [sortField]: sortOrder === 'asc' ? 1 : -1
            };
        }

        const records = await Record.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit);

        const totalRecords = await Record.countDocuments(query);

        res.status(200).json({
            batch,
            limit,
            totalRecords,
            totalBatches: Math.ceil(totalRecords / limit),
            data: records,
            totalRecordsInCurrentBatch: records.length,
        });
    } catch (error) {
        res.status(500).json({ error: "Error fetching records", details: error.message });
    }
});


module.exports = router;
