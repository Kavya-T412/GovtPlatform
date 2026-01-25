const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected (GovtPlatform – ALL SERVICES)");
    } catch (error) {
        console.error("DB connection failed:", error);
        process.exit(1);
    }
};

module.exports = connectDB;
