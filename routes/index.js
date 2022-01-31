const authRouter = require("./auth.js");
const notificationRouter = require("./notification.js");
const followRouter = require("./follow.js");
const userRouter = require("./user.js");
const postRouter = require("./posts.js");

function route(app) {
    app.get("/", (_, res) => {
        res.json({ success: true, message: "Hello World" });
    });
    app.use("/auth", authRouter);
    app.use("/follow", followRouter);
    app.use("/user", userRouter);
    app.use("/posts", postRouter);
    app.use("/notification", notificationRouter);
}

module.exports = route;
