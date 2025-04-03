const express = require("express");
const router = express.Router();
const { handleValidationError } = require("../utils/ExceptionCatch");
const Target = require("../models/targetListModel");

// 📌 Lấy danh sách Targetlist với thông tin Parent
router.get("/", async (req, res) => {
    try {
        const targetList = await Target.aggregate([
            {
                $lookup: {
                    from: "targets",            // Tên collection cha (tương tự model Target)
                    localField: "parent_id",    // Trường liên kết trong bảng hiện tại
                    foreignField: "_id",        // Trường liên kết trong bảng cha
                    as: "parent_info"           // Đặt tên trường kết quả
                }
            },
            {
                $addFields: {
                    parent: {
                        $cond: [
                            { $eq: ["$parent_id", null] }, "Cấp quốc gia",  // Trường hợp parent_id = null
                            {
                                $cond: [
                                    { $gt: [{ $size: "$parent_info" }, 0] },  // Nếu có parent
                                    {
                                        $concat: [
                                            { $arrayElemAt: ["$parent_info.target_name", 0] },
                                            " (",
                                            { $arrayElemAt: ["$parent_info.target_url", 0] },
                                            ")"
                                        ]
                                    },
                                    ""  // Trường hợp không tồn tại
                                ]
                            }
                        ]
                    },
                    isNationalLevel: { 
                        $cond: { if: { $eq: ["$parent_id", null] }, then: 1, else: 0 }  // Đánh dấu cấp quốc gia
                    }
                }
            },
            { $sort: { isNationalLevel: -1, target_name: 1 } },  // Sắp xếp cấp quốc gia lên đầu và theo tên
            { $project: { parent_info: 0, isNationalLevel: 0 } }  // Loại bỏ trường tạm
        ]);

        res.status(200).json(targetList);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách mục tiêu:", error.message);
        res.status(500).json({ message: "Lỗi khi lấy danh sách mục tiêu!" });
    }
});

// 📌 Lấy danh sách Target cấp quốc gia (loại trừ ID nếu có)
router.get("/countries", async (req, res) => {
    try {
        const { excludeId } = req.query;

        // Tạo bộ lọc để loại trừ ID nếu có
        const filter = { 
            $or: [{ parent_id: null }]
        };
        if (excludeId) {
            filter._id = { $ne: excludeId };
        }

        // Truy vấn danh sách các mục tiêu cấp quốc gia
        const targetList = await Target.find(filter, "_id target_name target_url");
        res.status(200).json(targetList);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách mục tiêu cấp quốc gia:", error.message);
        res.status(500).json({ message: "Lỗi khi lấy danh sách mục tiêu cấp quốc gia!" });
    }
});

// 📌 Lấy danh sách Targetlist theo parent_id
router.get("/targets", async (req, res) => {
    try {
        const { parent_id } = req.query;

        let query = { parent_id: { $exists: true, $ne: null } };
        // Nếu có parent_id, thêm điều kiện lọc
        if (parent_id) {
            query = { parent_id };
        }

        const targetList = await Target.find(query);
        res.status(200).json(targetList);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy danh sách mục tiêu con!" });
    }
});

// 📌 Thêm mới vào Targetlist
router.post("/", async (req, res) => {
    try {
        const { target_name, target_url, parent_id } = req.body;
        if (!target_name || !target_url) {
            return res.status(400).json({ error: "Thiếu thông tin cần thiết!" });
        }
        const newEntry = new Target({ target_name, target_url, parent_id});
        await newEntry.save();
        res.status(201).json({ message: "Thêm mục tiêu mới thành công!", data: newEntry });
    } catch (error) {
        res.status(500).json({ message: handleValidationError(error) });
    }
});

// 📌 Cập nhật mục trong Targetlist
router.put("/:id", async (req, res) => {
    try {
        const { target_name, target_url, parent_id } = req.body;
        await Target.findByIdAndUpdate(req.params.id, { target_name, target_url, parent_id });
        res.status(200).json({ message: "Cập nhật mục tiêu thành công!" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi cập nhật mục tiêu!" });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // Tìm và xóa mục tiêu chính
        const deletedTarget = await Target.findByIdAndDelete(id);
        if (!deletedTarget) {
            return res.status(404).json({ message: "Mục tiêu không tồn tại hoặc đã bị xóa!" });
        }

        // Tìm và xóa các mục tiêu con có parent_id bằng với ID đã xóa
        const deletedChildren = await Target.deleteMany({ parent_id: id });

        res.status(200).json({ 
            message: `Xóa mục tiêu và ${deletedChildren.deletedCount} mục tiêu con thành công!`,
        });
    } catch (error) {
        console.error("Lỗi khi xóa mục tiêu:", error.message);
        res.status(500).json({ message: "Lỗi khi xóa mục tiêu!" });
    }
});

module.exports = router;
