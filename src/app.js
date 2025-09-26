const express = require("express");
const http = require("http");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const userRouter = require("./routes/user.route");

const app = express();

if (process.env.NODE_ENV === "development") {
    const morgan = require("morgan");
    app.use(morgan("dev"));
}
app.use(
    cors({
        origin: true,
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
        exposedHeaders: ["Set-Cookie"],
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use((req, res, next) => {
    const allowedOrigins = ["https://chatapp-client-iota.vercel.app"];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
    }
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
    );
    res.setHeader("Access-Control-Allow-Credentials", "true");
    next();
});

app.use("/api/v1/users", userRouter);

app.all(/.*/, (req, res) => {
    res.status(404).json({
        status: "fail",
        message: "Not found",
    });
});

const server = http.createServer(app);

module.exports = { app, server };
