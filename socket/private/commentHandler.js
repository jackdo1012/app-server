const { socketVerifyToken } = require("../../middleware/verifyToken.js");
const PostModel = require("../../models/Post.js");
const UserModel = require("../../models/User.js");
const NotificationModel = require("../../models/Notification.js");
const { newCommentResponse } = require("../../constants.js");

module.exports = async (io) => {
    const commentIO = io.of("/comment");
    commentIO.use(socketVerifyToken);

    commentIO.on("connection", async (socket) => {
        const userId = socket.handshake.auth.userId;
        const user = await UserModel.findById(userId).select("public");
        if (user === null) {
            return await socket.disconnect();
        }
        console.log("Comment on");
        socket.join(user.public.username);
        socket.on("new-comment", async (comment, postId) => {
            const responseInfo = newCommentResponse(
                user.public.username,
                comment,
            );
            const post = await PostModel.findById(postId);
            await NotificationModel.findOneAndUpdate(
                { username: post.author },
                {
                    $push: {
                        notificationList: {
                            $each: [
                                {
                                    title: responseInfo.title,
                                    body: responseInfo.body,
                                },
                            ],
                            $position: 0,
                        },
                    },
                },
                { new: true },
            );
            commentIO
                .to(post.author)
                .emit(
                    "new-comment-notification",
                    responseInfo.title,
                    responseInfo.body,
                );
        });
    });
};
