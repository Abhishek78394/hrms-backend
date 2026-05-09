const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    date: { type: String, required: true, index: true },
    checkIn: Date,
    checkOut: Date,
    workMinutes: { type: Number, default: 0 },
    status: { type: String, enum: ["present", "absent", "late"], default: "present", index: true },
    geoLocation: { lat: Number, lng: Number },
    ipAddress: String,
    deviceId: String,
    deletedAt: { type: Date, default: null, index: true }
  },
  { timestamps: true, versionKey: false }
);

attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
