module.exports = async (io) => {
    const commentIO = io.of("/comment");

    commentIO.on("connection", async (socket) => {
        console.log("Public comment on");

        socket.join(JSON.parse(socket.handshake.headers.rooms));
        socket.on("public-new-comment", (postId) => {
            commentIO.to(postId).emit("new-comment", postId);
        });
    });
};
