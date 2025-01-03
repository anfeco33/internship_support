var express = require('express');
const router = express.Router();
const User = require('../models/users');
// const Course = require('../models/courses');
const { ensureProfileUpdated } = require('../middleware/authentication');
const Company = require('../models/companies');
const Review = require('../models/reviews');
const Comment = require('../models/lecturecomments');
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
.get('/business', ensureProfileUpdated, async function (req, res, next) {
    try {
      const company = await Company.findOne({ representativeId: req.session.account });
      const partial = 'partials/business';
      const layout = 'layouts/main';

      req.partial_path = partial;
      req.layout_path = layout;

      console.log("Query received:", req.query);
      console.log("Path:", req.path);
      console.log("Original URL:", req.originalUrl); 
      console.log("Full URL:", req.protocol + "://" + req.get('host') + req.originalUrl); 
      const { industry, size, isVerified } = req.query;

      // Chỉ thêm các tham số vào filter nếu có giá trị
      const filter = {};
      if (industry) filter.industry = industry;
      if (size) filter.size = size;
      if (isVerified !== undefined && isVerified !== '') {
        filter.isVerified = isVerified === 'true';
      }
      console.log("Filter criteria:", filter);

      const internships = await Company.find({ "internships.0": { $exists: true } }, { internships: 1 });
      console.log("Internships:", internships);
      if (company) {
        req.page_data = {
          listOfBusiness: await businessController.get_list_business(filter),
          topSupportiveCompanies: await businessController.get_top_supportive_companies(),
          businessId: company._id,
        };
      } else {
        req.page_data = {
          listOfBusiness: await businessController.get_list_business(filter),
          topSupportiveCompanies: await businessController.get_top_supportive_companies(),
        };
      }

      await userController.getpage(req, res, next);
    } catch (error) {
      console.error('Error fetching business list:', error);
      next(error);
    }
  })
  .get('/business/update', async function (req, res, next) {
    const partial = 'partials/business_update';
    const layout = 'layouts/main';
    // lấy trường isProfileUpdated từ db
    const company = await Company.findOne({ representativeId: req.session.account });
    const isProfileUpdated = company.isProfileUpdated;
    console.log("isProfileUpdateddd:", isProfileUpdated);
    // truyền trường profileUpdated vào ui
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
    console.log(req.params.courseId)
    const partial = 'partials/business_detail';
    const layout = 'layouts/main';
    req.partial_path = partial
    req.layout_path = layout
    req.page_data = {
      company: await businessController.getBusinessProfile(req.params.companyId),
      businessId: req.params.companyId,
    }
    await userController.getpage(req, res, next);
  })
  .post('/business/:companyId/internship', businessController.createInternship)
  .get('/business/internship/:internshipId', async (req, res) => {
    try {
      console.log('Fetching internship details:', req.params.internshipId);
      const internshipId = req.params.internshipId;
      const company = await Company.findOne({ "internships._id": internshipId }, { "internships.$": 1 });
      if (!company) {
        return res.status(404).json({ status: 'error', message: 'Internship not found' });
      }
  
      res.status(200).json({ status: 'success', internship: company.internships[0] });
    } catch (error) {
      console.error('Error fetching internship details:', error);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  })
  .put('/business/internship/:internshipId', async (req, res) => {
    try {
      const internshipId = req.params.internshipId;
      const { title, description } = req.body;
  
      const company = await Company.findOneAndUpdate(
        { "internships._id": internshipId },
        { $set: { "internships.$.title": title, "internships.$.description": description } },
        { new: true }
      );
  
      if (!company) {
        return res.status(404).json({ status: 'error', message: 'Internship not found' });
      }
  
      res.status(200).json({ status: 'success', message: 'Internship updated successfully' });
    } catch (error) {
      console.error('Error updating internship:', error);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  })
  .delete('/business/internship/:internshipId', async (req, res) => {
    try {
      const { internshipId } = req.params;
  
      const company = await Company.findOneAndUpdate(
        { "internships._id": internshipId },
        { $pull: { internships: { _id: internshipId } } }, // Xóa internship theo ID
        { new: true }
      );
  
      if (!company) {
        return res.status(404).json({ status: 'error', message: 'Internship not found' });
      }
  
      res.status(200).json({ status: 'success', message: 'Internship deleted successfully' });
    } catch (error) {
      console.error('Error deleting internship:', error);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  })
  
  // .get('/course/:courseId', async function (req, res, next) {
  //   const user = await User.findById(req.session.account);
  //   const hasBought = user.subscribed.includes(req.params.courseId);
  //   const hasAddToCart = user.cart.includes(req.params.courseId);
  //   const hasReviewsOfACourse = await Review.find({ courseId: req.params.courseId })
  //   .populate('userId', 'fullName profilePicture'); 
  //   const hasReviewed = await Review.findOne({ courseId: req.params.courseId, userId: req.session.account })
  //   .populate('userId', 'fullName profilePicture');
  //   const hasExercises = await Exercise.find({ courseId: req.params.courseId });

  //   console.log(req.params.courseId)
  //   const partial = 'partials/course_detail';
  //   const layout = 'layouts/main';
  //   req.partial_path = partial
  //   req.layout_path = layout
  //   req.page_data = {
  //     course_detail: await businessController.getCourse(req.params.courseId),
  //     hasBought: hasBought,
  //     hasAddToCart: hasAddToCart,
  //     hasReviewed: hasReviewed,
  //     hasReviewsOfACourse: hasReviewsOfACourse,
  //     hasExercises: hasExercises
  //   }
  //   // console.log(req.page_data.account_details)
  //   await userController.getpage(req, res, next);
  // })
  // .delete('/course/:courseId', businessController.delete_course)
  // .get('/exercise', async function (req, res, next) {
  //   const partial = 'partials/exercise';
  //   const layout = 'layouts/main';
  
  //   const coursesWithExercises = await businessController.getCoursesWithExercises(req, res, next);
  //   console.log("Courses with exercises: ", coursesWithExercises);
  
  //   req.partial_path = partial;
  //   req.layout_path = layout;
  
  //   req.page_data = {
  //     list_my_course: coursesWithExercises,
  //     list_all_course_of_aCompany: await businessController.get_my_course(req, res, next)
  //   }
  //   await userController.getpage(req, res, next);
  // })
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
  // .delete('/course/:courseId', courseController.delete_course)
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
