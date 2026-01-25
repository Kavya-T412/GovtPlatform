const express = require("express");
const multer = require("multer");
const { submitApplication, getDocumentByUrl, getAllApplications } = require("../controllers/applicationController");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post(
    "/submit",
    upload.any(),
    (req, res, next) => {
        console.log("Multer finished. Body size:", Object.keys(req.body || {}).length);
        console.log("Files received:", req.files ? req.files.length : 0);
        next();
    },
    submitApplication
);

router.get("/all", getAllApplications);
router.get("/document-details", getDocumentByUrl);

module.exports = router;
