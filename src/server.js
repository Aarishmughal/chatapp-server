const dotenv = require("dotenv");
const mongoose = require("mongoose");
dotenv.config({
    path: "./src/config.env",
});
const { app, server } = require("./app");

const DB = process.env.DATABASE_URI.replace(
    "<PASSWORD>",
    process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => {
    console.log("Database Online 🟢");
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        console.log(`Server Online 🚀: ${PORT}`);
    });
});
