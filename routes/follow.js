const express = require("express");
const router = express.Router();

const FollowController = require("../controllers/FollowController");
const { verifyToken } = require("../middleware/verifyToken");

router.get("/get/:username", FollowController.index);

router.post("/toggle", verifyToken, FollowController.toggleFollow);

module.exports = router;
