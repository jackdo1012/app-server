const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
    {
        password: { type: String, required: true },
        public: {
            username: { type: String, required: true },
            gender: { type: String, enum: ["male", "female"] },
            avatarUrl: String,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);

UserSchema.virtual("follow", {
    ref: "Follow",
    localField: "public.username",
    foreignField: "username",
});

UserSchema.virtual("posts", {
    ref: "Post",
    localField: "public.username",
    foreignField: "author",
});

module.exports = mongoose.model("User", UserSchema, "users");
