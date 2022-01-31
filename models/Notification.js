const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    username: String,
    notificationList: [
        {
            title: String,
            body: String,
            read: { type: Boolean, default: false },
            createdAt: { type: Date, default: Date.now },
        },
    ],
});

module.exports = mongoose.model(
    "Notification",
    notificationSchema,
    "notifications",
);
