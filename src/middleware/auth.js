const jwt = require("jsonwebtoken");
const bookModel = require("../models/BooksModel");
const mongoose = require("mongoose");
const userModel = require("../models/userModel");

     //[ALL AUTHENTICATION LOGIC HERE ] 
const authentication = function (req, res, next) {
  try {

   const token = req.headers["x-api-key"];
    if (!token) {
      return res.status(404).send({ status: false, message: "Token must be present" });
    }

    jwt.verify(token, "Books Management", function (error, decodedToken) { 
      if (error) {
        return res.status(401).send({ status: false, message: "token invalid" });
      }
      req.userId= decodedToken.userId
      next();
    });

  } 
  catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};

module.exports.authentication = authentication;