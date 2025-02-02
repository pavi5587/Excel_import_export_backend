const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const RegisterSchema = new Schema(
  {
    firstName: { type: String, required: true, unique: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: Number, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Register", RegisterSchema);