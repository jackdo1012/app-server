const privatePostHandler = require("./private/postHandler.js");
const privateFollowHandler = require("./private/followHandler.js");
const privateCommentHandler = require("./private/commentHandler.js");
const publicLikeHandler = require("./public/likeHandler");
const publicCommentHandler = require("./public/commentHandler");
const publicFollowHandler = require("./public/followHandler");

module.exports = (privateIo, publicIo) => {
    privatePostHandler(privateIo);
    privateFollowHandler(privateIo);
    privateCommentHandler(privateIo);
    publicLikeHandler(publicIo);
    publicCommentHandler(publicIo);
    publicFollowHandler(publicIo);
};
