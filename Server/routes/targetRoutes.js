const express = require("express");
const router = express.Router();
const Target = require("../models/listModel");

// 📌 Lấy danh sách Blacklist
router.get("/black", async (req, res) => {
    try {
        const blacklist = await Target.find({ type: "blacklist" });
        res.status(200).json(blacklist);
    } catch (error) {
        res.status(500).json({ error: "Lỗi khi lấy danh sách Blacklist!" });
    }
});

// 📌 Thêm mới vào Blacklist
router.post("/black", async (req, res) => {
    try {
        const { url_path, type } = req.body;
        if (!url_path || !type) {
            return res.status(400).json({ error: "Thiếu thông tin cần thiết!" });
        }
        const newEntry = new Target({ url_path, type });
        await newEntry.save();
        res.status(201).json({ message: "Thêm vào Blacklist thành công!" });
    } catch (error) {
        res.status(500).json({ error: "Lỗi khi thêm vào Blacklist!" });
    }
});

// 📌 Cập nhật mục trong Blacklist
router.put("/black/:id", async (req, res) => {
    try {
        const { url_path } = req.body;
        await Target.findByIdAndUpdate(req.params.id, { url_path });
        res.status(200).json({ message: "Cập nhật thành công!" });
    } catch (error) {
        res.status(500).json({ error: "Lỗi khi cập nhật Blacklist!" });
    }
});

// 📌 Xóa khỏi Blacklist
router.delete("/black/:id", async (req, res) => {
    try {
        await Target.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Xóa thành công!" });
    } catch (error) {
        res.status(500).json({ error: "Lỗi khi xóa khỏi Blacklist!" });
    }
});

module.exports = router;
