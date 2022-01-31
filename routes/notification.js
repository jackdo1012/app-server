const express = require("express");
const NotificationController = require("../controllers/NotificationController");
const { verifyToken } = require("../middleware/verifyToken");
const router = express.Router();

router.get("/", verifyToken, NotificationController.index);
router.put("/readAll", verifyToken, NotificationController.readAll);

module.exports = router;
