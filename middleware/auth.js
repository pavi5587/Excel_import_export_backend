const jwt = require("jsonwebtoken");
const { secretKey } = require("../controllers/registerController");
console.log("secretKey12", secretKey);

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  console.log("Authorization Header:", authHeader); 

  if (!authHeader) return res.sendStatus(401);

  const token = authHeader.split(" ")[1];
  console.log("Token:", token);
  if (!token) return res.sendStatus(401);
  try {
    const verified = jwt.verify(token, secretKey);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).send("Invalid token !");
  }
};

module.exports = authenticateToken;