const Joi = require("joi");

const STATUS_ENUM = ["Active", "Inactive", "On Leave", "Notice Period", "Resignation", "Termination", "Layoff", "Retirement", "Contract End", "Absconded", "Suspended", "Archived"];
const ROLE_ENUM = ["Admin", "HR", "Employee"];

const createEmployee = Joi.object({
  body: Joi.object({
    employeeId: Joi.string().allow(""),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().allow(""),
    department: Joi.string().required(),
    designation: Joi.string().required(),
    salary: Joi.number().min(0).default(0),
    joiningDate: Joi.date().required(),
    about: Joi.string().allow(""),
    password: Joi.string().min(6).allow(""),
    confirmPassword: Joi.string().valid(Joi.ref('password')).allow(""),
    address: Joi.string().allow(""),
    emergencyContact: Joi.string().allow(""),
    profileImage: Joi.string().allow(""),
    role: Joi.string().valid(...ROLE_ENUM).default("Employee"),
    status: Joi.string().valid(...STATUS_ENUM).default("Active")
  }).required(),
  params: Joi.object({}),
  query: Joi.object({}),
  headers: Joi.object().unknown(true)
});

const listEmployees = Joi.object({
  body: Joi.object({}),
  params: Joi.object({}),
  query: Joi.object({
    page: Joi.number().default(1),
    limit: Joi.number().default(10),
    search: Joi.string().allow(""),
    department: Joi.string().allow(""),
    status: Joi.string().allow(""),
    designation: Joi.string().allow(""),
    sort: Joi.string().default("-createdAt")
  }),
  headers: Joi.object().unknown(true)
});

const idParam = Joi.object({
  body: Joi.object({}),
  params: Joi.object({ id: Joi.string().required() }),
  query: Joi.object({}),
  headers: Joi.object().unknown(true)
});

const updateEmployee = Joi.object({
  body: Joi.object({
    firstName: Joi.string(),
    lastName: Joi.string(),
    email: Joi.string().email(),
    phone: Joi.string(),
    department: Joi.string(),
    designation: Joi.string(),
    salary: Joi.number().min(0),
    joiningDate: Joi.date(),
    about: Joi.string(),
    address: Joi.string(),
    emergencyContact: Joi.string(),
    profileImage: Joi.string().allow(""),
    role: Joi.string().valid(...ROLE_ENUM),
    status: Joi.string().valid(...STATUS_ENUM)
  }),
  params: Joi.object({ id: Joi.string().required() }),
  query: Joi.object({}),
  headers: Joi.object().unknown(true)
});

module.exports = { createEmployee, listEmployees, idParam, updateEmployee };
