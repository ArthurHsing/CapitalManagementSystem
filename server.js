const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const app = express();

// DB config
const db = require('./config/keys').mongoURI;

// 引入user.js
const users = require('./routes/api/users.js');
const profiles = require('./routes/api/profiles');

// 使用body-parser中间件
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// 使用routes
app.use("/api/users", users);
app.use("/api/profiles", profiles);

mongoose.connect(db, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
}).then(() => console.log('Mongoose connected')).catch(err => console.log(err))
const port = process.env.PORT || 5000;

// passport 初始化
app.use(passport.initialize());
require("./config/passport")(passport);

app.listen(port, () => {
  console.log(`Server is running on port ${port}...`);
});