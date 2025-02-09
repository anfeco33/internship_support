var express = require('express');
const router = express.Router();
const User = require('../models/users');
// const Course = require('../models/courses');
const { ensureProfileUpdated } = require('../middleware/authentication');
const Company = require('../models/companies');
const Internship = require('../models/internships');
const Application = require('../models/applications');
const Comment = require('../models/comments');
const userController = require('../controllers/user.controllers');
const businessController = require('../controllers/business.controllers');
const { validate } = require('../controllers/validator');
const { check } = require('express-validator');
const multer = require('multer');
const path = require('path');
const uploadsFolderPath = path.join(__dirname, '../uploads');
const upload = require('../middleware/upload');

router.get('/', function (req, res) {
  res.redirect('/home/business');
})
// .get('/business', ensureProfileUpdated, async function (req, res, next) {
//     try {
//       const company = await Company.findOne({ representativeIds: req.session.account });
//       const partial = 'partials/business';
//       const layout = 'layouts/main';

//       req.partial_path = partial;
//       req.layout_path = layout;

//       console.log("Query received:", req.query);
//       console.log("Path:", req.path);
//       console.log("Original URL:", req.originalUrl); 
//       console.log("Full URL:", req.protocol + "://" + req.get('host') + req.originalUrl); 
//       const { industry, size, isVerified } = req.query;

//       // Chỉ thêm các tham số vào filter nếu có giá trị
//       const filter = {};
//       if (industry) filter.industry = industry;
//       if (size) filter.size = size;
//       if (isVerified !== undefined && isVerified !== '') {
//         filter.isVerified = isVerified === 'true';
//       }
//       console.log("Filter criteria:", filter);

//       const internships = await Company.find({ "internships.0": { $exists: true } }, { internships: 1 });
//       console.log("Internships:", internships);
//       if (company) {
//         req.page_data = {
//           listOfBusiness: await businessController.get_list_business(filter),
//           topSupportiveCompanies: await businessController.get_top_supportive_companies(),
//           businessId: company._id,
//         };
//       } else {
//         req.page_data = {
//           listOfBusiness: await businessController.get_list_business(filter),
//           topSupportiveCompanies: await businessController.get_top_supportive_companies(),
//         };
//       }

//       await userController.getpage(req, res, next);
//     } catch (error) {
//       console.error('Error fetching business list:', error);
//       next(error);
//     }
//   })
  .get('/business', ensureProfileUpdated, async function (req, res, next) {
    try {
      const company = await Company.findOne({ representativeIds: req.session.account });
      const partial = 'partials/business';
      const layout = 'layouts/main';

      req.partial_path = partial;
      req.layout_path = layout;

      console.log("Query received:", req.query);
      console.log("Path:", req.path);
      console.log("Original URL:", req.originalUrl); 
      console.log("Full URL:", req.protocol + "://" + req.get('host') + req.originalUrl); 
      const { industry, size, isVerified, page = 1, limit = 3 } = req.query;

      // Chỉ thêm các tham số vào filter nếu có giá trị
      const filter = {};
      if (industry) filter.industry = industry;
      if (size) filter.size = size;
      if (isVerified !== undefined && isVerified !== '') {
        filter.isVerified = isVerified === 'true';
      }
      console.log("Filter criteria:", filter);
      const { businesses, totalCompanies, totalPages, currentPage } = await businessController.get_list_business(filter, page, limit);

      const internships = await Company.find({ "internships.0": { $exists: true } }, { internships: 1 });
      console.log("Internships:", internships);
      if (company) {
        req.page_data = {
          listOfBusiness: businesses,
          topSupportiveCompanies: await businessController.get_top_supportive_companies(),
          businessId: company ? company._id : null,
          totalPages,
          currentPage,
          limit
        };
      } else {
        req.page_data = {
          listOfBusiness: businesses,
          topSupportiveCompanies: await businessController.get_top_supportive_companies(),
          totalPages,
          currentPage,
          limit
        };
      }

      await userController.getpage(req, res, next);
    } catch (error) {
      console.error('Error fetching business list:', error);
      next(error);
    }
  })
  .post('/business/:companyId/add-representative', businessController.addRepresentative)
  .get('/business/update', async function (req, res, next) {
    const partial = 'partials/business_update';
    const layout = 'layouts/main';
    // lấy trường isProfileUpdated từ db
    const company = await Company.findOne({ representativeIds: req.session.account });
    const isProfileUpdated = company.isProfileUpdated;
    console.log("isProfileUpdateddd:", isProfileUpdated);
    req.page_data = {
      profileUpdated: isProfileUpdated,
    }

    req.partial_path = partial;
    console.log("partial_path: ", req.partial_path);
    req.layout_path = layout;

    await userController.getpage(req, res, next);
  })
  .post('/business/update', upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'documents', maxCount: 10 }, 
  ]), businessController.updateProfile)
  .get('/business-edit/edit/:companyId', async (req, res, next) => {
    console.log('route: /business-edit/edit/', req.params.companyId);
    const partial = 'partials/business_edit';
    const layout = 'layouts/main';
    req.partial_path = partial
    req.layout_path = layout
    
    req.page_data = {
      companyId: req.params.companyId,
      company: await businessController.getBusinessProfile(req.params.companyId),
    }
    await userController.getpage(req, res, next);
  })
  .put('/business-edit/edit/:companyId', upload.fields([
    { name: 'images', maxCount: 10 }, // max 10 images
    { name: 'documents', maxCount: 10 }, 
    ]), 
    businessController.editCompanyProfile
  )
  .get('/business/:companyId', async function (req, res, next) {
    const partial = 'partials/business_detail';
    const layout = 'layouts/main';
    req.partial_path = partial
    req.layout_path = layout

    const user = await User.findById(req.session.account).populate('company');
    // là company mới zo
    if(user.role === 'company') {
      console.log("company acc:")
      if (!user || !user.company) {
        return res.status(404).json({ status: 'error', message: 'Company not found for this company acc' });
      }
    }
     
     const company_com = await Company.findById(req.params.companyId) // populate bình luận
     .populate({
         path: 'comments',
        //  select: 'authorName authorId authorEmail authorPicture content createdAt rating replies',
         populate: {
            path: 'replies',
            // select: 'authorName authorId authorEmail authorPicture content createdAt',
         },
     })
     console.log("company_com: ", company_com.comments);
     console.log("company_com.length: ", company_com.comments.length);
     if (!company_com) {
         return res.status(404).json({ status: 'error', message: 'Company not found' });
     }

    if(user.role !== 'company') {
      req.page_data = {
        company: await Company.findById(req.params.companyId)
        .populate('internships')
        .populate('location'),
        companiesComments: company_com,
      }
    }

    if(user.role === 'company') {
      req.page_data = {
        company: await Company.findById(req.params.companyId)
        .populate('internships')
        .populate('location'),
        companiesComments: company_com,
        businessId:  user.company._id.toString(), // access zo btn của doanh nghiep thuoc ve minh
      }
    }

    await userController.getpage(req, res, next);
  })
  .post('/business/:companyId/internship', businessController.createInternship)
  .get('/business/internship/:internshipId', async (req, res) => {
    try {
      console.log('Fetching internship details:', req.params.internshipId);
      const internshipId = req.params.internshipId;
      const internship = await Internship.findById(internshipId).populate('company');
      if (!internship) {
        return res.status(404).json({ status: 'error', message: 'Internship not found' });
      }
  
      res.status(200).json({ status: 'success', internship });
    } catch (error) {
      console.error('Error fetching internship details:', error);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  })
  .put('/business/internship/:internshipId', businessController.editInternship)
  .delete('/business/internship/:internshipId', async (req, res) => {
    try {
      const { internshipId } = req.params;
  
      const internship = await Internship.findByIdAndDelete(internshipId);
      if (!internship) {
        return res.status(404).json({ status: 'error', message: 'Internship not found' });
      }
  
      await Company.findByIdAndUpdate(internship.company, { $pull: { internships: internshipId } });
  
      res.status(200).json({ status: 'success', message: 'Internship deleted successfully' });
    } catch (error) {
      console.error('Error deleting internship:', error);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  })
  .post('/business/internship/:internshipId/apply',
    upload.fields([{ name: 'documents', maxCount: 5 }]),
    businessController.applyForInternship
  )  
  .get('/business/:companyId/applications', businessController.getApplicationsNoti)
  .get('/student/applications/notifications', businessController.getStudentNotifications)
  .post('/student/applications/viewed', businessController.markStudentsAsViewed)
  
  .post('/business/:companyId/applications/viewed', businessController.markApplicationsAsViewed)
  // tab con
  .get('/internships/:businessId', businessController.getInternships)
  .get('/business/:businessId/applications/:applicationId', async function (req, res, next) {
    console.log('Fetching application details:', req.params.applicationId);
    const { applicationId } = req.params;
    const application = await Application.findById(applicationId).select('internship');
    if (!application) {
      console.error('Application not found:', applicationId);
      return res.status(404).json({ status: 'error', message: 'Application not found' });
    }

    const internshipId = application.internship;

    const internship = await Internship.findById(internshipId).select('title company').populate({
      path: 'company',
      select: 'name',
    });

    if (!internship) {
      console.log('Internship not found for application:', applicationId);
      return res.status(404).json({ status: 'error', message: 'Internship not found' });
    }

    const partial = 'partials/student_applied_list';
    const layout = 'layouts/main';
    req.partial_path = partial
    req.layout_path = layout

    const applications = await businessController.getApplicationDetails(req, res);
    req.page_data = {
      applications,
      applicationId: req.params.applicationId,
      businessId: req.params.businessId,
      internshipTitle: internship.title,
    }
    await userController.getpage(req, res, next);
  })
  .get('/business/:businessId/application-list/:internshipId', async function (req, res, next) {
      console.log('Fetching applications for internship:', req.params.internshipId);
      const { internshipId } = req.params;
        // Lấy title
      const internship = await Internship.findById(internshipId).select('title company').populate({
        path: 'company',
        select: 'name',
      });

      if (!internship) {
        console.log('Internship not found:', internshipId);
        return res.status(404).json({ status: 'error', message: 'Internship not found' });
      }
      
      const partial = 'partials/student_applied_list';
      const layout = 'layouts/main';
      req.partial_path = partial;
      req.layout_path = layout;
  
      req.page_data = {
        applications: await businessController.getApplicationsByInternship(req, res),
        internshipId: req.params.internshipId,
        businessId: req.params.businessId,
        internshipTitle: internship.title,
      };
      await userController.getpage(req, res, next);
  })
  .post('/applications/:applicationId/status', async function (req, res) {
    try {
      console.log('Updating application status:', req.params.applicationId);
      await businessController.updateApplicationStatus(req, res);
    } catch (error) {
      console.error('Error in updating status route:', error);
      res.status(500).send('Internal Server Error');
    }
  })
  .get('/my-application-list', async function (req, res, next) {
    const partial = 'partials/my_st_apps_list';
    const layout = 'layouts/main';
    req.partial_path = partial
    req.layout_path = layout

    req.page_data = {
      applications: await businessController.getStudentApplications(req, res),
    }
    await userController.getpage(req, res, next);
  })
  .get('/business/:companyId/representatives', async function (req, res, next) {
    const partial = 'partials/representatives-list';
    const layout = 'layouts/main';
    req.partial_path = partial
    req.layout_path = layout

    let business = null;
    if (req.session.role === 'company') {
      business = await Company.findOne({ representativeIds: req.session.account });
    }

    const company = await businessController.viewRepresentatives(req, res);
    console.log('Company repre:', company.representativeIds);
    req.page_data = {
      company,
      representatives: company.representativeIds,
      businessId: business? business._id : null,
    }
    await userController.getpage(req, res, next);
  })
  .delete('/business/:companyId/representatives/:representativeId', businessController.removeRepresentative)
  .post('/business/:companyId/comments', businessController.addCommentAndRating)
  .post('/business/:companyId/comments/:commentId/reply', businessController.replyToComment)
  .put('/business/:companyId/comments/:commentId', businessController.editComment)
  .put('/business/:companyId/comments/replies/:replyId', businessController.editReply)
  .put('/business/:companyId/comments/:commentId/remove', businessController.removeComment)
  .put('/business/:companyId/comments/replies/:replyId/remove', businessController.removeReply)
  .post('/business/:companyId/comments/:commentId/report', businessController.reportComment)
  .post('/business/:companyId/comments/replies/:replyId/report', businessController.reportReply)
  .get('/dashboard', ensureProfileUpdated, async function (req, res, next) {
    console.log('Fetching dashboard data for company');
    const partial = 'partials/dashboardPage';
    const layout = 'layouts/main';
    let company = null;

    if (req.session.role === 'company') {
      company = await Company.findOne({ representativeIds: req.session.account });
    }
    const internships = await Internship.find()
        .sort({ createdAt: -1 })
        .populate('company', 'name _id');
    
    req.partial_path = partial
    req.layout_path = layout
    req.page_data = {
      businessId: company? company._id : null,
      topCompaniesByIndustry: await businessController.getTopCompaniesByCriteria(),
      internships: internships ? internships : [],
    }

    await userController.getpage(req, res, next);
  })
  .post('/toggle-favorite', userController.toggleFavoriteCompany)
  .get('/favorites', businessController.getFavoriteCompanies)
  // .post('/course/exercise', async (req, res, next) => {
  //   await businessController.manageExercise(req, res, next);
  // })
  // .get('/exercise', async function (req, res, next) {
  //   const partial = 'partials/exercise';
  //   const layout = 'layouts/main';
  
  //   const coursesWithExercises = await courseController.getCoursesWithExercises(req, res, next);
  //   console.log("Courses with exercises: ", coursesWithExercises);
  
  //   req.partial_path = partial;
  //   req.layout_path = layout;
  
  //   req.page_data = {
  //     list_my_course: coursesWithExercises,
  //     list_all_course_of_aCompany: await courseController.get_my_course(req, res, next)
  //   }
  //   await userController.getpage(req, res, next);
  // })
  // .post('/course/exercise', async (req, res, next) => {
  //   await courseController.manageExercise(req, res, next);
  // })
 
  // .get('/rating', async function (req, res, next) {
  //   const user = await User.findById(req.session.account);
  //   const hasBought = user.subscribed.includes(req.params.courseId);
  //   const hasAddToCart = user.cart.includes(req.params.courseId);

  //   const hasReviewsOfACourse = await Review.find({ courseId: req.params.courseId })
  //   .populate('userId', 'fullName'); 

  //   const hasReviewed = await Review.findOne({ courseId: req.params.courseId, userId: req.session.account })
  //   .populate('userId', 'fullName');

  //   const partial = 'partials/course_detail';
  //   const layout = 'layouts/main';
  //   req.partial_path = partial
  //   req.layout_path = layout
  //   req.page_data = {
  //     course_detail: await courseController.getCourse(req.params.courseId),
  //     hasBought: hasBought,
  //     hasAddToCart: hasAddToCart,
  //     hasReviewed: hasReviewed,
  //     hasReviewsOfACourse: hasReviewsOfACourse
  //   }
  //   await userController.getpage(req, res, next);
  // })
  // .post('/rating', async function(req, res) {
  //     const courseId = req.body.courseId;
  //     try {
  //       await courseController.addRatingAndComment(req, res, courseId);
  //     } catch (error) {
  //         res.status(500).json({ message: 'Error while adding rating and comment!!' });
  //     }
  // })
  // .get('/lecture/:courseId', async function (req, res, next) {
  //   const firstLectureData = await courseController.getFirstlecture(req.params.courseId);
  //   const lectureId = firstLectureData ? firstLectureData.lectureID : null;
  //   req.session.courseId = req.params.courseId;
  //   if (!lectureId) {
  //     console.log('No lecture ID found');
  //   } else {
  //     console.log('Lecture ID found:', lectureId);
  //   }

  //   // Tìm các bình luận cho bài giảng đầu tiên
  //   const hasCommentsOfALecture = await Comment.find({ lectureID: lectureId })
  //     .populate('userId', 'fullName profilePicture');

  //   console.log('Comments of a lecture:', hasCommentsOfALecture);
  //   const partial = 'partials/lecture';
  //   const layout = 'layouts/main';
  //   req.partial_path = partial
  //   req.layout_path = layout
  //   req.page_data = {
  //     menu_bar: await courseController.getSectionsAndLectures(req.params.courseId),
  //     first_lecture: await courseController.getFirstlecture(req.params.courseId),
  //     notes: await courseController.getNotesByUserAndCourseID(req),
  //     hasCommentsOfALecture: hasCommentsOfALecture
  //   }
  //   // console.log(req.page_data.account_details)
  //   await userController.getpage(req, res, next);
  // })
  // .post('/addcomment', async function(req, res) {
  //   const firstLectureData = await courseController.getFirstlecture(req.session.courseId);
  //   console.log('First lecture data:', firstLectureData.lectureID);
  //   const lectureId = firstLectureData ? firstLectureData.lectureID : null;
  //   try {
  //     await courseController.addCommentsForALecture(req, res, firstLectureData.lectureID);
  //   } catch (error) {
  //       res.status(500).json({ message: 'Error while adding comment!!' });
  //   }
  // })
  // .get('/notes', async (req, res) => {
  //   const courseId = req.query.courseId;
  //   req.params.courseId = courseId;
  //   const notes = await courseController.getNotesByUserAndCourseID(req);
  //   res.json(notes);
  // })
  // .post('/take-note', async function (req, res, next) {
  //   try {
  //     const added = await courseController.addNewNote(req, res);
      
  //     res.json(added);

  //   } catch (error) {
  //     // Xử lý lỗi (nếu có)
  //     console.error("Error:", error);
  //     next(error);
  //   }
  // })
  // .get('/cart', async function (req, res, next) {
  //   const partial = 'partials/shopping_cart';
  //   const layout = 'layouts/main';

  //   console.log(req.session.account)

  //   req.partial_path = partial
  //   req.layout_path = layout

  //   req.page_data = {
  //     list_cart: await courseController.get_list_cart(req, res , next),
  //   }
  //   await userController.getpage(req, res, next);


  // })
  // .post('/cart', async function (req, res, next) {
  //   console.log(req.body);
  
  //   try {
  //     // Xử lý logic liên quan đến thêm vào giỏ hàng ở đây
  //     // Ví dụ:
  //     // Tiếp tục xử lý các thao tác thêm vào giỏ hàng với courseId
  //     const added = await courseController.add_to_cart(req, res , next);
      
  //     res.json(added);
  //     // Gửi phản hồi thành công về client

  //   } catch (error) {
  //     // Xử lý lỗi (nếu có)
  //     console.error("Error:", error);
  //     next(error);
  //     // Gửi phản hồi lỗi về client
  //     // res.status(500).json({ status: "error", message: "Đã xảy ra lỗi khi thêm vào giỏ hàng" });
  //   }
  // })

  // .get('/subscribed', async function (req, res, next) {
  //   const partial = 'partials/my_course';
  //   const layout = 'layouts/main';

  //   req.partial_path = partial
  //   req.layout_path = layout
  //   req.page_data = {
  //     list_my_course: await courseController.get_subcribe_course(req, res, next),
  //   }
  //   await userController.getpage(req, res, next);
  // })

  .get('/exercise', async function (req, res, next) {
    const partial = 'partials/exercise';
    const layout = 'layouts/main';

    req.partial_path = partial
    req.layout_path = layout

    await userController.getpage(req, res, next);
  })
  .get('/search/:term' , businessController.getbusinessbyTermRegex)

  .get('/about_us', async function (req, res, next) {
    const partial = 'partials/about_us';
    const layout = 'layouts/main';

    delete req.session.customer;

    req.partial_path = partial
    req.layout_path = layout
    const aboutUsData = await businessController.getAboutUS();

    req.page_data = {
      num_student : aboutUsData.students.length,
      num_course : aboutUsData.courses.length,
      num_company : aboutUsData.companies.length,
    }
    await userController.getpage(req, res, next);
  })
  .get('/contact', async function (req, res, next) {
    const partial = 'partials/contact';
    const layout = 'layouts/main';

    delete req.session.customer;

    req.partial_path = partial
    req.layout_path = layout

    await userController.getpage(req, res, next);
  })
  // .post('/update-progress', async (req, res) => {
  //   const result = await courseController.updateProgress(req);
  //   res.status(result.success ? 200 : 500).json(result);
  // })
  // .get('/course-progress/:courseId', async (req, res) => {
  //   const result = await courseController.getCourseProgress(req);
  //   res.status(result.success ? 200 : 500).json(result);
  // })
  // .get('/completed-courses', async (req, res) => {
  //   const result = await courseController.getCompletedCourses(req);
  //   res.status(result.success ? 200 : 500).json(result);
  // })
  // .get('/certificate/:courseId', async function (req, res) {
  //   try {
  //     const user = await User.findById(req.session.account);
  //     const result = await courseController.getCourse(req.params.courseId);
  //     if (result) {
  //       res.json({ success: true, course: result, fullname: user.fullName });
  //     } else {
  //       res.json({ success: false, error: 'Course not found' });
  //     }
  //   } catch (error) {
  //     res.status(500).json({ success: false, error: error.message });
  //   }
  // })

module.exports = router;
