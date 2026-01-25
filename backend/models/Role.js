const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }, // e.g., "User", "Admin", "ServiceProvider"
    permissions: [String]
}, { timestamps: true });

module.exports = mongoose.model("Role", roleSchema);
