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
    // Lấy flash message từ session
    var flashMessage = req.session.flash;
    if(flashMessage)
    {
        console.log(flashMessage);
    }
    // console.log(flashMessage);
    // Xóa flash message khỏi session
    delete req.session.flash;

    res.render('pages/login', { layout: false, flashMessage });

})
  .post('/login' , validate.validateLogin() ,userController.login)
  .post('/signup' , validate.validateSignup() ,userController.signup)
  .post('/logout', authentication,  userController.logout)
  .get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }))
  .get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    // const token = jwt.sign({ accountId: req.user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '30d' });
    // res.cookie("remember", token, { maxAge: 30 * 24 * 60 * 60 * 1000 });
    res.redirect('/home');
});
  // quên mk
router.get('/forgot-password', function (req, res) {
    const flashMessage = req.session.flash;
    if(flashMessage)
    {
        console.log(flashMessage);
    }
    delete req.session.flash;

    res.render('pages/forgot-password', { layout: false, flashMessage }); 
});

router.get('/reset-password/:token', async (req, res) => {
    const flashMessage = req.session.flash;
    if(flashMessage)
    {
        console.log(flashMessage);
    }
    delete req.session.flash;
    res.render('pages/reset-password', { token: req.params.token, layout: false, flashMessage });
});

router.post('/forgot-password', userController.forgotPassword)
router.post('/reset-password/:token', userController.resetPassword)


module.exports = router;

