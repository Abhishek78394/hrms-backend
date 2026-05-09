require("dotenv").config();
const env = require("./src/config/env");

console.log("SMTP_HOST from env module:", env.SMTP_HOST);
console.log("SMTP_PORT from env module:", env.SMTP_PORT);
console.log("process.env.SMTP_HOST:", process.env.SMTP_HOST);
