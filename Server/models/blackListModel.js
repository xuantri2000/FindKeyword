const mongoose = require("mongoose");
const moment = require("moment-timezone");

const blackListSchema = new mongoose.Schema({
    url_path: { type: String, required: true },
    type: { type: String, required: true },
    created_at: { 
        type: String,  // Lưu dưới dạng string thay vì Date
        default: () => moment().tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD HH:mm:ss")
    }
});

const BlackList = mongoose.model("List", blackListSchema);
module.exports = BlackList;
