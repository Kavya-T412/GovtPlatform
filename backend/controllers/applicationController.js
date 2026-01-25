const Application = require("../models/Application");
const Document = require("../models/Document");
const User = require("../models/User");

exports.submitApplication = async (req, res) => {
    console.log("--- SUBMISSION START ---");
    console.log("Body:", JSON.stringify(req.body, null, 2));
    console.log("Files:", req.files ? req.files.map(f => ({ name: f.fieldname, path: f.path })) : "None");

    try {
        const { walletAddress, serviceId, serviceType, fullName, applicantName } = req.body;

        if (!walletAddress) {
            console.error("Missing walletAddress in request body");
            return res.status(400).json({ success: false, message: "walletAddress is required" });
        }

        // 1. Find or create user based on wallet address
        console.log("Looking for user:", walletAddress);
        let user;
        try {
            user = await User.findOne({ walletAddress: walletAddress });
            if (!user) {
                console.log("User not found, creating...");
                user = await User.create({ walletAddress: walletAddress });
                console.log("User created:", user._id);
            } else {
                console.log("User found:", user._id);
            }
        } catch (dbError) {
            console.error("Database error during user processing:", dbError);
            return res.status(500).json({ success: false, message: "User processing failed", error: dbError.message });
        }

        // 2. Create the Application
        console.log("Creating application...");
        const appData = {
            serviceId: serviceId || "GENERIC_SERVICE",
            serviceType: serviceType || "NOT_SPECIFIED",
            walletAddress: walletAddress,
            applicantName: fullName || applicantName || "Anonymous",
            blockchainRef: req.body.blockchainRef || req.body.blockchainTxHash,
            data: req.body,
            status: "Submitted"
        };
        console.log("App Data to save:", JSON.stringify(appData, null, 2));

        const app = new Application(appData);

        let savedApp;
        try {
            savedApp = await app.save();
            console.log("Application saved successfully:", savedApp._id);
        } catch (appSaveError) {
            console.error("Application save error:", appSaveError);
            return res.status(500).json({ success: false, message: "Application sync failed", error: appSaveError.message });
        }

        // 3. Create Document entries for each uploaded file
        if (req.files && req.files.length > 0) {
            console.log(`Processing ${req.files.length} documents...`);
            try {
                const documentPromises = req.files.map(file => {
                    console.log(`Creating document for ${file.fieldname}`);
                    const extension = file.originalname.split('.').pop();
                    return Document.create({
                        userId: user._id,
                        applicationId: savedApp._id,
                        documentType: file.fieldname || "Other",
                        documentUrl: file.path,
                        fileType: file.mimetype,
                        fileExtension: `.${extension}`,
                        status: "Pending"
                    });
                });
                const savedDocuments = await Promise.all(documentPromises);
                console.log(`${savedDocuments.length} documents saved.`);

                savedApp.documents = savedDocuments.map(doc => ({
                    documentType: doc.documentType,
                    url: doc.documentUrl,
                    status: "Pending"
                }));
                await savedApp.save();
                console.log("Application updated with documents.");
            } catch (docError) {
                console.error("Document creation error:", docError);
                // We've already saved the app, so we might return success with a warning or fail
                return res.status(500).json({ success: false, message: "Application saved but document sync failed", error: docError.message });
            }
        }

        console.log("--- SUBMISSION SUCCESS ---");
        return res.status(201).json({ success: true, app: savedApp });

    } catch (unexpectedError) {
        console.error("Unexpected submission error:", unexpectedError);
        return res.status(500).json({ success: false, message: "Internal server error", error: unexpectedError.message });
    }
};

exports.getDocumentByUrl = async (req, res) => {
    try {
        const { url } = req.query;

        if (!url) {
            return res.status(400).json({ success: false, message: "URL is required" });
        }

        console.log("Fetching details for document URL:", url);

        // Find document and populate related info if possible
        const document = await Document.findOne({ documentUrl: url })
            .populate("userId", "walletAddress name email")
            .populate("applicationId");

        if (!document) {
            return res.status(404).json({ success: false, message: "Document not found" });
        }

        return res.status(200).json({ success: true, document });
    } catch (error) {
        console.error("Error fetching document details:", error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

exports.getAllApplications = async (req, res) => {
    try {
        console.log("Fetching all applications metadata...");
        const applications = await Application.find().sort({ createdAt: -1 });
        return res.status(200).json({ success: true, applications });
    } catch (error) {
        console.error("Error fetching all applications:", error);
        res.status(500).json({ success: false, message: "Failed to fetch applications", error: error.message });
    }
};
