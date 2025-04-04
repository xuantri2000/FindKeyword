const mongoose = require("mongoose");

const recordSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    url_path: { type: String, required: true },
    filename: { type: String },
    run_time: { type: String },
    log_resource: { type: String },
    login_status: { type: String, default: 'pending' },
    note: { type: String },
});

// Đảm bảo rằng `username` và `password` kết hợp là duy nhất
recordSchema.index({ username: 1, password: 1, url_path: 1 }, { unique: true });
recordSchema.index({ filename: 1});

const Record = mongoose.model("Record", recordSchema);
module.exports = Record;
