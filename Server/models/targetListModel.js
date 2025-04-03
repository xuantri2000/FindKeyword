const mongoose = require("mongoose");
const moment = require("moment-timezone");

const targetListSchema = new mongoose.Schema({
    target_name: { type: String, required: true },
    target_url: { type: String, default: "" },
    parent_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Target', default: null },
    created_at: { 
        type: String,
        default: () => moment().tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD HH:mm:ss")
    }
});

targetListSchema.index({ target_name: 1, target_url: 1 }, { unique: true });

const TargetList = mongoose.model("Target", targetListSchema);
module.exports = TargetList;
