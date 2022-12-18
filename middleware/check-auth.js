const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();
const HttpError = require("../models/http-error");

function checkAuth(req, res, next) {
  if (req.method === "OPTIONS") return next();
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) return next(new HttpError("Auth failed", 401));

    const decodedToken = jwt.verify(token, process.env.TOKEN_CODE);
    req.userData = { userId: decodedToken.userId };
    next();
  } catch (error) {
    return next(new HttpError("Unauthorized", 500));
  }
}

exports.checkAuth = checkAuth;
