const PostModel = require("../models/Post");
const UserModel = require("../models/User");
const CommentModel = require("../models/Comment");
const axios = require("axios").default;
const { imgTypeSupported, serverError } = require("../constants.js");

class PostController {
    // [GET] /:username
    async index(req, res) {
        try {
            const { username } = req.params;
            const postsList = await PostModel.find({
                author: username,
            }).populate("comments");
            if (postsList.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "This user has no post",
                });
            }
            return res.json({ success: true, postsList });
        } catch (error) {
            return serverError(res);
        }
    }

    // [GET] /:id
    async getFromId(req, res) {
        try {
            const { id } = req.params;
            const post = await PostModel.findById(id).populate("comments");
            if (!post) {
                return res
                    .status(404)
                    .json({ success: false, message: "Post not found" });
            }
            return res.json({ success: true, post });
        } catch (error) {
            return serverError(res);
        }
    }
    // [POST] /new
    async newPost(req, res) {
        try {
            const { body, imgUrl = [] } = req.body;
            const author = await UserModel.findById(req.userId).select(
                "public",
            );
            if (!author) {
                return res.status(401).json({
                    success: false,
                    message: "User is not logged in",
                });
            }
            if (!body && imgUrl.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Missing infomation",
                });
            }
            // Image varification
            let imgRequestList = [];
            imgUrl.forEach((url) =>
                imgRequestList.push(
                    axios.get(url, {
                        responseType: "arraybuffer",
                        responseEncoding: "binary",
                    }),
                ),
            );
            try {
                const imgData = await Promise.all(imgRequestList);
                imgData.forEach((value) => {
                    let data = value.data.toString("hex", 0, 4);
                    for (
                        let i = 0;
                        i < Object.values(imgTypeSupported).length;
                        i++
                    ) {
                        if (data == Object.values(imgTypeSupported)[i]) {
                            break;
                        } else if (
                            i ==
                            Object.values(imgTypeSupported).length - 1
                        ) {
                            throw new Error("Invalid img");
                        }
                    }
                });
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Url is not an image, only support .png, .jpg, .jpeg",
                });
            }
            // Create comment DB
            const comment = new CommentModel({
                commentsList: [],
            });
            await comment.save();

            // Create new post
            const newPost = new PostModel({
                body,
                imgUrl,
                author: author.public.username,
                comments: comment._id,
            });
            await newPost.save();
            await CommentModel.findByIdAndUpdate(
                comment._id,
                { postId: newPost._id.toString() },
                { new: true },
            );
            res.json({
                success: true,
                message: "Post created successfully",
            });
        } catch (error) {
            return serverError(res, error.message);
        }
    }
    // [GET] /toggleLike/:id
    async toggleLikePost(req, res) {
        try {
            // User authentication
            const user = await UserModel.findById(req.userId).select("public");
            if (!user) {
                return res.staus(401).json({
                    success: false,
                    message: "User is not logged in",
                });
            }
            const posts = await PostModel.findById(req.params.id);
            if (!posts) {
                return res
                    .staus(404)
                    .json({ success: false, message: "No posts found" });
            }
            // Unlike
            if (posts.like.includes(user.public.username)) {
                await PostModel.findOneAndUpdate(
                    { _id: req.params.id },
                    { $pull: { like: user.public.username } },
                    { new: true },
                );
                return res.json({ success: true, message: "Unliked" });
            }
            // Like
            await PostModel.findOneAndUpdate(
                { _id: req.params.id },
                { $push: { like: user.public.username } },
                { new: true },
            );
            return res.json({ success: true, message: "Liked" });
        } catch (err) {
            return serverError(res, err.message);
        }
    }
    // [GET] /comment/:postId
    async getComments(req, res) {
        try {
            const postId = req.params.postId;
            const comments = await CommentModel.findOne({ postId: postId });
            if (!comments) {
                return res.status(404).json({
                    success: false,
                    message: "No comments found",
                });
            }
            return res.json({ success: true, comments });
        } catch (err) {
            return serverError(res, err.message);
        }
    }
    // [POST] /comment/:id
    async comment(req, res) {
        try {
            const { comment } = req.body;
            // User authentication
            const user = await UserModel.findById(req.userId).select("public");
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "User is not logged in",
                });
            }
            const posts = await PostModel.findById(req.params.id);
            if (!posts) {
                return res
                    .status(404)
                    .json({ success: false, message: "No posts found" });
            }
            // Add comment to DB
            await CommentModel.findOneAndUpdate(
                { _id: posts.comments },
                {
                    $push: {
                        commentsList: {
                            comment: comment,
                            user: user.public.username,
                            createdAt: Date.now(),
                        },
                    },
                },
                { new: true },
            );
            res.json({ success: true, message: "Comment added" });
        } catch (err) {
            return serverError(res, err.message);
        }
    }
}

module.exports = new PostController();
