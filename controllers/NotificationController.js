const UserModel = require("../models/User");
const NotificationModel = require("../models/Notification");
const { serverError } = require("../constants");
class NotificationController {
    async index(req, res) {
        try {
            const { page = 1 } = req.query;
            const limitPerPage = 30;
            const user = await UserModel.findById(req.userId).select("public");
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "User is not logged in",
                });
            }
            const notification = await NotificationModel.findOne(
                {
                    username: user.public.username,
                },
                {
                    notificationList: {
                        $slice: [
                            (Number(page) - 1) * limitPerPage,
                            limitPerPage,
                        ],
                    },
                },
            );
            return res.json({
                success: true,
                notification,
            });
        } catch (error) {
            return serverError(res, error.message);
        }
    }
    async readAll(req, res) {
        try {
            const user = await UserModel.findById(req.userId).select("public");
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "User is not logged in",
                });
            }
            await NotificationModel.findOneAndUpdate(
                {
                    username: user.public.username,
                    "notificationList.read": false,
                },
                {
                    $set: {
                        "notificationList.$[].read": true,
                    },
                },
            );
            return res.json({ success: true, message: "Updated successfully" });
        } catch (error) {
            return serverError(res, error.message);
        }
    }
}

module.exports = new NotificationController();
