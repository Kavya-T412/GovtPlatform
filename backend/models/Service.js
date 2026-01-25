const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
    serviceId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: String,
    category: String, // e.g., Transport, Identity, Education
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Service", serviceSchema);
