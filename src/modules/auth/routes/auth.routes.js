const express = require("express");
const validate = require("../../../common/middleware/validate");
const authController = require("../controller/auth.controller");
const authValidation = require("../validation/auth.validation");

const router = express.Router();

router.post("/login", validate(authValidation.login), authController.login);
router.post("/refresh-token", validate(authValidation.refreshToken), authController.refreshToken);
router.post("/logout", validate(authValidation.refreshToken), authController.logout);
router.post("/forgot-password", validate(authValidation.forgotPassword), authController.forgotPassword);
router.post("/reset-password", validate(authValidation.resetPassword), authController.resetPassword);

module.exports = router;
