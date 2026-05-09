const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { successResponse } = require("../utils/apiResponse");
const auth = require("../middleware/auth");
const allowRoles = require("../middleware/rbac");
const auditLog = require("../middleware/auditLog");
const { ADMIN, HR, EMPLOYEE } = require("../constants/roles");

const buildCrudRouter = (Model, moduleName) => {
  const router = express.Router();
  router.use(auth);

  router.post(
    "/",
    allowRoles(ADMIN, HR),
    auditLog(moduleName, "create"),
    asyncHandler(async (req, res) => {
      const data = await Model.create(req.body);
      return successResponse(res, `${moduleName} created`, data, {}, 201);
    })
  );

  router.get(
    "/",
    allowRoles(ADMIN, HR, EMPLOYEE),
    asyncHandler(async (req, res) => {
      const items = await Model.find({ deletedAt: null }).sort("-createdAt").limit(Number(req.query.limit || 20));
      return successResponse(res, `${moduleName} list`, items, { total: items.length });
    })
  );

  router.get(
    "/:id",
    allowRoles(ADMIN, HR, EMPLOYEE),
    asyncHandler(async (req, res) => {
      const item = await Model.findOne({ _id: req.params.id, deletedAt: null });
      return successResponse(res, `${moduleName} details`, item || {});
    })
  );

  router.patch(
    "/:id",
    allowRoles(ADMIN, HR),
    auditLog(moduleName, "update"),
    asyncHandler(async (req, res) => {
      const item = await Model.findOneAndUpdate({ _id: req.params.id, deletedAt: null }, req.body, { new: true });
      return successResponse(res, `${moduleName} updated`, item || {});
    })
  );

  router.delete(
    "/:id",
    allowRoles(ADMIN, HR),
    auditLog(moduleName, "delete"),
    asyncHandler(async (req, res) => {
      await Model.findByIdAndUpdate(req.params.id, { deletedAt: new Date() });
      return successResponse(res, `${moduleName} deleted`);
    })
  );

  return router;
};

module.exports = buildCrudRouter;
