const express = require("express");
const router = express.Router();
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
                        $cond: {
                            if: { $gt: [{ $size: "$parent_info" }, 0] },  // Kiểm tra nếu có parent
                            then: {
                                $concat: [
                                    { $arrayElemAt: ["$parent_info.target_name", 0] },
                                    " (",
                                    { $arrayElemAt: ["$parent_info.target_url", 0] },
                                    ")"
                                ]
                            },
                            else: "Cấp quốc gia"  // Nếu không có parent
                        }
                    }
                }
            },
            { $project: { parent_info: 0 } }  // Loại bỏ trường tạm
        ]);

        res.status(200).json(targetList);
    } catch (error) {
        res.status(500).json({ error: "Lỗi khi lấy danh sách Target!" });
    }
});


router.get("/countries", async (req, res) => {
    try {
        // Lấy các Target có parent_id là null hoặc không tồn tại, chỉ lấy 3 trường
        const targetList = await Target.find(
            { $or: [{ parent_id: null }, { parent_id: { $exists: false } }] },
            '_id target_name target_url'  // Chỉ chọn các trường cần thiết
        );
        res.status(200).json(targetList);
    } catch (error) {
        res.status(500).json({ error: "Lỗi khi lấy danh sách Target!" });
    }
});

// 📌 Lấy danh sách Targetlist
router.get("/targets", async (req, res) => {
    try {
        // Lấy các Target có parent_id khác null
        const targetList = await Target.find({ 
            parent_id: { $exists: true, $ne: null } 
        });
        res.status(200).json(targetList);
    } catch (error) {
        res.status(500).json({ error: "Lỗi khi lấy danh sách Target!" });
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
        res.status(201).json({ message: "Thêm vào Targetlist thành công!", data: newEntry });
    } catch (error) {
        res.status(500).json({ error: "Lỗi khi thêm vào Targetlist!" });
    }
});

// 📌 Cập nhật mục trong Targetlist
router.put("/:id", async (req, res) => {
    try {
        const { target_name, target_url } = req.body;
        await Target.findByIdAndUpdate(req.params.id, { target_name, target_url });
        res.status(200).json({ message: "Cập nhật thành công!" });
    } catch (error) {
        res.status(500).json({ error: "Lỗi khi cập nhật Targetlist!" });
    }
});

// 📌 Xóa khỏi Targetlist
router.delete("/:id", async (req, res) => {
    try {
        await Target.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Xóa thành công!" });
    } catch (error) {
        res.status(500).json({ error: "Lỗi khi xóa khỏi Targetlist!" });
    }
});

module.exports = router;
