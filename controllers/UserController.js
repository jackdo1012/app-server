const UserModel = require("../models/User");
const { serverError } = require("../constants.js");

class UserController {
    // [GET] /full/:username
    async index(req, res) {
        try {
            const username = req.params.username;
            const user = await UserModel.findOne({
                "public.username": username,
            })
                .populate("posts follow")
                .populate({ path: "posts", populate: { path: "comments" } })
                .select("public");
            if (!user) {
                return res
                    .status(404)
                    .json({ success: false, message: "User not found" });
            }
            return res.json({ success: true, user });
        } catch (error) {
            return serverError(res, error.message);
        }
    }
    // [GET] /public/:username
    async public(req, res) {
        try {
            const username = req.params.username;
            const user = await UserModel.findOne({
                "public.username": username,
            }).select("public");

            if (!user) {
                return res
                    .status(404)
                    .json({ success: false, message: "User not found" });
            }
            return res.json({ success: true, user });
        } catch (error) {
            return serverError(res, error.message);
        }
    }
}

module.exports = new UserController();
