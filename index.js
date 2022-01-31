require("dotenv").config();
const route = require("./routes");
const port = process.env.PORT || 5000;
const middleware = require("./middleware");
const { init: initSocket } = require("./config/socket");
const appInit = require("./config/express");

const main = async () => {
    const { app, httpServer } = await appInit();
    // Socket.io init
    const { privateIo, publicIo } = initSocket(httpServer);

    // Middleware
    middleware(app);

    // Router
    route(app);

    // App init
    httpServer.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });
};

main();
