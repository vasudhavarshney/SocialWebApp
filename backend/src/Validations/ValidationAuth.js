const { check } = require("express-validator");

const ValidationAuth = {
  login: [
    check("username", "User login")
      .not()
      .isEmpty(),
    check("password", "Enter your password")
      .not()
      .isEmpty()
  ]
};

module.exports = ValidationAuth;
