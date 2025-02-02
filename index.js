const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const registerRoutes = require("./routes/registerRoutes");
const userRoutes = require("./routes/userRoutes");

app.use(cors());

app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(
        "DB connected Successfully and listening to " + process.env.PORT
      );
    });
  })
  .catch((error) => console.log(error));

app.use("/api", registerRoutes);
app.use("/api", userRoutes);
