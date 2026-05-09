const express = require("express");
const controller = require("../controller/document.controller");
const auth = require("../../../common/middleware/auth");

const router = express.Router();
router.use(auth);

router.post("/", controller.uploadDocument);
router.get("/", controller.listDocuments);
router.get("/:id", controller.getDocument);
router.delete("/:id", controller.deleteDocument);

module.exports = router;
