require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./db");

const app = express();
connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});
app.use("/uploads", express.static("uploads"));

app.use("/api/application", require("./routes/applicationRoutes"));

app.use((err, req, res, next) => {
    console.error("Global Error Handler:", err);
    res.status(500).json({ success: false, message: "Unexpected server error", error: err.message });
});

app.listen(process.env.PORT, () => {
    console.log("Server running at port", process.env.PORT);
});
