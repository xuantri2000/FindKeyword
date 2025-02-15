const mongoose = require("mongoose");
const moment = require("moment-timezone");

const logSchema = new mongoose.Schema({
    filename: { type: String, required: true },
    success: { type: Boolean, default: true },
    created_at: { 
        type: String,  // Lưu dưới dạng string thay vì Date
        default: () => moment().tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD HH:mm:ss")
    }
});

const Log = mongoose.model("Log", logSchema);
module.exports = Log;
