var express = require('express');
const router = express.Router();
const User = require('../models/users');
const userControllers = require('../controllers/user.controllers');
const businessController = require('../controllers/business.controllers');
var { authentication, isAdmin } = require('../middleware/authentication');

router.get('/', function (req, res) {
  res.redirect('/admin/student');
})
  .get('/student', async function (req, res, next) {
    const partial = 'partials/student_manager';
    const layout = 'layouts/main';
    req.partial_path = partial
    req.layout_path = layout
    req.page_data = {
      liststudent: await userControllers.getliststudent(),
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
  .get('/business-profiles', async function (req, res, next) {
    const partial = 'partials/business_manager';
    const layout = 'layouts/main';
    req.partial_path = partial
    req.layout_path = layout
    req.page_data = {
      businesses: await businessController.getBusinessProfilesForAdmin(),
    }
    await userControllers.getpage(req , res, next);
  })
  .get('/business-profile-details/:companyId', async (req, res, next) => {
    const partial = 'partials/view_business_admin';
    const layout = 'layouts/main';
    req.partial_path = partial
    req.layout_path = layout
    
    req.page_data = {
      companyId: req.params.companyId,
      company: await businessController.getBusinessProfile(req.params.companyId),
    }
    await userControllers.getpage(req, res, next);
  })
  .post('/business/:companyId/verify', businessController.toggleCompanyVerification)
  .post('/business/:companyId/lock', businessController.lockCompanyProfile)

  .get('/statistical', async function (req, res, next) {
    const partial = 'partials/statistical';
    const layout = 'layouts/main';
    req.partial_path = partial
    req.layout_path = layout

    const dashboardData = await businessController.getStatisticalData();
    companies = dashboardData.companies;
    industryStats = dashboardData.industryStats;
    studentCount = dashboardData.studentCount;
    companyCount = dashboardData.companyCount;
    newCommentsCount = dashboardData.newCommentsCount;
    businessProfileCount = dashboardData.businessProfileCount;
    req.page_data = {
      companies,
      industryStats,
      studentCount,
      companyCount,
      newCommentsCount,
      businessProfileCount
    }
    await userControllers.getpage(req , res, next);
  })
  // .post('/statistical', authentication, async function (req, res, next) {
  //   const timeFixed = req.body.timeFixed;
  //   const fromDay = req.body.fromDay;
  //   const toDay = req.body.toDay;
  //   let endDay = new Date(); // Lấy ngày hiện tại
  //   let startDay = new Date(); // Khởi tạo ngày bắt đầu
  //   if (timeFixed != undefined) {
  //     switch(timeFixed) {
  //       case "today":
  //         break;
  //       case 'yesterday':
  //           startDay.setDate(endDay.getDate() - 1);
  //           endDay.setDate(endDay.getDate() - 1);
  //           break;
  //       case '7days':
  //           startDay.setDate(endDay.getDate() - 7);
  //           break;
  //       case 'thisMonth':
  //           startDay = new Date(endDay.getFullYear(), endDay.getMonth(), 1);
  //           break;
  //       default:
  //     }
  //   }
  //   if(fromDay != undefined && toDay != undefined) {
  //     startDay = new Date(fromDay);
  //     endDay = new Date(toDay);
  //   }
  //   // Chuyển đổi startDay và endDay thành chuỗi ngày tháng năm
  //   const startDayString = `${startDay.getDate().toString().padStart(2, '0')}-${(startDay.getMonth() + 1).toString().padStart(2, '0')}-${startDay.getFullYear()}`;
  //   const endDayString = `${endDay.getDate().toString().padStart(2, '0')}-${(endDay.getMonth() + 1).toString().padStart(2, '0')}-${endDay.getFullYear()}`;
  //   const partial = 'partials/statistical';
  //   const layout = 'layouts/admin';
  //   req.partial_path = partial;
  //   req.layout_path = layout;
  //   req.page_data = {
  //     start: startDayString,
  //     end: endDayString,
  //     transactions: await statisticControllers.getByTime(startDay, endDay)
  // };
  //   await userControllers.getpage(req, res, next);
  // })

module.exports = router;
