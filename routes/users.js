//https://github.com/bradtraversy/node_passport_login 참고
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const passport = require("passport");
const User = require("../models/User");

// login page
router.get("/login", (req, res) => {
  res.render("users/login");
});

// login handling
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/about",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
});

// register page
router.get("/register", (req, res) => {
  res.render("users/register");
});

// register handling
router.post("/register", (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ msg: "모두 입력해야 합니다..." });
  }

  if (password !== password2) {
    errors.push({ msg: "비밀번호가 맞지 않습니다..." });
  }

  if (password.length < 6) {
    errors.push({ msg: "비밀번호는 최소 6자리여야 합니다..." });
  }

  if (errors.length > 0) {
    res.render("users/register", {
      errors,
      name,
      email,
    });
  } else {
    User.findOne({
      email: email,
    }).then((user) => {
      if (user) {
        errors.push({ msg: "해당 이메일이 이미 존재합니다!" });
        res.render("users/register", {
          errors,
          name,
          email,
        });
      } else {
        // bcrypt
        const newUser = new User({
          name,
          email,
          password,
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) {
              throw err;
            }

            // Hashed password
            newUser.password = hash;
            newUser
              .save()
              .then((user) => {
                req.flash("successMsg", "이메일이 성공적으로 등록됐습니다!");
                res.redirect("/users/login");
              })
              .catch((err) => {
                console.log(err);
              });
          });
        });
      }
    });
  }
});

router.get("/logout", (req, res) => {
  req.logout();
  req.flash("successMsg", "로그아웃 되었습니다!");
  res.redirect("/users/login");
});

module.exports = router;
