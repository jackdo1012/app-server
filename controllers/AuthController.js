const UserModel = require("../models/User.js");
const FollowModel = require("../models/Follow.js");
const NotificationModel = require("../models/Notification.js");
const jwt = require("jsonwebtoken");
const argon2 = require("argon2");
const axios = require("axios").default;
const { imgTypeSupported, serverError } = require("../constants.js");
const { createToken, checkPassword } = require("../service/auth.js");

const passwordCheckRegex = /['"\s]/;
class AuthController {
    // [GET] /
    async index(req, res) {
        try {
            const userId = req.userId;
            const user = await UserModel.findById(userId);
            if (user) {
                return res.json({
                    success: true,
                    message: "User is authenticated",
                    username: user.public.username,
                    gender: user.public.gender,
                    avatar: user.public.avatarUrl,
                });
            }
            return res.json({
                success: false,
                message: "User is not logged in",
            });
        } catch (error) {
            return serverError(res, error.message);
        }
    }

    // [POST] /register
    async register(req, res) {
        try {
            let { username, password, confirmPassword, gender, avatarUrl } =
                req.body;
            let user = await UserModel.findOne({ "public.username": username });
            // Simple validation
            if (!username || !password || !confirmPassword) {
                return res.status(400).json({
                    success: false,
                    message: "Missing username and/or password",
                });
            } else if (password !== confirmPassword) {
                return res.status(400).json({
                    success: false,
                    message: "Password does not match",
                });
            } else if (user) {
                return res.status(400).json({
                    success: false,
                    message: "Username has been taken",
                });
            } else if (passwordCheckRegex.test(password)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid charater",
                });
            }
            if (!avatarUrl) {
                avatarUrl = `https://avatars.dicebear.com/api/bottts/${username}.svg?colorful=true`;
            } else {
                // Image varification
                try {
                    let imgData = await axios.get(avatarUrl, {
                        responseType: "arraybuffer",
                        responseEncoding: "binary",
                    });
                    imgData = imgData.data.toString("hex", 0, 4);
                    for (
                        let i = 0;
                        i < Object.values(imgTypeSupported).length;
                        i++
                    ) {
                        if (imgData == Object.values(imgTypeSupported)[i]) {
                            break;
                        } else if (
                            i ==
                            Object.values(imgTypeSupported).length - 1
                        ) {
                            throw new Error("Invalid img");
                        }
                    }
                } catch (err) {
                    return res.status(400).json({
                        success: false,
                        message:
                            "Url is not an image, only support .png, .jpg, .jpeg",
                    });
                }
            }
            // Create user
            const hashedPassword = await argon2.hash(password);
            const newUser = new UserModel({
                password: hashedPassword,
                public: {
                    username,
                    gender,
                    avatarUrl,
                },
            });
            await newUser.save();
            // Create follow
            const newFollow = new FollowModel({
                following: [],
                followed: [],
                username,
            });
            await newFollow.save();
            // Create notification
            const newNotification = new NotificationModel({
                username,
                notificationList: [],
            });
            await newNotification.save();
            user = await UserModel.findOne({ "public.username": username });
            const accessToken = createToken(user._id, user.password);
            return res.json({
                success: true,
                message: "User created successfully",
                accessToken,
            });
        } catch (error) {
            return serverError(res, error.message);
        }
    }

    // [POST] /login
    async login(req, res) {
        try {
            const { username, password } = req.body;
            // Validation
            if (!username || !password) {
                return res.status(401).json({
                    success: false,
                    message: "Missing username and/or password",
                });
            } else if (passwordCheckRegex.test(password)) {
                return res.status(401).json({
                    success: false,
                    message: "Wrong username and/or password",
                });
            }
            const user = await UserModel.findOne({
                "public.username": username,
            });
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "Wrong username and/or password",
                });
            }
            const passwordCheck = await checkPassword(user._id, password);

            if (!passwordCheck) {
                return res.status(401).json({
                    success: false,
                    message: "Wrong username and/or password",
                });
            }

            const accessToken = createToken(user._id, user.password);
            res.json({
                success: true,
                message: "Login successfully",
                accessToken,
            });
        } catch (error) {
            return serverError(res, error.message);
        }
    }

    // [PUT] /changePassword
    async changePassword(req, res) {
        try {
            const { oldPassword, newPassword, confirmPassword } = req.body;
            const user = await UserModel.findById(req.userId);

            // Validation
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "User is not logged in",
                });
            }
            const verifyPassword = await argon2.verify(
                user.password,
                oldPassword,
            );
            if (passwordCheckRegex.test(newPassword)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid character",
                });
            } else if (!oldPassword || !newPassword || !confirmPassword) {
                return res.status(400).json({
                    success: false,
                    message: "Missing information",
                });
            } else if (oldPassword === newPassword) {
                return res.status(400).json({
                    success: false,
                    message: "You can't use old password",
                });
            } else if (newPassword !== confirmPassword) {
                return res.status(400).json({
                    success: false,
                    message: "Password don't match",
                });
            } else if (!verifyPassword) {
                return res
                    .status(401)
                    .json({ success: false, message: "Wrong password" });
            }
            const newHashPassword = await argon2.hash(newPassword);
            await UserModel.findOneAndUpdate(
                { "public.username": username },
                { password: newHashPassword },
            );
            res.json({
                success: true,
                message: "Password changed successfully",
            });
        } catch (error) {
            return serverError(res, error.message);
        }
    }

    // [PUT] /changeAvatar
    async changeAvatar(req, res) {
        try {
            const { avatarUrl } = req.body;
            const user = await UserModel.findById(req.userId);

            // Validation
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "User is not logged in",
                });
            }
            // Img varification
            try {
                let imgData = await axios
                    .get(avatarUrl, {
                        responseType: "arraybuffer",
                        responseEncoding: "binary",
                    })
                    .then((data) => data.data);

                imgData = imgData.toString("hex", 0, 4);
                for (
                    let i = 0;
                    i < Object.values(imgTypeSupported).length;
                    i++
                ) {
                    if (imgData == Object.values(imgTypeSupported)[i]) {
                        break;
                    } else if (
                        i ==
                        Object.values(imgTypeSupported).length - 1
                    ) {
                        throw new Error("Invalid img");
                    }
                }
            } catch (err) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Url is not an image, only support .png, .jpg, .jpeg",
                });
            }
            // Change avatar
            await UserModel.findOneAndUpdate(
                { _id: req.userId },
                { "public.avatarUrl": avatarUrl },
            );
            res.json({ success: true, message: "Avatar changed successfully" });
        } catch (error) {
            return serverError(res, error.message);
        }
    }
}
module.exports = new AuthController();
