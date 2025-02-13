const mongoose = require("mongoose");

const recordSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    url: { type: String, required: true }
});

// Đảm bảo rằng `username` và `password` kết hợp là duy nhất
recordSchema.index({ username: 1, password: 1 }, { unique: true });

const Record = mongoose.model("Record", recordSchema);
module.exports = Record;
