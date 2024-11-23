const { check } = require('express-validator');


let validateLogin = () => {
    return [
        check('username', 'username does not Empty' ).not().isEmpty(),
        check('password','password does not Empty').not().isEmpty(),
    ];
}

let validateSignup = () => {
  return [
      check('username', 'username does not Empty' ).not().isEmpty(),
      check('email', 'email does not Empty' ).not().isEmpty(),
      check('email', 'Email must be valid' ).isEmail(),
      check('password','password does not Empty').not().isEmpty(),
      check('account_type', 'Invalid Account type').not().isIn(['student', 'company']),
  ];
}


let validateInfoStaff = () => {
    return [
        check('fullname', 'full name does not Empty').not().isEmpty(),
        check('email', 'email does not Empty').not().isEmpty(),
        check('email', 'Invalid email').isEmail(),
        check('role', 'Invalid role').isIn(['manager', 'staff']),
        check('role', 'Invalid role').custom((value, { req }) => {
            if (value === 'manager') {
              if (!req.body.access || !Array.isArray(req.body.access) || req.body.access.length === 0) {
                throw new Error('Access cannot be empty for manager role');
              }
            }
            return true;
          }),
    ];
}


const validateInfoProduct = () => {
  return [
    check('productname', 'Product name is required').not().isEmpty(),
    check('importprice', 'Import price is required').not().isEmpty().isNumeric().withMessage('Import price must be a number'),
    check('retailprice', 'Retail price is required').not().isEmpty().isNumeric().withMessage('Retail price must be a number'),
    check('inventory', 'Inventory is required').not().isEmpty(),
    check('category', 'Invalid category').isIn(['phone', 'accessories'])
  ];
};


let validateChangeFullname = () => {
  return [
      check('fullname', 'fullname does not Empty' ).not().isEmpty(),
  ];
}


let validateChangeDefaultPassword = () => {
  return [
      check('newpass','new password does not Empty').not().isEmpty(),
      check('renewpass','repeat new password does not Empty').not().isEmpty(),
      check('renewpass').custom((value, { req }) => {
        if (value !== req.body.newpass) {
          throw new Error('Password confirmation does not match');
        }
        return true;
      }),
  ];
}

let validateChangePassword = () => {
  return [
      check('currpass', 'current password does not Empty' ).not().isEmpty(),
      check('newpass','new password does not Empty').not().isEmpty(),
      check('renewpass','repeat new password does not Empty').not().isEmpty(),
      check('renewpass').custom((value, { req }) => {
        if (value !== req.body.newpass) {
          throw new Error('Password confirmation does not match');
        }
        return true;
      }),
  ];
}

const validateEmail = (email) => {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

var validate = {
    validateLogin: validateLogin,
    validateSignup: validateSignup,
    validateInfoStaff:validateInfoStaff,
    validateInfoProduct:validateInfoProduct,
    validateChangeFullname: validateChangeFullname,
    validateChangePassword: validateChangePassword,
    validateChangeDefaultPassword: validateChangeDefaultPassword,
    validateEmail: validateEmail,

};

module.exports = { validate };



