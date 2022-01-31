module.exports = async (io) => {
    const likeIO = io.of("/like");

    likeIO.on("connection", async (socket) => {
        console.log("Public like on");

        socket.join(JSON.parse(socket.handshake.headers.rooms));
        socket.on("public-new-like", (postId) => {
            likeIO.to(postId).emit("new-like", postId);
        });
    });
};
