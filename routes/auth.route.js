var express = require('express');
const router = express.Router();
const passport = require('passport')
const jwt = require("jsonwebtoken");

var { authentication, isAdmin } = require('../middleware/authentication');

const { validate } = require('../controllers/validator');

const { validationResult } = require('express-validator');

const userController = require('../controllers/user.controllers');


router.get('/' , (req, res) => {
    res.redirect('/login')
})

//TODO: Chia authRoute và check đăng nhập trong dtb
router.get('/login', function (req, res) {
    var flashMessage = req.session.flash;
    if(flashMessage)
    {
        console.log("flash-otp:  ", flashMessage);
    }
    // Xóa flash message khỏi session
    delete req.session.flash;

    res.render('pages/login', { layout: false, flashMessage });
})
//   .post('/login' , validate.validateLogin() ,userController.login)
//   .post('/signup' , validate.validateSignup() ,userController.signup)
  .post('/logout', authentication,  userController.logout)
  .get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }))
  .get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
      console.log("Session after Google Login Callback:", req.session);
  
      req.session.account = req.user._id.toString();
      req.session.loggedIn = true;
    //   req.session.isAdmin = false;
    //   req.session.role = req.user.role;
    //   req.session.access = req.user.access;
        
        req.session.save((err) => {
            if (err) {
            console.error("Error saving session:", err);
            return res.redirect('/login'); // Xử lý lỗi lưu session
            }
            // Redirect sau khi session được lưu
            const redirectUrl = req.user.role === 'admin' ? '/admin/company' : '/home';
            res.redirect(redirectUrl);
        });
  });

router.get('/login/verify-otp', async (req, res) => {
    const flashMessage = req.session.flash;
    if(flashMessage)
    {
        console.log(flashMessage);
    }
    delete req.session.flash;
    res.render('pages/login', { layout: false, flashMessage });
});

router.post('/login', userController.sendOTP_func)
router.post('/login/verify-otp', userController.verify_OTP)

module.exports = router;

