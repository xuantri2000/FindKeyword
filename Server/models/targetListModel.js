const mongoose = require("mongoose");
const moment = require("moment-timezone");

const targetListSchema = new mongoose.Schema({
    target_name: { type: String, required: true },
    target_url: { type: String, required: true },
    created_at: { 
        type: String,  // Lưu dưới dạng string thay vì Date
        default: () => moment().tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD HH:mm:ss")
    }
});

targetListSchema.index({ target_name: 1, target_url: 1 }, { unique: true });

const TargetList = mongoose.model("Target", targetListSchema);
module.exports = TargetList;
