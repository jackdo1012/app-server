const cors = require("cors");
const morgan = require("morgan");
const ipLogger = require("./ipLogger");
const express = require("express");

const middleware = (app) => {
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cors({ origin: JSON.parse(process.env.CORS_ORIGIN) }));
    app.use(function (_, res, next) {
        res.removeHeader("X-Powered-By");
        next();
    });
    app.use(ipLogger);

    app.use(morgan("tiny"));
};
module.exports = middleware;
