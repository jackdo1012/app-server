const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    postId: String,
    commentsList: [
        {
            comment: String,
            user: String,
            createdAt: Date,
        },
    ],
});

module.exports = mongoose.model("Comment", CommentSchema, "comments");
