const { socketVerifyToken } = require("../../middleware/verifyToken.js");
const UserModel = require("../../models/User.js");
const NotificationModel = require("../../models/Notification.js");
const { newFollowResponse } = require("../../constants.js");

module.exports = async (io) => {
    const followIO = io.of("/follow");

    followIO.use(socketVerifyToken);

    followIO.on("connection", async (socket) => {
        const userId = socket.handshake.auth.userId;
        console.log("Follow on");
        const user = await UserModel.findById(userId);
        if (user === null) {
            return await socket.disconnect();
        }
        socket.join(user.public.username);
        socket.on("new-follow", async (targetUsername) => {
            const responseInfo = newFollowResponse(user.public.username);
            await NotificationModel.findOneAndUpdate(
                { username: targetUsername },
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
            followIO
                .to(targetUsername)
                .emit(
                    "new-follow-notification",
                    responseInfo.title,
                    responseInfo.body,
                );
        });
    });
};
