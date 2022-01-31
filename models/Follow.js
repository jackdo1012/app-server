const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FollowSchema = new Schema({
    following: [],
    followed: [],
    username: String,
});

module.exports = mongoose.model("Follow", FollowSchema, "follow");
