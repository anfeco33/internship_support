var express = require('express');
const router = express.Router();
const User = require('../models/users');
const Review = require('../models/reviews');
const userControllers = require('../controllers/user.controllers');
const statisticControllers = require('../controllers/statistic.controllers');
const businessController = require('../controllers/business.controllers');
const transactionController = require('../controllers/transaction.controllers');


var { authentication, isAdmin } = require('../middleware/authentication');

const { validate } = require('../controllers/validator');

/* GET admin page. */

//TODO: quay lại tối ưu layout khi hoàn thành

//TODO: Tạo page mặc định cho role admin
//  ( dùng để trả về cho manager vì không phải lúc nào manager cũng có quyền staff)
router.get('/', function (req, res) {
  res.redirect('/admin/student');
})
  //TODO: sửa lại get staff hiển thị toàn bộ user trong database
  .get('/student', async function (req, res, next) {
    const partial = 'partials/student_manager';
    const layout = 'layouts/main';
    req.partial_path = partial
    req.layout_path = layout
    req.page_data = {
      liststudent: await userControllers.getliststudent(),
      // feature: req.session.admin_feature,
    }
    // console.log(req.page_data.liststaff)
    await userControllers.getpage(req , res, next);
  })
  .get('/company', async function (req, res, next) {
    delete req.session.product
    const partial = 'partials/company_manager';
    const layout = 'layouts/main';
    req.partial_path = partial
    req.layout_path = layout
    req.page_data = {
      listcompany: await userControllers.getlistcompany(),
      // feature: req.session.admin_feature,
    }
    await userControllers.getpage(req , res, next);
  })
  .get('/course', async function (req, res, next) {
    const partial = 'partials/course_manager';
    const layout = 'layouts/main';
    req.partial_path = partial
    req.layout_path = layout
    req.page_data = {
      listcourse: await businessController.get_list_course(),
    }
    await userControllers.getpage(req , res, next);
  })
  .get('/course/:courseId', async function (req, res, next) {
    const user = await User.findById(req.session.account);
    const hasBought = user.subscribed.includes(req.params.courseId);
    const hasAddToCart = user.cart.includes(req.params.courseId);
    const hasReviewsOfACourse = await Review.find({ courseId: req.params.courseId })
    .populate('userId', 'fullName'); 
    const hasReviewed = await Review.findOne({ courseId: req.params.courseId, userId: req.session.account })
    .populate('userId', 'fullName');

    console.log(req.params.courseId)
    const partial = 'partials/course_detail';
    const layout = 'layouts/main';
    req.partial_path = partial
    req.layout_path = layout

    req.page_data = {
      course_detail: await businessController.getCourse(req.params.courseId),
      hasBought: hasBought,
      hasAddToCart: hasAddToCart,
      hasReviewed: hasReviewed,
      hasReviewsOfACourse: hasReviewsOfACourse
    }
    // console.log(req.page_data.account_details)
    await userControllers.getpage(req, res, next);
  })
  //.delete('/course/:courseId', businessController.delete_course)
  .get('/transaction', async function (req, res, next) {
    const partial = 'partials/transaction';
    const layout = 'layouts/main';
    req.partial_path = partial
    req.layout_path = layout
    req.page_data = {
      list_transaction: await transactionController.get_list_transaction()
    }
    await userControllers.getpage(req , res, next);
  })
  .get('/statistical', async function (req, res, next) {
    const partial = 'partials/statistical';
    const layout = 'layouts/main';
    req.partial_path = partial
    req.layout_path = layout
    req.page_data = {
      // transactions: await statisticControllers.getlistOrder()
    }
    await userControllers.getpage(req , res, next);
  })
  .post('/statistical', authentication, async function (req, res, next) {
    const timeFixed = req.body.timeFixed;
    const fromDay = req.body.fromDay;
    const toDay = req.body.toDay;
    let endDay = new Date(); // Lấy ngày hiện tại
    let startDay = new Date(); // Khởi tạo ngày bắt đầu
    if (timeFixed != undefined) {
      switch(timeFixed) {
        case "today":
          break;
        case 'yesterday':
            startDay.setDate(endDay.getDate() - 1);
            endDay.setDate(endDay.getDate() - 1);
            break;
        case '7days':
            startDay.setDate(endDay.getDate() - 7);
            break;
        case 'thisMonth':
            startDay = new Date(endDay.getFullYear(), endDay.getMonth(), 1);
            break;
        default:
      }
    }
    if(fromDay != undefined && toDay != undefined) {
      startDay = new Date(fromDay);
      endDay = new Date(toDay);
    }
    // Chuyển đổi startDay và endDay thành chuỗi ngày tháng năm
    const startDayString = `${startDay.getDate().toString().padStart(2, '0')}-${(startDay.getMonth() + 1).toString().padStart(2, '0')}-${startDay.getFullYear()}`;
    const endDayString = `${endDay.getDate().toString().padStart(2, '0')}-${(endDay.getMonth() + 1).toString().padStart(2, '0')}-${endDay.getFullYear()}`;
    const partial = 'partials/statistical';
    const layout = 'layouts/admin';
    req.partial_path = partial;
    req.layout_path = layout;
    req.page_data = {
      start: startDayString,
      end: endDayString,
      transactions: await statisticControllers.getByTime(startDay, endDay)
  };
    await userControllers.getpage(req, res, next);
  })

module.exports = router;
