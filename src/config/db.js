const mongoose = require("mongoose");
const env = require("./env");
const logger = require("./logger");

const connectDB = async () => {
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.MONGO_URI);
  logger.info("MongoDB connected");
};

module.exports = connectDB;
