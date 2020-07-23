// @login & register

const express = require('express');
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const gravatar = require("gravatar");
const User = require('../../models/User');
const { secretOrKey } = require('../../config/keys');
const passport = require("passport");

// $route POST api/users/register
// @desc 返回的请求的json数据
// @access public
router.post("/register", (req, res) => {
  // 查询数据库中是否拥有邮箱
  User.findOne({ email: req.body.email }).then((user) => {
    if (user) {
      return res.status(400).json("邮箱已被注册！");
    } else {
      const avatar = gravatar.url(req.body.email, { s: '200', r: 'g', d: 'robohash' });
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar,
        password: req.body.password,
        identity: req.body.identity
      });
      bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          newUser.password = hash;
          newUser.save()
            .then(user => res.json(user))
            .catch(err => {
              console.log(err);
            });
        });
      });
    }
  });
});

// $route POST api/users/login
// @desc 返回token jwt passport
// @access public
router.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  // 查询数据库
  User.findOne({ email }).then(user => {
    if (!user) {
      return res.status(404).json("用户不存在");
    } else {
      // 密码匹配
      bcrypt.compare(password, user.password).then((isMatch) => {
        if (isMatch) {
          const payload = {
            id: user.id,
            name: user.name,
            avatar: user.avatar,
            identity: user.identity
          };
          jwt.sign(payload, secretOrKey, { expiresIn: 3600 }, (err, token) => {
            if (err) throw err;
            return res.json({
              success: true,
              token: "Bearer " + token
            });
          });
        } else {
          return res.status(400).json("密码错误！");
        }
      });
    }
  })
});

// $route POST api/users/current
// @desc return current user
// @access private
router.get("/current", passport.authenticate("jwt", { session: false }), (req, res) => {
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    identity: req.user.identity
  });
});

module.exports = router;