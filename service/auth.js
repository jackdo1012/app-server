const jwt = require("jsonwebtoken");
const argon2 = require("argon2");
const UserModel = require("../models/User");

module.exports.createToken = (userId, password) => {
    const accessToken = jwt.sign(
        { userId, password },
        process.env.JWT_SECRET_KEY,
        {
            expiresIn: "24h",
        },
    );
    return accessToken;
};

module.exports.checkPassword = async (userId, password) => {
    const user = await UserModel.findById(userId);
    if (!user) {
        return false;
    }
    if (user.password === password) {
        return true;
    } else {
        const passwordCheck = await argon2.verify(user.password, password);
        if (!passwordCheck) {
            return false;
        } else {
            return true;
        }
    }
};
