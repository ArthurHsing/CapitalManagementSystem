// @login & register

const express = require('express');
const router = express.Router();
const passport = require("passport");
const Profile = require('../../models/Profile');

// $route POST api/profiles/test
// @desc 返回的请求的json数据
// @access public
router.get('/test', (req, res) => {
  res.json({ msg: 'profile works' });
});

// $route POST api/profiles/add
// @desc 创建信息接口
// @access private
router.post("/add", passport.authenticate('jwt', { session: false }), (req, res) => {
  const profileFields = {};
  if (req.body.type) profileFields.type = req.body.type;
  if (req.body.describe) profileFields.describe = req.body.describe;
  if (req.body.income) profileFields.income = req.body.income;
  if (req.body.expend) profileFields.expend = req.body.expend;
  if (req.body.cash) profileFields.cash = req.body.cash;
  if (req.body.remark) profileFields.remark = req.body.remark;

  new Profile(profileFields).save().then(profile => {
    res.json(profile);
  }).catch(err => {
    throw err;
  });
});

// $route POST api/profiles/
// @desc 查询所有信息
// @access private
router.get("/", passport.authenticate('jwt', { session: false }), (req, res) => {
  Profile.find({}).then(docs => {
    if (!docs) {
      return res.status(404).json("没有任何内容");
    }
    res.json(docs);
  }).catch(err => res.status(404).json(err));
});

// $route POST api/profiles/:id
// @desc 获取单个信息
// @access private
router.get("/:id", passport.authenticate('jwt', { session: false }), (req, res) => {
  Profile.findOne({ _id: req.params.id }).then(doc => {
    if (!doc) {
      return res.status(404).json("没有任何内容");
    }
    res.json(doc);
  }).catch(err => res.status(404).json(err));
});

// $route POST api/profiles/edit/:id
// @desc 编辑信息接口
// @access private
router.post("/edit/:id", passport.authenticate('jwt', { session: false }), (req, res) => {
  const profileFields = {};
  if (req.body.type) profileFields.type = req.body.type;
  if (req.body.describe) profileFields.describe = req.body.describe;
  if (req.body.income) profileFields.income = req.body.income;
  if (req.body.expend) profileFields.expend = req.body.expend;
  if (req.body.cash) profileFields.cash = req.body.cash;
  if (req.body.remark) profileFields.remark = req.body.remark;

  Profile.findOneAndUpdate({ _id: req.params.id }, { $set: profileFields }, { new: true })
    .then(doc => {
      if (doc) {
        return res.json(doc);
      } else {
        return res.status(404).json("木有该id的资金数据");
      }
    })
    .catch(err => { throw err });
});

// $route POST api/profiles/delete/:id
// @desc 删除信息接口
// @access private
router.delete("/delete/:id", passport.authenticate('jwt', { session: false }), (req, res) => {
  Profile.findOneAndDelete({ _id: req.params.id }).then(doc => {
    if (doc) {
      return res.json("删除成功");
    }
  }).catch(err => res.status(404).json(err));
});
module.exports = router;