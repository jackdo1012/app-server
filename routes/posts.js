const express = require("express");
const PostController = require("../controllers/PostController");
const { verifyToken } = require("../middleware/verifyToken");
const router = express.Router();

router.get("/user/:username", PostController.index);
router.get("/id/:id", PostController.getFromId);
router.post("/new", verifyToken, PostController.newPost);
router.get("/toggleLike/:id", verifyToken, PostController.toggleLikePost);
router.get("/comment/:postId", PostController.getComments);
router.post("/comment/:id", verifyToken, PostController.comment);

module.exports = router;
