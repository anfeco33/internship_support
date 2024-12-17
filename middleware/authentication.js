
const jwt = require("jsonwebtoken");
const GoogleStrategy = require('passport-google-oauth20').Strategy
const passport = require('passport')
const User = require('../models/users');
var path = require('path');
var moment = require('moment');
const envPath = path.join(__dirname, '.env.example');
require('dotenv').config({ path: envPath });
const student_feature_list = [
  { access: "Student_Homepage", icon: "<i class='fa-solid fa-house'></i>" },
  { access: "Subscribed", icon: "<i class='fa-solid fa-square-check'></i>" }
]

const company_feature_list = [
  // LƯU Ý: khi thay đổi trong này, cần tạo lại acc mới vì acc cũ chỉ lưu các access cũ
  // sửa luôn trong main.js

  { access: "Course", icon: "<i class='fa-solid fa-graduation-cap'></i>" },
  { access: "Exercise", icon: "<i class='fa-solid fa-pen-to-square'></i>" }
]

// middleware/authentication.js
function authentication(req, res, next) {
  // console.log("Session in authentication middleware:", req.session);
  // if (req.session.loggedIn) {
  //   console.log("User is logged in:", req.session);
  //   next();
  // }
  // else {
  //   console.log("NOT LOGGED IN. Redirecting to /login");
  //   res.redirect('/login');
  // }
    // Passport xác nhận người dùng đã được xác thực
    if (req.session.loggedIn) {
      console.log("User is authenticated:", req.user);
      return next();
    }
  
    // Xử lý vòng lặp khi session chứa user nhưng không được xác thực bởi Passport
    if (req.session?.passport?.user && req.session.loggedIn) {
      console.log("Session contains logged-in user but not authenticated by Passport. Skipping authentication.");
      return next();
    }
    console.log("User not authenticated. Redirecting to /login");

    res.redirect('/login');
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

// passport.deserializeUser((id, done) => {
//   User.findById(id).lean()
//   .then(user => {
//       done(null, user);
//   });
// });

passport.deserializeUser((id, done) => {
  console.log("Deserializing user with ID:", id);
  User.findById(id).lean()
      .then(user => {
          if (user) {
              console.log("User found during deserialization:", user);
              done(null, user);
          } else {
              console.log("No user found with ID:", id);
              done(null, false);
          }
      })
      .catch(err => {
          console.error("Error during deserialization:", err);
          done(err, null);
      });
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback",
  passReqToCallback: true,
},
async (req, accessToken, refreshToken, profile, done) => {
  console.log("Google profile received:", profile);
  // nếu user là student (đuôi .edu.vn) thì access sẽ là student_feature_list
  // nếu user là company (đuôi .com) thì access sẽ là company_feature_list
  const email = profile.emails[0].value;
  const domain = email.split('@')[1];
  console.log("Domain:", domain);
  const isStudent = domain.endsWith(".edu.vn");
  console.log("Is student:", isStudent);
  let access = isStudent ? student_feature_list : company_feature_list;
  console.log("Access :", access);

  if (email.endsWith('.edu.vn')) {
      access = student_feature_list;
  } else {
      access = company_feature_list;
  }
  
  const newUser = {
      googleId: profile.id,
      // username: profile.id,
      fullName: profile.displayName,
      lastLogin: moment().format("HH:mm | DD/MM/YYYY"),
      profilePicture: profile.photos[0].value,
      email: profile.emails[0].value,
      access: access,
      role: isStudent ? 'student' : 'company',
  };
  try {
      // let user = await User.findOne({ googleId: profile.id });
      let user = await User.findOne({ email: profile.emails[0].value });
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
          await req.login(user, function(err) {
            if (err) { return done(err); 
          }
            // req.session.account = user._id.toString();
            // console.log("req.session.account signup: ", req.session.account);
            // req.session.role = user.role;
            // req.session.access = user.access;
            // req.session.loggedIn = true;

            // req.session.save((err) => {
            //   if (err) console.error("Error saving session:", err);
            // });
             done(null, user);
        });
      }
  } catch (error) {
    console.error("Error in Google Strategy:", error);
      done(error);
  }
}));

module.exports = { authentication , isAdmin };