const { Server } = require("socket.io");
const socketRoute = require("../socket/index");
let privateIo = null;
let publicIo = null;

exports.privateIo = () => privateIo;
exports.publicIo = () => publicIo;
module.exports.init = (httpServer) => {
    privateIo = new Server(httpServer, {
        path: "/private/",
        cors: process.env.CORS_ORIGIN,
    });
    publicIo = new Server(httpServer, {
        path: "/public/",
        cors: process.env.CORS_ORIGIN,
    });
    socketRoute(privateIo, publicIo);
    return { privateIo, publicIo };
};
