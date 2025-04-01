const express = require("express");
const path = require("path");
const fs = require("fs");
const { handleFileError } = require("../utils/ExceptionCatch");
const router = express.Router();
const ExcelJS = require('exceljs');

const Record = require("../models/recordModel");
const Log = require("../models/logModel");
const BlackList = require("../models/blackListModel");

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

// Tách logic lọc và sắp xếp vào một hàm chung
const buildFilterAndSort = async (req) => {
    const { query, sortField, sortOrder, status, target } = req.query;
    const filter = {};
	
    // Lấy danh sách URL trong BlackList để lọc
    const targetUrls = await BlackList.find({}, 'url_path');
    const blockedUrls = targetUrls.map(target => new RegExp(target.url_path, 'i'));
    filter.url_path = { $not: { $in: blockedUrls } };

    // Tìm kiếm theo username hoặc url_path
    if (query) {
        const rawQuery = query.trim();
        const escaped = rawQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        filter.$or = [
            { username: { $regex: escaped, $options: 'i' } },
            { url_path: { $regex: escaped, $options: 'i' } }
        ];
    }

    // Lọc theo trạng thái đăng nhập nếu có
    if (status) {
        filter.login_status = status;
    }

	// Lọc theo target nếu có
    if (target) {
        filter.url_path = { $regex: target, $options: 'i' };
    }

    // Sắp xếp theo trường và thứ tự
    let sort = { _id: -1 };
    if (sortField && sortOrder) {
        sort = { [sortField]: sortOrder === 'asc' ? 1 : -1 };
    }

    return { filter, sort };
};

// Cập nhật router
router.get('/export', async (req, res) => {
    try {
        const { filter, sort } = await buildFilterAndSort(req);
        const records = await Record.find(filter).sort(sort);

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Logs');

        sheet.columns = [
            { header: 'Username', key: 'username' },
            { header: 'Password', key: 'password' },
            { header: 'URL Path', key: 'url_path' },
            { header: 'Run Time', key: 'run_time' },
            { header: 'Status', key: 'login_status' },
        ];

        records.forEach(r => {
            sheet.addRow({
                username: r.username,
                password: r.password,
                url_path: r.url_path,
                run_time: r.run_time,
                login_status: r.login_status
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=logs_export.xlsx');
        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        res.status(500).json({ message: 'Không thể xuất log, vui lòng liên hệ bé Vàng!' });
    }
});

router.get('/', async (req, res) => {
    try {
        const batch = parseInt(req.query.batch) || 1;
        const limit = parseInt(req.query.limit) || 1000;
        const skip = (batch - 1) * limit;

        const { filter, sort } = await buildFilterAndSort(req);
        const records = await Record.find(filter).sort(sort).skip(skip).limit(limit);
        const totalRecords = await Record.countDocuments(filter);

        res.status(200).json({
            batch,
            limit,
            totalRecords,
            totalBatches: Math.ceil(totalRecords / limit),
            data: records,
            totalRecordsInCurrentBatch: records.length,
        });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching records', details: error.message });
    }
});


router.put("/update", async (req, res) => {
    try {
        const updatedRecord = req.body;

        if (!updatedRecord || !updatedRecord._id) {
            return res.status(400).json({ error: "Thiếu thông tin cập nhật hoặc _id không hợp lệ." });
        }

        // Lấy record hiện tại để kiểm tra giá trị ban đầu của url_path
        const currentRecord = await Record.findById(updatedRecord._id);
        if (!currentRecord) {
            return res.status(404).json({ error: "Tài khoản không tồn tại." });
        }
        const oldUrlPath = currentRecord.url_path;

        // Lấy danh sách URL trong Target để kiểm tra
        const targetUrls = await BlackList.find({}, "url_path");
        const blockedUrls = targetUrls.map(target => new RegExp(target.url_path, "i"));

        // Nếu URL gần giống với BlackList thì không cập nhật
        if (blockedUrls.some(regex => regex.test(updatedRecord.url_path))) {
            return res.status(403).json({ error: "Không thể cập nhật do URL thuộc danh sách hạn chế." });
        }

        const updateData = {
            url_path: updatedRecord.url_path,
            login_status: updatedRecord.login_status
        };

        // Cập nhật record hiện tại
        const updateResult = await Record.updateOne(
            { _id: updatedRecord._id },
            { $set: updateData }
        );

        // Kiểm tra nếu không có gì thay đổi
        if (updateResult.modifiedCount === 0) {
            return res.status(200).json({ message: "Không có thay đổi nào được thực hiện.", fetch_all: false });
        }

        if (updatedRecord.applyToAll) {
            // Cập nhật tất cả các bản ghi có cùng url_path ban đầu
            const bulkUpdateResult = await Record.updateMany(
                { 
                    url_path: oldUrlPath,
                    _id: { $ne: updatedRecord._id }
                },
                { $set: updateData }
            );

            return res.status(200).json({
                message: `Cập nhật thành công! Đã cập nhật ${bulkUpdateResult.modifiedCount} tài khoản.`,
                fetch_all: true
            });
        } else {
            // Nếu chỉ cập nhật một bản ghi, lấy dữ liệu sau khi cập nhật
            const updatedCurrentRecord = await Record.findById(updatedRecord._id);

            return res.status(200).json({
                message: `Cập nhật tài khoản "${updatedCurrentRecord.username}" thành công!`,
                updatedRecord: updatedCurrentRecord,
                fetch_all: false
            });
        }
    } catch (error) {
        console.error("Lỗi khi cập nhật record:", error);
        res.status(500).json({ error: "Đã xảy ra lỗi khi cập nhật thông tin!", details: error.message });
    }
});




module.exports = router;
