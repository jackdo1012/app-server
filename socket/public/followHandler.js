const { socketVerifyToken } = require("../../middleware/verifyToken");
const UserModel = require("../../models/User");

module.exports = async (io) => {
    const likeIO = io.of("/follow");
    likeIO.use(socketVerifyToken);

    likeIO.on("connection", async (socket) => {
        const userId = socket.handshake.auth.userId;
        const user = await UserModel.findById(userId).select("public");
        if (user === null) {
            return await socket.disconnect();
        }
        console.log("Public follow on");

        socket.join(JSON.parse(socket.handshake.headers.rooms));
        socket.on("public-new-follow", (followUser) => {
            likeIO.to([followUser, user.public.username]).emit("new-follow");
        });
    });
};
