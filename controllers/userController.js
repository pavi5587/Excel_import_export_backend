const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");
const User = require("../models/userModel");
const mongoose = require("mongoose");
const { authenticateToken } = require("../middleware/auth");

const validateUserData = (data) => {
  return data.map((user, index) => {
    let errors = [];

    if (!user["First Name"]) errors.push("First Name is missing");
    if (!user["Last Name"]) errors.push("Last Name is missing");
    if (!user["Role"]) errors.push("Role is missing");
    if (!user["DOB"] || isNaN(Date.parse(user["DOB"])))
      errors.push("Invalid DOB format");
    if (
      !user["Gender"] ||
      !["Male", "Female", "Other"].includes(user["Gender"])
    )
      errors.push("Invalid Gender");
    if (!user["Email"] || !/^\S+@\S+\.\S+$/.test(user["Email"]))
      errors.push("Invalid Email");
    if (!user["Mobile"] || !/^\d{10}$/.test(user["Mobile"]))
      errors.push("Invalid Mobile Number");
    if (!user["City"]) errors.push("City is missing");
    if (!user["State"]) errors.push("State is missing");

    return {
      row: index + 2,
      user,
      errors,
    };
  });
};

const postUploadUsers = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  console.log("req.file", req.file);
  const fileName = req.file.originalname.split(".");
  if (fileName[1] != "xlsx") {
    return res.status(400).json({ message: "Only .xlsx files are allowed!" });
  }
  try {
    const filePath = req.file.path;
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const validatedData = validateUserData(jsonData);

    const validUsers = validatedData
      .filter((item) => item.errors.length === 0)
      .map((item) => ({
        first_name: item.user["First Name"],
        last_name: item.user["Last Name"],
        role: item.user["Role"],
        dob: new Date(item.user["DOB"]),
        gender: item.user["Gender"],
        email: item.user["Email"],
        mobile: item.user["Mobile"],
        city: item.user["City"],
        state: item.user["State"],
        created_at: new Date(),
        updated_at: new Date(),
      }));
    console.log("validUsers", validUsers);

    const invalidUsers = validatedData
      .filter((item) => item.errors.length > 0)
      .map((item) => ({
        row: item.row,
        errors: item.errors,
      }));

    if (validUsers.length > 0) {
      await User.insertMany(validUsers);
    }

    res.json({
      message: "Users uploaded successfully",
      validUsersCount: validUsers.length,
      invalidUsersCount: invalidUsers.length,
      validUsers: validUsers,
      invalidUsers: invalidUsers,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error processing file", error: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching users", error: error.message });
  }
};

const updateUsers = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUser = await User.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updatedUser);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating user", error: error.message });
  }
};

const deleteUsers = async (req, res) => {
  try {
    const { id } = req.params;
    const cleanedId = id.trim();

    if (!mongoose.Types.ObjectId.isValid(cleanedId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    await User.findByIdAndDelete(cleanedId);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting user", error: error.message });
  }
};

const getExportUsers = async (req, res) => {
  try {
    const users = await User.find();

    const data = users.map((user) => ({
      "First Name": user.first_name,
      "Last Name": user.last_name,
      Role: user.role,
      DOB: user.dob.toISOString().split("T")[0],
      Gender: user.gender,
      Email: user.email,
      Mobile: user.mobile,
      City: user.city,
      State: user.state,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");

    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=users.xlsx");

    res.send(buffer);
  } catch (error) {
    console.error("Export Error:", error);
    res
      .status(500)
      .json({ message: "Error exporting users", error: error.message });
  }
};

module.exports = {
  postUploadUsers,
  getUsers,
  updateUsers,
  deleteUsers,
  getExportUsers,
};
