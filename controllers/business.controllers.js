
// const Business = require('../models/business');
const Section = require('../models/section');
const Lecture = require('../models/lecture');
const Review = require('../models/reviews');
const Comment = require('../models/lecturecomments');
const Business = require('../models/companies');
const Exercise = require('../models/exercises');
const Note = require('../models/note');
const User = require('../models/users');
const Company = require('../models/companies')
const Student = require('../models/students')
const Admin = require('../models/admins')
const Progress = require('../models/progress');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const mailer = require('../utils/mailer')
const moment = require('moment');

var { authentication, isAdmin } = require('../middleware/authentication');
const sendEmail = require('./sendEmail');
const { validate } = require('./validator');

const { validationResult } = require('express-validator');
const fs = require('fs');

class BusinessController {
  async get_list_business(filter = {}) {
    try {
      filter.isProfileUpdated = true;
      const businesses = await Company.find(filter)
      .select('name images averageRating address isVerified industry size');

      return businesses;
    } catch (error) {
      console.error('Error fetching business list:', error);
    }
  }

  async get_top_supportive_companies() {
    try {
      const topCompanies = await Company.find({ isProfileUpdated: true, isVerified: true })
        .sort({ averageRating: -1 }) // Sort by average rating in descending order
        .limit(3) // Limit to top 3 companies
        .select('name images averageRating address isVerified industry size');
      return topCompanies;
    } catch (error) {
      console.error('Error fetching top supportive companies:', error);
    }
  }

  async get_my_business(req, res, next) {
    try {
      const company = await Company.findOne({ representativeId: req.session.account });

      console.log("get my business : " + company._id.toString());
      const companyId = company._id.toString();
      const businesses = await Business.find({ companyId }).populate('companyID', 'profilePicture fullName');

      for (const business of businesses) {
        const company = business.companyID; // Người hướng dẫn tương ứng với khóa học
        const profilePicture = business.profilePicture; // Ảnh đại diện của người hướng dẫn
        const fullName = company.fullName; // Tên đầy đủ của người hướng dẫn

        // console.log(profilePicture, fullName);
      }

      return businesses;
    } catch (error) {
      next(error);
    }
  }

  // async  get_subcribe_course(req, res, next) {
  //   try {
  //     const studentID = req.session.account; // Lấy studentID từ session hoặc nguồn dữ liệu khác
    
  //     const student = await User.findById(studentID); // Lấy thông tin người dùng từ bảng User
  //     console.log(student)
  //     const courses = await Course.find({ _id: { $in: student.subscribed } }).populate('companyID', 'profilePicture fullName'); // Lấy thông tin các khóa học đã đăng ký từ bảng Course và liên kết với thông tin người dùng từ bảng User
  //     console.log(courses)
    
  //     return courses;
  //   } catch (error) {
  //     next(error);
  //   }
  // }
  

  // async delete_course(req, res, next) {
  //   console.log("Delete course : ")
  //   try {
  //     const product = await Course.findById(req.params.courseId);
  //     if (product) {
  //       if(!product.inOrders){
  //         await product.deleteOne();
  //         const imagePath = path.join(__dirname, '../uploads/courses', path.basename(product.courseImage));
  //         console.log(imagePath);
  //         fs.unlink(imagePath, (err) => {
  //           if (err) {
  //             console.error('Có lỗi xảy ra khi xóa file:', err);
  //             return;
  //           }
  //           console.log('File đã được xóa thành công.');
  //         });
  //         req.session.flash = {
  //           type: "success",
  //           intro: 'Delete product',
  //           message: "Delete course successfully",
  //         };
  //         res.json({ delete: true, status: "success", message: 'Course has been deleted', redirect: "/admin/course" });
  //       }
  //       else{
  //         res.json({ delete : false, status: "warning", message: 'Product is in order'});
  //       }

  //     } else {
  //       res.status(404)({ delete: false, status: "success", message: 'Product Not Foud' });
  //     }
  //   } catch (err) {
  //     next(err);
  //   }
  // }

  // search business
  async getbusinessbyTermRegex(req, res, next) {
    try {
      const term = req.params.term;
      const regex = new RegExp(term, 'i');
      console.log(regex);

      let listBusiness;
      if (term === "all") {
        listBusiness = await Company.find().populate('companyID', 'profilePicture fullName')
      } else {
        listBusiness = await Business.find({
          $or: [
            { businessName: regex },
          ]
        }).populate('companyID', 'profilePicture fullName');
      }

      if (listBusiness.length > 0) {
        res.json({ match: true, status: "success", message: 'Success', data: listBusiness });
      } else {
        res.json({ match: false, status: "warning", message: 'Fail', data: listBusiness});
      }

    } catch (error) {
      console.error('Error getting business:', error);
      throw error;
    }
  }

  async getBusiness(businessID) {
    console.log("curr business : " + businessID);
    try {
      const find = await Course.findById(businessID).populate('companyID', 'fullName');
      // console.log(find)
      if (find) {
        return find;
      } else {
        return "";
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getSectionsAndLectures(courseID) {
    try {
      const sections = await Section.find({ courseID });

      const formattedSections = [];

      for (const section of sections) {
        const lectures = await Lecture.find({ sectionID: section._id });

        const formattedLectures = lectures.map(lecture => ({
          lectureID: lecture._id,
          lectureTitle: lecture.lectureTitle,
          lectureLink: lecture.lectureLink,
          lectureDescription: lecture.lectureDescription
        }));

        formattedSections.push({
          sectionID: section._id,
          sectionNumber: section.sectionNumber,
          sectionTitle: section.sectionTitle,
          sectionSlugID: 'videos-' + (section.sectionNumber.toLowerCase().replace(/ /g, '')).replace(/\s+/g, '-') ,
          lectures: formattedLectures
        });
      }
      return formattedSections;
    } catch (error) {
      console.log(error);
      return null; // Hoặc giá trị mặc định khác tùy thuộc vào yêu cầu của bạn
    }
  }


  async getFirstlecture(courseID) {
    try {
      const sections = await Section.find({ courseID });

      if (sections.length === 0) {
        return null; // Không có phần (section) nào được tìm thấy
      }

      const firstSection = sections[0];
      const lectures = await Lecture.find({ sectionID: firstSection._id });

      if (lectures.length === 0) {
        return null; // Không có bài giảng (lecture) nào được tìm thấy trong phần đầu tiên
      }

      const firstLecture = lectures[0];

      const formattedSection = {
        sectionNumber: firstSection.sectionNumber,
        sectionTitle: firstSection.sectionTitle,
        lectureID: firstLecture._id,
        lectureTitle: firstLecture.lectureTitle,
        lectureLink: firstLecture.lectureLink,
        lectureDescription: firstLecture.lectureDescription

      };
      console.log(formattedSection);

      return formattedSection;
    } catch (error) {
      console.log(error);
      return null; // Hoặc giá trị mặc định khác tùy thuộc vào yêu cầu của bạn
    }
  }

  async add_to_cart(req, res, next) {
    try {
      const userID = req.session.account; // ID của người dùng từ req.session.account
      const { courseId, del_courseId } = req.body;
      console.log(courseId, del_courseId)
      if (courseId) {
        // Kiểm tra xem khóa học đã tồn tại trong giỏ hàng của người dùng hay chưa
        const user = await User.findOne({
          _id: userID,
          cart: { $in: [courseId] }
        });

        if (user) {
          // Khóa học đã tồn tại trong giỏ hàng
          return res.json({ status: "success", message: "Khóa học đã tồn tại trong giỏ hàng" });
        }

        // Cập nhật cart của người dùng
        const updatedUser = await User.findOneAndUpdate(
          { _id: userID }, // Tìm người dùng dựa trên ID
          { $push: { cart: courseId } }, // Thêm courseId vào cart
          { new: true } // Trả về người dùng đã được cập nhật
        );

        console.log(updatedUser); // In thông tin người dùng đã được cập nhật

        // Thực hiện các xử lý khác sau khi thêm vào giỏ hàng thành công

        // Gửi phản hồi thành công về client
        return res.json({ status: "success", message: "Thêm vào giỏ hàng thành công" });
      }

      else if (del_courseId) {
        // Xóa khóa học khỏi giỏ hàng
        const user = await User.findOneAndUpdate(
          { _id: userID }, // Tìm người dùng dựa trên ID
          { $pull: { cart: del_courseId } }, // Xóa del_courseId khỏi cart
          { new: true } // Trả về người dùng đã được cập nhật
        );

        console.log(user); // In thông tin người dùng đã được cập nhật

        // Thực hiện các xử lý khác sau khi xóa khỏi giỏ hàng thành công
        req.session.flash = {
          type: 'success',
          intro: 'del cart',
          message: 'Delete successful',
        };
        // Gửi phản hồi thành công về client
        return res.json({ status: "success", message: "Xóa khỏi giỏ hàng thành công" });
      } else {
        // Nếu không có courseId hoặc del_courseId được cung cấp
        return res.json({ status: "error", message: "Không có khóa học hoặc ID khóa học để xử lý" });
      }
    } catch (error) {
      // Xử lý lỗi (nếu có)
      console.error("Error:", error);
      // Gửi phản hồi lỗi về client
      res.status(500).json({ status: "error", message: "Đã xảy ra lỗi khi xử lý giỏ hàng" });
    }
  }
  async get_list_cart(req, res, next) {
    try {
      const userId = req.session.account; // Lấy userId từ session hoặc nguồn dữ liệu khác

      // Lấy thông tin người dùng và populate mảng cart với các đối tượng course
      const user = await User.findById(userId).populate('cart', 'courseName coursePrice courseCategory');

      if (!user) {
        // Người dùng không tồn tại
        return res.json({ status: 'error', message: 'User does not exist' });
      }

      const cartItems = user.cart; // Mảng cart của người dùng
      const cartCourses = []; // Mảng chứa thông tin course từ cart

      // Lặp qua từng item trong cart và lấy thông tin course tương ứng
      for (const cartItem of cartItems) {
        const course = await Course.findById(cartItem._id).populate('companyID', 'fullName');
        if (course) {
          const formattedCourse = {
            courseId: course._id.toString(),
            courseName: course.courseName,
            coursePrice: course.coursePrice,
            courseCategory: course.courseCategory,
            courseImage: course.courseImage,
            companyFullName: course.companyID.fullName,
            courseImage: course.courseImage
          };
          cartCourses.push(formattedCourse);
        }
      }

      // Gửi phản hồi với danh sách các course trong cart
      return cartCourses;
    } catch (error) {
      // Xử lý lỗi (nếu có)
      console.error('Error:', error);
      // Gửi phản hồi lỗi về client
      res.status(500).json({ status: 'error', message: 'Đã xảy ra lỗi khi lấy danh sách cart' });
    }
  }
  //TODO: thêm flash +  dark mode cho phần product
  async addnewproduct(req, res, next) {
    console.log("ADD new product : ")
    try {

      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        var err_msg = "";
        var list_err = errors.array();
        list_err.forEach(err => {
          err_msg += err.msg + " , ";
        });

        console.log(err_msg);

        //CƠ CHẾ CỦA VALIDATOR KHÔNG CHO ĐI TIẾP
        var state = { status: 'warning', message: err_msg };
        res.json({ added: false, status: state.status, message: state.message });
      } else {
        console.log("SUCCESS")
        const { productname, importprice, retailprice, inventory, category } = req.body;
        console.log(productname, importprice, retailprice, inventory, category)


        const find = await Product.findOne({ productName: productname });
        if (!find) {
          // console.log(defaultpassword);
          const newProduct = new Product({
            productName: productname,
            importPrice: parseInt(importprice),
            retailPrice: parseInt(retailprice),
            inventory: inventory,
            category: category,
            productPicture: "/images/default_product.png",
            barcode: "123"
          });

          // res.json({ added: true, status: "success", message: "Add staff successfully" });
          await newProduct.save()
            .then((savedProduct) => {
              console.log('Product saved successfully:');
              const imagePath = path.join(__dirname, '../uploads', 'tmp@product.jpg'); // Đường dẫn của hình ảnh upload

              const newImagePath = path.join(__dirname, '../uploads', savedProduct._id.toString() + "@product.png"); // Đường dẫn mới với tên file tương ứng với productPicture
              console.log(imagePath, newImagePath);
              fs.rename(imagePath, newImagePath, function (err) {
                if (err) {
                  console.error('Error renaming image:', err);
                } else {
                  console.log('Image renamed successfully');
                  req.session.flash = {
                    type: 'success',
                    intro: 'Add product',
                    message: 'Add product successful',
                  };
                  res.json({ added: true, status: "success", message: "Add product successfully", product: savedProduct });
                }
              });

            }).catch((error) => {
              // Xử lý lỗi nếu quá trình lưu không thành công
              console.error('Error saving product:', error);
              res.json({ added: false, status: "warning", message: "Failed to add product" });
            })
        } else {
          // res.json({ added: true, status: "success", message: "Add staff successfully" });
          res.json({ added: false, status: "warning", message: "Product name already exists" });
        }
      }

    } catch (error) {

      next(error);
    }
  }

  async updateproduct(req, res, next) {
    try {

      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        var err_msg = "";
        var list_err = errors.array();
        list_err.forEach(err => {
          err_msg += err.msg + " , ";
        });

        console.log(err_msg);

        //CƠ CHẾ CỦA VALIDATOR KHÔNG CHO ĐI TIẾP
        var state = { status: 'warning', message: err_msg };
        res.json({ update: false, status: state.status, message: state.message });
      } else {
        console.log("SUCCESS")
        const { productname, importprice, retailprice, inventory, category } = req.body;
        console.log(productname, importprice, retailprice, inventory, category)

        const find = await Product.findById(req.params.id);
        if (find) {
          // console.log(defaultpassword);

          find.productName = productname,
            find.importPrice = parseInt(importprice),
            find.retailPrice = parseInt(retailprice),
            find.inventory = parseInt(inventory),
            find.category = category,


            // res.json({ added: true, status: "success", message: "Add staff successfully" });
            await find.save()
              .then((savedProduct) => {
                console.log('Product saved successfully:');

                req.session.flash = {
                  type: "success",
                  intro: 'Update product',
                  message: "Update product successfully",
                };
                res.json({ update: true, status: "success", message: "Update product successfully", product: savedProduct });
              }).catch((error) => {
                // Xử lý lỗi nếu quá trình lưu không thành công
                console.error('Error saving product:', error);

                res.json({ update: false, status: "error", message: "Failed to add staff" });
              })
        }
        else {
          // res.json({ added: true, status: "success", message: "Add staff successfully" });
          res.json({ update: false, status: "warning", message: "Product name already exists" });
        }
      }

    } catch (error) {

      next(error);
    }

  }

  // Thêm khóa học
  async addNewCourse(req, res, next) {
    console.log("ADD new course : ");
    try {
      const errors = validationResult(req);
      console.log(errors.array());
      if (!errors.isEmpty()) {
        var err_msg = "";
        var list_err = errors.array();
        list_err.forEach(err => {
          err_msg += err.msg + " , ";
        });

        console.log(err_msg);

        var state = { status: 'warning', message: err_msg };
        res.json({ added: false, status: state.status, message: state.message });
      } else {
        console.log(req.body);
        const { courseName, coursePrice, courseCategory, coursePreview, courseDescription, courseAudience, courseResult, courseRequirement, sections } = req.body;
        var companyID = req.session.account;
        const newCourse = new Course({
          companyID,
          courseName,
          coursePrice,
          courseCategory,
          coursePreview,
          courseImage: req.file ? '../../courses/' + req.file.filename : '../images/default_course.jpg',
          courseDescription,
          courseAudience,
          courseResult,
          courseRequirement
        });

        const savedCourse = await newCourse.save();

        for (const section of sections) {
          const newSection = new Section({
            courseID: savedCourse._id,
            sectionNumber: section.sectionNumber,
            sectionTitle: section.sectionTitle
          });

          const savedSection = await newSection.save();

          for (const lecture of section.lectures) {
            const newLecture = new Lecture({
              sectionID: savedSection._id,
              lectureTitle: lecture.lectureTitle,
              lectureLink: lecture.lectureLink,
              lectureDescription: lecture.lectureDescription
            });

            await newLecture.save();
          }
        }

        res.status(201).json({ added: true, status: "success", message: "Course added successfully", course: savedCourse });
      }
    } catch (error) {
      // res.status(500).json(error);
      // console.error("Lỗi: " + error);
      next(error);
    }
  }

  // Edit Course
  async editCourse(req, res, next) {
    console.log("Edit course : ");
    const courseId = req.params.courseId;

    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      console.log("TEST:");
      console.log(req.body);
      console.log(req.body.sections);
      console.log(Array.isArray(req.body.sections));
      console.log(typeof req.body.sections);
      const { courseName, coursePrice, courseImage, courseCategory, coursePreview, courseDescription, courseAudience, courseResult, courseRequirement, sections } = req.body;

      // Update course details
      const updatedCourse = await Course.findByIdAndUpdate(courseId, {
        courseName,
        coursePrice,
        courseCategory,
        coursePreview,
        courseImage: req.file ? '../../courses/' + req.file.filename : courseImage,
        courseDescription,
        courseAudience,
        courseResult,
        courseRequirement
      }, { new: true });

      // Remove all existing sections and lectures, and add new ones
      await Section.deleteMany({ courseID: courseId });
      await Lecture.deleteMany({ courseID: courseId });

      console.log(sections);

      for (const section of sections) {
        const newSection = new Section({
          courseID: courseId,
          sectionNumber: section.sectionNumber,
          sectionTitle: section.sectionTitle
        });

        const savedSection = await newSection.save();

        for (const lecture of section.lectures) {
          const newLecture = new Lecture({
            sectionID: savedSection._id,
            lectureTitle: lecture.lectureTitle,
            lectureLink: lecture.lectureLink,
            lectureDescription: lecture.lectureDescription
          });

          await newLecture.save();
        }
      }

      res.json({ status: "success", message: "Course updated successfully", course: updatedCourse });

    } catch (error) {
      console.error("Error: " + error);
      next(error);
    }
  }

  // Take note
  async addNewNote(req, res) {
    try {
      const userID = req.session.account;
      const { lectureID, noteTimeStamp, noteDescription } = req.body;
      
      const newNote = new Note({
          lectureID,
          userID,
          noteTimeStamp,
          noteDescription
      });

      const savedNote = await newNote.save();

      const noteWithDetails = await Note.findById(savedNote._id)
          .populate({
              path: 'lectureID',
              select: 'lectureTitle lectureLink lectureDescription sectionID',
              populate: {
                  path: 'sectionID',
                  select: 'sectionNumber sectionTitle'
              }
          });

        // Check if the note and its details were fetched successfully
        if (!noteWithDetails) {
            throw new Error("Note saved but related details could not be fetched.");
        }
          
        const response = {
          success: true,
          message: "Note added successfully",
          note: {
              id: noteWithDetails.id,
              noteTimeStamp: noteWithDetails.noteTimeStamp,
              noteDescription: noteWithDetails.noteDescription,
              lectureDetails: {
                  lectureTitle: noteWithDetails.lectureID.lectureTitle,
                  lectureLink: noteWithDetails.lectureID.lectureLink,
                  lectureDescription: noteWithDetails.lectureID.lectureDescription
              },
              sectionDetails: {
                  sectionNumber: noteWithDetails.lectureID.sectionID.sectionNumber,
                  sectionTitle: noteWithDetails.lectureID.sectionID.sectionTitle
              }
          }
      };

      // Send the detailed response
      res.status(201).json(response);
    } catch (error) {
        console.error("Error adding note:", error);
        res.status(500).json({ success: false, message: "Failed to add note" });
    }
  }

  async getNotesByUserAndCourseID(req) {
    try {
      const userId = req.session.account;
      const courseId = req.params.courseId;

      console.log("USER:" + userId);
      console.log("COURSE ID:" + courseId);

      const getSectionsByCourseId = async (courseId) => {
        const sections = await Section.find({ courseID: courseId }).select('_id').exec();
        return sections.map(section => section._id);
      };

      const sectionIds = await getSectionsByCourseId(courseId);

      console.log(sectionIds);

      const getLectureIdsBySectionIds = async (sectionIds) => {
        const lectures = await Lecture.find({ sectionID: { $in: sectionIds } }).select('_id').exec();
        return lectures.map(lecture => lecture._id);
      };

      const lectureIds = await getLectureIdsBySectionIds(sectionIds);

      console.log(lectureIds);

      const notes = await Note.find({ userID: userId, lectureID: { $in: lectureIds } })
        .populate({
            path: 'lectureID',
            populate: {
              path: 'sectionID',
              select: 'sectionNumber sectionTitle'
            },
            select: 'lectureTitle lectureLink lectureDescription'
        })
        .exec();

      if (!notes) {
        console.log("There're no notes");
        return null;
      }

      const formattedNotes = notes.map(note => {
        if (!note.lectureID) {
          return {
            noteTimeStamp: note.noteTimeStamp,
            noteDescription: note.noteDescription,
            lectureTitle: 'Lecture Not Found',
            lectureLink: 'Lecture Not Found',
            lectureDescription: 'Lecture Not Found',
            sectionTitle: 'Section Not Found',
            lectureID: null
          };
        }

        const lectureTitle = note.lectureID.lectureTitle;
        const lectureLink = note.lectureID.lectureLink;
        const lectureDescription = note.lectureID.lectureDescription;
        const sectionTitle = note.lectureID.sectionID ? note.lectureID.sectionID.sectionTitle : 'Section Not Found';

        return {
          noteTimeStamp: note.noteTimeStamp,
          noteDescription: note.noteDescription,
          lectureTitle: lectureTitle,
          lectureLink: lectureLink,
          lectureDescription: lectureDescription,
          sectionTitle: sectionTitle,
          lectureID: note.lectureID._id
        };
      });

      return formattedNotes;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  }

  async addRatingAndComment(req, res, courseID) {
    const { rmComment } = req.body;
    const userID = req.session.account;
    const { rating, comment } = req.body;
    let review = await Review.findOne({ courseId: courseID, userId: userID });
    try {
      if (courseID) {
        if (review) {
          console.log("existingReview")
          // Người dùng đã đánh giá, cập nhật bình luận và đánh giá hiện tại
          review.rating = rating;
          review.comment = comment;
          await review.save();
        } else {
          // tạo mới đánh giá và bình luận
            let review = new Review({ 
                userId: userID,
                courseId: courseID,
                rating: req.body.rating,
                comment: req.body.comment
            })
            review.save()
          }

        req.session.flash = {
          type: 'success',
          message: 'Rating and comment added successfully',
        };

        await Course.findByIdAndUpdate(courseID, {
          $push: { reviews: review._id }
        }, { new: true });

        res.json({ status: "success", message: "Rating and comment added successfully" })

      } else if (rmComment) {
        try {
          const userID = req.session.account;
          const existingReview = await Review.findOneAndDelete({ userId: userID, _id: rmComment });
          console.log("exist", existingReview)
          if (existingReview) {

            // rm trong course
            const user = await Course.findOneAndUpdate(
              { _id: userID },
              { $pull: { reviews: rmComment } }, 
              { new: true }
            );
    
            req.session.flash = {
              type: 'success',
              intro: 'del comment',
              message: 'Delete successful',
            };
            // Gửi phản hồi thành công về client
            return res.json({ status: "success", message: "Rating and comment removed successfully" });
          } else {
            res.json({ status: "warning", message: "Rating and comment not found" });
          }
        } catch(err) {
          req.session.flash = {
            type: 'error',
            intro: 'comment failed',
            message: err.message,
          };
            res.json({ success: false, message: err.message })
        }
        
      } else {
        // Nếu không có courseId hoặc del_courseId được cung cấp
        return res.json({ status: "error", message: "Không có khóa học hoặc ID khóa học để xử lý" });
      }
      } catch(err) {
        req.session.flash = {
          type: 'error',
          intro: 'comment failed',
          message: err.message,
        };
          res.json({ status: "warning", message: err.message })
      }
  }

  async getCoursesWithExercises(req, res, next) {
    try {
      const companyId = req.session.account; 
      const courses = await Course.find({
        companyID: companyId,
        exercises: { $exists: true, $ne: [] }  // Ensure there are exercises associated with the course
      })
      .populate({
        path: 'exercises',
        select: 'googleFormLink'  // Assuming the relationship and fields are correctly set up
      })
      .exec();
  
      return courses;
    } catch (error) {
      console.error("Error fetching courses with exercises:", error);
      next(error);
    }
  }

  async manageExercise(req, res, next) {
    try {
      const { courseId, exerciseIndex, googleFormLink, selectCourse } = req.body;
      const companyID = req.session.account;
      console.log("rm exercise: ", courseId, companyID, exerciseIndex)
  
      // thêm mới or cập nhật bài tập
      if (googleFormLink) {
        // Kiểm tra nếu exerciseIndex được cung cấp, thì thực hiện cập nhật
        if (exerciseIndex !== undefined) {
          const existingEx = await Exercise.find({ companyId: companyID, courseId: courseId });
          if (!existingEx) {
            req.session.flash = {
              type: 'warning',
              message: 'Exercise not found',
            };
            return res.status(404).json({ success: false, message: 'Exercise not found' });
          }
          try {
            existingEx[exerciseIndex].googleFormLink = googleFormLink;
            await existingEx[exerciseIndex].save();
            req.session.flash = {
              type: 'success',
              message: 'Link updated successful'
            };
            return res.json({ status: "success", message: "Link updated successfully" });
          } catch (error) {
            console.error('Error saving exercise:', error);
            return res.json({ status: "error", message: "Error saving exercise" });
          }
        } else {
          // Tạo mới bài tập
          if (!googleFormLink || !selectCourse) {
            return res.status(400).json({ message: "Missing required fields" });
          }
          const newExercise = new Exercise({
            courseId: selectCourse,
            companyId: companyID,
            googleFormLink: googleFormLink
          });
  
          const savedEx = await newExercise.save();
  
          await Course.findByIdAndUpdate(selectCourse, {
            $push: { exercises: newExercise._id }
          }, { new: true });
  
          req.session.flash = {
            type: 'success',
            message: 'Exercise added successfully!'
          };
          res.status(200).json({ added: true, status: "success", message: "Exercise added successfully", exercise: savedEx });
        }
      }
      
      // Nếu không cung cấp googleFormLink, ta xem như đang thực hiện xóa bài tập
      else if (exerciseIndex !== undefined) {
        // Xóa bài tập tại vị trí index
        try {
          const existingEx = await Exercise.find({ companyId: companyID, courseId: courseId });
          if (!existingEx) {
            req.session.flash = {
              type: 'warning',
              message: 'Exercise not found',
            };
            return res.status(404).json({ success: false, message: 'Exercise not found' });
          }

          try {
            // rm trong course
            console.log("del ex1: ", existingEx[exerciseIndex]._id)
            await Course.findOneAndUpdate(
              { _id: courseId },
              { $pull: { exercises: existingEx[exerciseIndex]._id } }, 
              { new: true }
            );
            await existingEx[exerciseIndex].deleteOne();
            req.session.flash = {
              type: 'success',
              message: 'Link removed successful'
            };
            return res.json({ status: "success", message: "Link removed successfully" });
          } catch (error) {
            console.error('Error saving exercise:', error);
            return res.json({ status: "error", message: "Error removing exercise" });
          }
        } catch(err) {
          req.session.flash = {
            type: 'error',
            intro: 'rm exercise failed',
            message: err.message,
          };
           return res.json({ success: false, message: err.message })
        }
      } else {
        return res.status(400).json({ message: "Missing required fields" });
      }
    } catch (error) {
      console.error('Error managing exercise:', error);
      return res.status(500).json({ success: false, message: 'Internal server error', error: error.toString() });
    }
  }

  async updateProgress(req) {
    const { lectureID, courseID, progress } = req.body;
    const userID = req.session.account;

    console.log("CHECKING PROGRESS: -");
    console.log("lectureID: ", lectureID);
    console.log("courseID: ", courseID);
    console.log("progress: ", progress);
    console.log("userID: ", userID);

    try {
      let progressRecord = await Progress.findOne({ userID, lectureID });
      if (progressRecord) {
        progressRecord.progress = progress;
        progressRecord.completed = progress >= 70;
      } else {
        progressRecord = new Progress({ userID, lectureID, courseID, progress, completed: progress >= 70 });
      }
      await progressRecord.save();
      return { success: true, progress: progressRecord };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getCourseProgress(req) {
    const courseId = req.params.courseId;
    const userId = req.session.account;

    try {
      const sections = await Section.find({ courseID: courseId }).select('_id');
      if (!sections || sections.length === 0) {
        console.log("NO SECTIONS");
        return { success: true, completedLectureIds: [], totalLectures: 0 };
      }

      const lectures = await Lecture.find({ sectionID: { $in: sections.map(section => section._id) } }).select('_id');
      if (!lectures || lectures.length === 0) {
        console.log("NO LECTURES");
          return { success: true, completedLectureIds: [], totalLectures: 0 };
      }

      const lectureIds = lectures.map(lecture => lecture._id);
      const completedLectures = await Progress.find({ userID: userId, lectureID: { $in: lectureIds }, completed: true }).select('lectureID');
      const completedLectureIds = completedLectures.map(progress => progress.lectureID);
      const totalLectures = lectureIds.length;

      console.log("TOTAL LECTURES:", totalLectures);
      console.log("COMPLETED LECTURES:", completedLectureIds.length);

      return { success: true, completedLectureIds, totalLectures };
    } catch (error) {
      console.log(error.message);
      return { success: false, error: error.message };
    }
  }

  async getCompletedCourses(req) {
    const userId = req.session.account;

    try {
        const enrolledCourses = await this.get_subcribe_course(req);
        if (!enrolledCourses || enrolledCourses.length === 0) {
          return { success: true, completedCourses: [] };
        }

        const completedCourses = [];

        for (let course of enrolledCourses) {
          const sections = await Section.find({ courseID: course._id }).select('_id');
          if (!sections || sections.length === 0) continue;

          const lectures = await Lecture.find({ sectionID: { $in: sections.map(section => section._id) } }).select('_id');
          if (!lectures || lectures.length === 0) continue;

          const lectureIds = lectures.map(lecture => lecture._id);
          const completedLectures = await Progress.find({ userID: userId, lectureID: { $in: lectureIds }, completed: true }).select('lectureID');

          if (completedLectures.length === lectureIds.length) {
              completedCourses.push(course);
          }
        }

        return { success: true, completedCourses: completedCourses };
    } catch (error) {
      console.error("Error fetching completed courses:", error.message);
      return { success: false, error: error.message };
    }
  }

  async getAboutUS() {
    const students = await User.find({ role: 'student' });
    const courses = await Course.find({});
    const companies = await User.find({ role: 'company' });
  
    return {
      students: students,
      courses: courses,
      companies: companies,
    };
  }

  async addCommentsForALecture(req, res, lectureID) {
    console.log("ADD new comment : ");
    console.log(lectureID);
    const userID = req.session.account;
    try {
          // tạo mới bình luận
            let comm = new Comment({ 
                userId: userID,
                lectureID: lectureID,
                comment: req.body.comment
            })
            comm.save()

        req.session.flash = {
          type: 'success',
          message: 'You have successfully added a comment!',
        };

        await Lecture.findByIdAndUpdate(lectureID, {
          $push: { comments: comm._id }
        }, { new: true });

        res.json({ status: "success", message: "You have successfully added a comment!" })
      } catch(err) {
        req.session.flash = {
          type: 'error',
          intro: 'comment failed',
          message: err.message,
        };
          res.json({ status: "warning", message: err.message })
      }
  }

  async updateProfile(req, res, next) {
    try {
        const {
            name,
            industry,
            size,
            address,
            website,
            location,
            profile,
            contactEmail,
            phoneNumber,
            promotionVideo,
        } = JSON.parse(req.body.businessProfile);

        const representativeId = req.session.account;

        const [lat, lng] = location ? location.split(',').map(Number) : [10.762622, 106.660172];
        const geoLocation = {
            type: 'Point',
            coordinates: [lng, lat], // GeoJSON requires [lng, lat]
        };

        const uploadedImages = req.files.images && req.files.images.length > 0
        ? req.files.images.map(file => `/images/company_image_details/${file.filename}`)
        : ['/images/default_companyImage_details.jpg']; // Ảnh mặc định nếu không upload
  
        const uploadedDocuments = req.files.documents && req.files.documents.length > 0
          ? req.files.documents.map(file => `/documents/${file.filename}`)
          : []; 

        const profileDescription = profile || '';

        // Cập nhật thông tin công ty
        const company = await Company.findOneAndUpdate(
            { representativeId },
            {
                name,
                industry,
                size,
                address,
                website,
                location,
                profile: profileDescription,
                contactEmail,
                phoneNumber,
                promotionVideos: promotionVideo ? [promotionVideo] : [],
                images: uploadedImages,
                isProfileUpdated: true,
                location: geoLocation,
                documents: uploadedDocuments,
            },
            { new: true, upsert: true }
        );

        res.json({ success: true, company });
    } catch (error) {
        console.error('Error updating business profile:', error);
        next(error);
    }
  }

  async editCompanyProfile(req, res, next) {
    console.log("Edit company profile : ");

    try {
        const { companyId } = req.params;
        const currentCompany = await Company.findById(companyId);
        if (!currentCompany) {
          return res.status(404).json({ success: false, message: 'Company not found' });
        }

        const {
            name,
            industry,
            size,
            address,
            website,
            location,
            profile,
            contactEmail,
            phoneNumber,
            promotionVideo,
        } = JSON.parse(req.body.businessProfile);

        const [lat, lng] = location ? location.split(',').map(Number) : [10.762622, 106.660172];
        const geoLocation = { type: 'Point', coordinates: [lng, lat] };

        const uploadedImages = req.files.images && req.files.images.length > 0
        ? req.files.images.map(file => `/images/company_image_details/${file.filename}`)
        : currentCompany.images || ['/images/default_companyImage_details.jpg'];
          
        const uploadedDocuments = req.files.documents && req.files.documents.length > 0
        ? req.files.documents.map(file => `/documents/${file.filename}`)
        : currentCompany.documents || [];

        const updatedCompany = await Company.findByIdAndUpdate(
            companyId,
            {
                name,
                industry,
                size,
                address,
                website,
                location: geoLocation,
                profile: profile || '',
                contactEmail,
                phoneNumber,
                promotionVideos: promotionVideo ? [promotionVideo] : [],
                images: uploadedImages,
                documents: uploadedDocuments,
                isProfileUpdated: true,
            },
            { new: true }
        );

        if (!updatedCompany) {
            return res.status(404).json({ success: false, message: 'Company not found for updating' });
        }

        res.json({ success: true, company: updatedCompany });
    } catch (error) {
        console.error('Error updating company profile:', error);
        next(error);
    }
  }

  async getBusinessProfile(businessId) {
    console.log("curr Busi : " + businessId);
    console.log('getting edit business:', businessId);

    try {
      const find = await Company.findById(businessId);
      // console.log(find)
      if (find) {
        return find;
      } else {
        console.log("ALO No company found");
        return "";
      }
    } catch (error) {
      console.log(error);
    }
  }


}
module.exports = new BusinessController();
