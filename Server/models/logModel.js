const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
    filename: { type: String, required: true },
});

const Log = mongoose.model("Log", logSchema);
module.exports = Log;
