const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const env = require("../../../config/env");
const roles = require("../../../common/constants/roles");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    phone: { type: String, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: Object.values(roles), default: roles.EMPLOYEE, index: true },
    status: { type: String, enum: ["active", "inactive", "suspended"], default: "active" },
    passwordChangedAt: { type: Date },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, default: null, select: false },
    resetPasswordToken: { type: String, default: null, select: false },
    resetPasswordExpiresAt: { type: Date, default: null, select: false },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
    deletedAt: { type: Date, default: null, index: true }
  },
  { 
    timestamps: true, 
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

userSchema.virtual("fullName").get(function fullName() {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, Number(env.BCRYPT_SALT_ROUNDS));
  return next();
});

userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
