const http = require("http");
const { connectDB } = require("./DB");
const appInit = async () => {
    const app = require("express")();

    const httpServer = http.createServer(app);

    await connectDB();
    return { app, httpServer };
};

module.exports = appInit;
