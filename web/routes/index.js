const express = require("express");
const router = express.Router();
const { checkAuthenticated } = require("../utils/auth");
const User = require("../models/User");

// index page
router.get("/", (req, res) => {
  res.render("index");
});

// about page
router.get("/about", checkAuthenticated, (req, res) => {
  const id = req.user._id;
  const name = req.user.name;

  User.find({}, (err, users) => {
    allUser = [];
    users.forEach((user) => {
      if (user.id != id) {
        allUser.push(user);
      }
    });
    res.render("about", {
      users: allUser,
      name: name,
      id: id,
    });
  });
});

module.exports = router;
