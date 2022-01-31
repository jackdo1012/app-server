const mongoose = require("mongoose");
const connectDB = async () => {
    try {
        console.log(process.env.DATABASE_URI);
        await mongoose.connect(process.env.DATABASE_URI);

        console.log("Connected to DB");
    } catch (error) {
        console.log(error);
    }
};

module.exports = { connectDB };
