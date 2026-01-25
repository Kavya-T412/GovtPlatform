const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    walletAddress: { type: String, required: true, unique: true },
    name: String,
    email: String,
    role: { type: mongoose.Schema.Types.ObjectId, ref: "Role" },
    isVerified: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
