
const jwt = require("jsonwebtoken");
const GoogleStrategy = require('passport-google-oauth20').Strategy
const passport = require('passport')
const User = require('../models/users');
var path = require('path');
var moment = require('moment');
const envPath = path.join(__dirname, '.env.example');
require('dotenv').config({ path: envPath });
const student_feature_list = [
  { access: "Course", icon: "<i class='fa-solid fa-graduation-cap'></i>" },
  { access: "Subscribed", icon: "<i class='fa-solid fa-square-check'></i>" }
]

// middleware/authentication.js
function authentication(req, res, next) {
  if (req.session.loggedIn) {
    // console.log("LOGGED IN")
    next();
  }
  else {
    console.log("NOT LOGGED IN")
    res.redirect('/login');
  }
}



function isAdmin(req, res, next) {
  if(req.session.isAdmin){
    next();
  }
  else {
    return res.status(403).json({ error: 'Permission Denied' });
  }
}



passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).lean()
  .then(user => {
      done(null, user);
  });
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback",
  passReqToCallback: true,
},
async (req, accessToken, refreshToken, profile, done) => {
  const newUser = {
      googleId: profile.id,
      username: profile.id,
      fullName: profile.displayName,
      lastLogin: moment().format("HH:mm | DD/MM/YYYY"),
      profilePicture: profile.photos[0].value,
      email: profile.emails[0].value,
      access: student_feature_list,
      role: 'student',
  };
  try {
      let user = await User.findOne({ googleId: profile.id });

      if (user) {
          // Nếu người dùng đã tồn tại, trả về người dùng
          await req.login(user, function(err) {
            if (err) { return next(err); 
          }
          req.session.account = user._id.toString();
          req.session.role = user.role;
          req.session.access = user.access;

          const sidebar = req.session.access;

          const data_render = req.page_data ? req.page_data : "";

          req.session.loggedIn = true;
        })
        done(null, user);
      } else {
          // Nếu người dùng chưa tồn tại, tạo người dùng mới
          user = await User.create(newUser);
          req.login(user, function(err) {
              if (err) { return next(err); }
              done(null, user);
          });
      }
  } catch (error) {
      done(error);
  }
}));

module.exports = { authentication , isAdmin };