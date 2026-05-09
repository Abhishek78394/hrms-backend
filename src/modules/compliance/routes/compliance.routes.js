const Compliance = require("../model/compliance.model");
const buildCrudRouter = require("../../../common/helpers/buildCrudRouter");

module.exports = buildCrudRouter(Compliance, "compliance");
