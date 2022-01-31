const { socketVerifyToken } = require("../../middleware/verifyToken.js");
const UserModel = require("../../models/User.js");
const NotificationModel = require("../../models/Notification");
const FollowModel = require("../../models/Follow.js");
const { newPostResponse } = require("../../constants.js");

module.exports = async (io) => {
    const notificationIO = io.of("/post");

    notificationIO.use(socketVerifyToken);

    notificationIO.on("connection", async (socket) => {
        const userId = socket.handshake.auth.userId;
        console.log("Post on");
        const user = await UserModel.findById(userId);
        if (user === null) {
            return await socket.disconnect();
        }
        socket.join(user.public.username);
        // Add new post
        socket.on("new-post", async (postBody) => {
            const responseInfo = newPostResponse(
                user.public.username,
                postBody,
            );
            let followList = await FollowModel.findOne({
                username: user.public.username,
            });
            let notificationAddingList = [...followList.followed];
            notificationAddingList.forEach((person, index) => {
                notificationAddingList[index] =
                    NotificationModel.findOneAndUpdate(
                        {
                            username: person,
                        },
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
            });
            await Promise.all(notificationAddingList);
            // Emit message to each follower
            notificationIO
                .to([...followList.followed])
                .emit(
                    "new-post-notification",
                    responseInfo.title,
                    responseInfo.body,
                );
        });
    });
};
