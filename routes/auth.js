const express = require("express");
const route = express.Router();

const AuthController = require("../controllers/AuthController.js");
const { verifyToken } = require("../middleware/verifyToken.js");

route.get("/", verifyToken, AuthController.index);

route.post("/login", AuthController.login);

route.post("/register", AuthController.register);

route.put("/changePassword", verifyToken, AuthController.changePassword);

route.put("/changeAvatar", verifyToken, AuthController.changeAvatar);

module.exports = route;
