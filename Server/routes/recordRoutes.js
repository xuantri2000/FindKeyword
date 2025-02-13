const express = require("express");
const Record = require("../models/recordModel");

const router = express.Router();

// 📌 Route: Insert một record mới
router.post("/insert", async (req, res) => {
    try {
        const { username, password, url } = req.body;

        const newRecord = new Record({ username, password, url });
        await newRecord.save();

        res.status(201).json({ message: "Record inserted successfully", data: newRecord });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: "Username and password combination must be unique" });
        }
        res.status(500).json({ error: "Error inserting record", details: error.message });
    }
});

// 📌 Route: Lấy tất cả record
router.get("/select", async (req, res) => {
    try {
        const records = await Record.find();
        res.status(200).json(records);
    } catch (error) {
        res.status(500).json({ error: "Error fetching records", details: error.message });
    }
});

// router.get("/test", async (req, res) => { 
//     res.json({ message: "Welcome to Node.js 2API" });
// });

module.exports = router;
