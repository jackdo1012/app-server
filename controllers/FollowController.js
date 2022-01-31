const { serverError } = require("../constants");
const FollowModel = require("../models/Follow");
const UserModel = require("../models/User");

class FollowController {
    // [GET] /get/:username
    async index(req, res) {
        try {
            const user = req.params.username;
            const userFollow = await FollowModel.findOne({
                username: user,
            });
            if (!userFollow) {
                return res
                    .status(404)
                    .json({ success: false, message: "User not found" });
            }
            return res.json({ success: true, userFollow });
        } catch (error) {
            return serverError(res, error.message);
        }
    }

    // [POST] /toggle
    async toggleFollow(req, res) {
        try {
            const user = await UserModel.findById(req.userId).select("public");
            const target = await UserModel.findOne({
                _id: req.body.targetUserId,
            })
                .populate("follow")
                .select("public follow");

            // Validation
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "User is not logged in",
                });
            } else if (!target) {
                return res.status(401).json({
                    success: false,
                    message: "User is not found",
                });
            } else if (user.public.username == target.public.username) {
                return res.status(400).json({
                    success: false,
                    message: "You can't follow yourself",
                });
            }
            // Unfollow
            if (target.follow[0].followed.includes(user.public.username)) {
                await FollowModel.findOneAndUpdate(
                    { username: target.public.username },
                    { $pull: { followed: user.public.username } },
                    { new: true },
                );
                await FollowModel.findOneAndUpdate(
                    { username: user.public.username },
                    { $pull: { following: target.public.username } },
                    { new: true },
                );
                return res.json({
                    success: true,
                    message: "Unfollowed successfully",
                    followStatus: false,
                });
            }
            // Follow
            await FollowModel.findOneAndUpdate(
                { username: target.public.username },
                { $push: { followed: user.public.username } },
                { new: true },
            );
            await FollowModel.findOneAndUpdate(
                { username: user.public.username },
                { $push: { following: target.public.username } },
                { new: true },
            );
            return res.json({
                success: true,
                message: "Followed successfully",
                followStatus: true,
            });
        } catch (error) {
            return serverError(res, error.message);
        }
    }
}

module.exports = new FollowController();
