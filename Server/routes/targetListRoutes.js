const express = require("express");
const router = express.Router();
const Target = require("../models/targetListModel");

// 📌 Lấy danh sách Targetlist
router.get("/", async (req, res) => {
    try {
        const blacklist = await Target.find();
        res.status(200).json(blacklist);
    } catch (error) {
        res.status(500).json({ error: "Lỗi khi lấy danh sách Target!" });
    }
});

// 📌 Thêm mới vào Targetlist
router.post("/", async (req, res) => {
    try {
        const { target_name, target_url } = req.body;
        if (!target_name || !target_url) {
            return res.status(400).json({ error: "Thiếu thông tin cần thiết!" });
        }
        const newEntry = new Target({ target_name, target_url });
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
