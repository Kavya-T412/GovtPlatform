const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: "Application" },
    documentType: { type: String, required: true }, // e.g., Aadhaar, PAN
    documentUrl: { type: String, required: true },
    fileType: String, // e.g., image/jpeg, application/pdf
    fileExtension: String, // e.g., .jpg, .pdf
    status: { type: String, enum: ["Pending", "Verified", "Rejected"], default: "Pending" }
}, { timestamps: true });

module.exports = mongoose.model("Document", documentSchema);
