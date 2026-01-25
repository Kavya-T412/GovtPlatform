require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./db");

// Import all models to ensure they are registered with Mongoose
const Service = require("./models/Service");
const Application = require("./models/Application");
const Document = require("./models/Document");
const User = require("./models/User");
const AdminAction = require("./models/AdminAction");
const Role = require("./models/Role");

const initCollections = async () => {
    try {
        await connectDB();

        const models = [Service, Application, Document, User, AdminAction, Role];

        for (const model of models) {
            // This will create the collection if it doesn't exist
            await model.createCollection();
            console.log(`Collection created/verified for: ${model.modelName}`);
        }

        console.log("All generic collections are now visible in MongoDB Compass.");
        process.exit(0);
    } catch (error) {
        console.error("Error creating collections:", error);
        process.exit(1);
    }
};

initCollections();
