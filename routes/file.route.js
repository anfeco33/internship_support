var express = require('express');
const router = express.Router();

var { authentication, isAdmin } = require('../middleware/authentication');

const { validate } = require('../controllers/validator');

const { validationResult } = require('express-validator');

const fileController = require('../controllers/file.controllers');


router.post('/upload/avatar',fileController.changeAvatar);
// router.post('/upload/product',fileController.productPicture);

module.exports = router;

