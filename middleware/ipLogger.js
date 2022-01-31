function ipLogger(req, res, next) {
    let ip = req.ip || req.socket.remoteAddress;
    ip = ip.split("f:")[1];
    req.userIP = ip;
    console.log("User IP address: " + ip);
    next();
}
module.exports = ipLogger;
