const express = require("express");
const UserController = require("../controllers/UserController");
const router = express.Router();

router.get("/full/:username", UserController.index);
router.get("/public/:username", UserController.public);

module.exports = router;
