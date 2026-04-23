const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) return res.status(401).json("No token");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded User:", decoded);
    req.user = decoded;

    next();
  } catch (err) {
    res.status(401).json("Invalid token");
  }
};
