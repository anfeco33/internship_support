var express = require('express');
const router = express.Router();
const Company = require('../models/companies');

var { authentication, isAdmin } = require('../middleware/authentication');

const { validate } = require('../controllers/validator');

const { validationResult } = require('express-validator');

const userController = require('../controllers/user.controllers');

const sendEmail = require('../controllers/sendEmail');

router.get('/', (req, res) => {
  res.redirect('/profile')
})
  .get('/profile', authentication, async function (req, res, next) {
    const partial = 'partials/profile';
    var layout = 'layouts/main';
    let company = null;

    if (req.session.role === 'company') {
      company = await Company.findOne({ representativeIds: req.session.account });
    }

    req.partial_path = partial
    req.layout_path = layout
    req.page_data = {
      company: company,
      businessId: company? company._id : null
    }
    await userController.getpage(req, res, next);

  })
  .post('/change_name', authentication, validate.validateChangeFullname(), userController.changeFullname)
  .post('/change_pass', authentication, validate.validateChangePassword(),userController.changePassword)
  .get('/profile/:id', authentication, async function (req, res, next) {
    console.log(req.params.id)
    const partial = 'partials/profile_manager';
    const layout = 'layouts/main';
    req.partial_path = partial
    req.layout_path = layout
    const curr_account = await userController.getAccount(req.params.id);
    let company = await Company.findOne({ representativeIds: req.params.id });

    req.page_data = {
      account_details:  curr_account,
      company: company,
    }
    // console.log(req.page_data.account_details)
    await userController.getpage(req, res, next);

  })
  // .post('/resend_email', authentication, isAdmin,  async function (req, res, next) {
  //   const {email , accountId} = req.body;
  //   await sendEmail.sendConfirmationEmail(email, accountId);
  //   res.json({ send: true, status: "success", message: "Email has been sent to: " +email});
  // })
  // .post('/lock_account' , authentication , isAdmin , userController.togglelockAccount);



module.exports = router;

