require("dotenv").config();
const mailService = require('./src/common/services/mailService');

async function testMail() {
    try {
        console.log("Sending email...");
        await mailService.sendOtpEmail('emp02@mailinator.com', '123456');
        console.log("Success");
    } catch (e) {
        console.error("Failed:", e);
    }
}

testMail();
