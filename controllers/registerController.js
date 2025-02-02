const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const registerModel = require("../models/registerModel");

const secretKey = crypto.randomBytes(64).toString("hex");

const postRegister = async (req, res) => {
  const { firstName, lastName, email, phoneNumber, password, confirmPassword } =
    req.body;

  if (
    !firstName ||
    !lastName ||
    !email ||
    !phoneNumber ||
    !password ||
    !confirmPassword
  ) {
    return res.status(400).json({ message: "Please enter all fields" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  try {
    let user = await registerModel.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new registerModel({
      firstName,
      lastName,
      email,
      phoneNumber,
      password: hashedPassword,
    });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.log("err", err);
    res.status(500).json({ message: "Server error" });
  }
};

const postLogin = async (req, res) => {
  const { email, password } = req.body;

  const user = await registerModel.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "User does not exist" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ message: "Invalid email or password" });
  }


  const token = jwt.sign({ email: user.email }, secretKey, { expiresIn: "1h" });
  res.json({ token, message: "Login SuccessFully", user: user });
};

const postLogout = async (req, res) => {
  res.send("Logged out");
};

module.exports = {
  postRegister,
  postLogin,
  postLogout,
  secretKey,
};
