const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controllers');
const userController = require('../controllers/user.controllers');
var { authentication } = require('../middleware/authentication');
const courseController = require('../controllers/business.controllers');
const User = require('../models/users');

var path = require('path');
const envPath = path.join(__dirname, '.env.example');
require('dotenv').config({ path: envPath });

router.get('/', (req, res) => {
    res.render('payment')
})
    .get('/payment', authentication, async function (req, res, next) {
        const partial = 'partials/cart_payment';
        var layout = 'layouts/main';
        
        req.partial_path = partial
        req.layout_path = layout

        const list_cart = await courseController.get_list_cart(req, res , next);

        req.page_data = {
            list_cart: list_cart,
        }
        await userController.getpage(req, res, next);
    })
    .post('/create-cart-payment-intent', authentication, paymentController.cartPaymentProcess)

    .get('/payment/:courseId', authentication, async function (req, res, next) {
        const partial = 'partials/payment';
        var layout = 'layouts/main';

        req.partial_path = partial
        req.layout_path = layout
        req.page_data = {
            course_detail: await courseController.getCourse(req.params.courseId),
        }
        await userController.getpage(req, res, next);
    })
    .post('/create-payment-intent', authentication, paymentController.processPayment)
module.exports = router;