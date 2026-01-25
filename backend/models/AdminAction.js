const mongoose = require("mongoose");

const adminActionSchema = new mongoose.Schema({
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true }, // e.g., "Approve Application", "Reject Document"
    targetId: mongoose.Schema.Types.ObjectId, // ID of the application or document
    details: String
}, { timestamps: true });

module.exports = mongoose.model("AdminAction", adminActionSchema);
