const jwt = require("jsonwebtoken");
const { checkPassword } = require("../service/auth");

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    try {
        if (!token) {
            throw new Error();
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const passwordCheck = await checkPassword(
            decoded.userId,
            decoded.password,
        );

        if (!passwordCheck) {
            throw new Error();
        }

        // Attach userId to req.userId
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res
            .status(401)
            .json({ success: false, message: "User is not logged in" });
    }
};
const socketVerifyToken = async (socket, next) => {
    const token = socket.handshake.auth.token;
    try {
        if (!token) {
            next(new Error("User is not logged in"));
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const passwordCheck = await checkPassword(
            decoded.userId,
            decoded.password,
        );
        if (!passwordCheck) {
            next(new Error("User is not logged in"));
        }

        // Attach userId to req.userId
        socket.handshake.auth.userId = decoded.userId;
        next();
    } catch (error) {
        next(new Error("User is not logged in"));
    }
};
module.exports = { verifyToken, socketVerifyToken };
