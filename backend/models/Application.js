const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
    serviceId: { type: String, required: true }, // Links to generic Service model
    serviceType: { type: String, required: true }, // PAN, Passport, etc.
    walletAddress: String,
    applicantName: String, // Generic name field
    data: mongoose.Schema.Types.Mixed, // Flexible field for service-specific data
    documents: [{
        documentType: String,
        url: String,
        status: String
    }],
    status: {
        type: String,
        enum: ["Submitted", "Processing", "Approved", "Rejected"],
        default: "Submitted"
    },
    blockchainRef: String
}, { timestamps: true });

module.exports = mongoose.model("Application", applicationSchema);
