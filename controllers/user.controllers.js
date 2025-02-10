const User = require('../models/users');
const Company = require('../models/companies')
const Student = require('../models/students')
const Admin = require('../models/admins')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mailer = require('../utils/mailer')
const moment = require('moment');

var { authentication, isAdmin } = require('../middleware/authentication');
const sendEmail = require('./sendEmail');
const { validate } = require('../controllers/validator');

const { validationResult } = require('express-validator');
const { stat } = require('fs');
const { type } = require('os');

// feature list này là các tab trong sidebar cần tạo để truy cập
const admin_feature_list = [
  { access: "Student", icon: "<i class='bx bx-grid-alt'></i>" },
  { access: "Company", icon: "<i class='fa-solid fa-bars-progress'></i>" },
  { access: "Bussiness Profiles", icon: "<i class='fa-solid fa-building'></i>" },
  { access: "Statistics", icon: "<i class='fa-solid fa-signal'></i>" }
]

const student_feature_list = [
  { access: "Home", icon: "<i class='fa-solid fa-house'></i>" },
  { access: "My Internship Apps", icon: "<i class='fa-solid fa-square-check'></i>" },
  { access: "Dashboard", icon: "<i class='fa-solid fa-gauge'></i>" },

]

const company_feature_list = [
  // LƯU Ý: khi thay đổi trong này, cần tạo lại acc mới vì acc cũ chỉ lưu các access cũ
  // sửa luôn trong main.js

  { access: "Home", icon: "<i class='fa-solid fa-house'></i>" },
  { access: "Internship Applications", icon: "<i class='fa-solid fa-pen-to-square'></i>" },
  { access: "Dashboard", icon: "<i class='fa-solid fa-gauge'></i>" },
]

class UserController {
  createDefaultAccount() {
    console.log("ADMIN ACCOUNT: ")
    return new Promise(async (resolve, reject) => {
      try {
        const admin = await User.findOne({ username: 'admin' });
        const currentTime = moment().format("HH:mm | DD/MM/YYYY");

        if (!admin) {
          const defaultpassword = await bcrypt.hash("admin", parseInt(process.env.BCRYPT_SALT_ROUND));
          const mail_sender = "admin@gmail.com"
          const defaultAdmin = new User({
            username: 'admin',
            // Trong thực tế, hãy sử dụng mã hóa mật khẩu bằng bcrypt hoặc một thư viện tương tự
            password: defaultpassword,
            email: mail_sender,
            fullName: 'Admin',
            role: 'admin',
            access: admin_feature_list,
            profilePicture: '/images/default_avatar.png',
            lastLogin: currentTime,
          });
          await defaultAdmin.save();
          resolve(); // Tài khoản mặc định đã được tạo thành công
        } else {
          resolve(); // Tài khoản admin đã tồn tại
        }
      } catch (error) {
        reject(error); // Xảy ra lỗi khi tạo tài khoản
      }
    });
  }

  async login(req, res, next) {
   // async sendOTP_func(req, res, next) {
    // trường hợp không phải admin tạo
    console.log("LOGIN : ")
    try {
      // console.log(req.body);
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
        res.json({ status: state.status, message: state.message, redirect: "" });

      }
      else {
        const { username } = req.body;
        const find = await User.findOne({ username: username });
        if (!find) {
          var state = { status: 'warning', message: 'Account not found' }
        }
        else {
          var check_password = await bcrypt.compare(password, find.password);
          if (check_password) {
            req.session.account = find._id.toString();
            req.session.role = find.role
            req.session.access = find.access


            console.log(req.session.status)

            const token = jwt.sign({ accountId: find._id.toString() }, process.env.JWT_SECRET, { expiresIn: '30d' });
            res.cookie("remember", token, { maxAge: 30 * 24 * 60 * 60 * 1000 }); // Lưu cookie trong 30 ngày

            var state = { status: 'success', message: 'Login successful' }



          } else {
            var state = { status: 'warning', message: 'Invalid password' }
          }

        }

        if (state.status == "success") {
          req.session.loggedIn = true;
          if (req.session.role == "admin") {
            req.session.isAdmin = true;
            var goto = '/admin/student'
          }
          else {
            var goto = '/home'
          }
        }
        else {
          var goto = '/login'
        }
        // Các xử lý khác sau khi đăng nhập thành công
        // Đăng nhập thành công, tạo flash message
        req.session.flash = {
          type: state.status,
          intro: 'login feature',
          message: state.message,
        };
        res.json({ status: state.status, message: state.message, redirect: goto });
        // res.redirect(goto)

      }


    } catch (error) {

      next(error);
    }
  }

  async getliststudent() {
    try {

      const find = await User.find({ $or: [{ role: 'student' }] });
      // console.log(find);

      return find
    } catch (error) {
      console.log(error);
    }
  }

  async getlistcompany() {
    try {

      const find = await User.find({ $or: [{ role: 'company' }] });
      // console.log(find);

      return find
    } catch (error) {
      console.log(error);
    }
  }

  async getpage(req, res, next) {
    console.log("get page : " + req.partial_path)

    try {
      const partial = req.partial_path
      const layout = req.layout_path
      console.log("req.usernek: ", req.user)
      console.log("req.session.accountnek: ", req.session.account)

      console.log("layoutt: ", layout)
      if (!req.session.loggedIn) {
        req.session.flash = {
            type: 'warning',
            message: 'Sorry! You need to be logged in to access this page.'
        };
        return res.redirect("/login");
    }

    // const accountID = req.user._id;
    const accountID = req.session.account;
    
    const account = await this.getAccount(accountID);
    console.log("all curr account data: " + account)
     // const account = await this.getAccount(req.session.account)
      if (account.lock) {
        var state = { status: 'warning', message: 'Account has been locked' };
        req.session.flash = {
          type: state.status,
          intro: 'lock feature',
          message: state.message,
        };
        res.redirect("/login")
      }
      else{
        const company = await Company.findOne({ representativeIds: accountID });
        const businessId = company ? company._id : null;

        const sidebar = account.access;
        
        const data_render = req.page_data ? req.page_data : "";
        

        var flashMessage = req.session.flash;
        if (flashMessage) {
          console.log(flashMessage);
        }
        delete req.session.flash;

        console.log("Rendering page with partial : ", data_render)
        res.render(partial, { 
          layout: layout, 
          access: sidebar, 
          account: account, 
          flashMessage, 
          businessId: businessId,
          data: data_render 
        });
      }
    } catch (error) {
      next(error);
    }
  }

  async getAccount(accountID) {
    try {
      const find = await User.findById(accountID);
      // console.log(find)
      if (find) {
        return find;
      }
      else {
        return "";
      }
    } catch (error) {

      console.log(error);
    }
  }

  async togglelockAccount(req, res, next) {
    console.log("Lock and Unlock account: ")
    try {
      const { accountID } = req.body;
      console.log(accountID)
      const find = await User.findById(accountID);
      if (find) {
        if (find.lock == false) {
          find.lock = true;
          var tmp = 'LOCKED';
        } else {
          find.lock = false;
          var tmp = 'UNLOCKED';
        }
        await find.save(); // Lưu thay đổi
        var state = { locked: true, status: "success", message: "Account lock status: " + tmp };

      }
      else {
        var state = { added: false, status: "warning", message: "An error occur" };

      }
      req.session.flash = {
        type: state.status,
        intro: 'toggle lock account feature',
        message: state.message,
      };
      res.json(state);
    } catch (error) {
      next(error);
    }
  }



  async changeFullname(req, res, next) {
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
        res.json({ changed: false, status: state.status, message: state.message });
      } else {
        const { fullname } = req.body; // Lấy dữ liệu từ yêu cầu
        console.log(fullname)
        // Do something with the fullname
        const find = await User.findById(req.session.account);
        if (find) {
          find.fullName = fullname;
          await find.save(); 
          req.session.flash = {
            type: 'success',
            intro: 'Change fullname',
            message: 'Your full name has been changed successfully',
          };
          res.json({
            changed: true,
            status: 'success',
            message: 'Your full name changed successfully'
          });
        } else {
          req.session.flash = {
            type: 'warning',
            intro: 'Change fullname',
            message: 'Fullname changed fail',
          };
          res.json({
            changed: true,
            status: 'warning',
            message: 'Fullname changed fail'
          });
        }
      }

    } catch (error) {

      next(error);
    }
  }


  async changePassword(req, res, next) {
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
        res.json({ changed: false, status: state.status, message: state.message });
      }
      else {
        const { currpass, newpass, renewpass } = req.body;
        console.log(currpass, newpass, renewpass);

        const find = await User.findById(req.session.account);
        if (!find) {
          var state = { status: 'warning', message: 'Account not found' }
        }
        else {
          var check_password = await bcrypt.compare(currpass, find.password);
          if (check_password) {
            const newpassword = await bcrypt.hash(newpass, parseInt(process.env.BCRYPT_SALT_ROUND));
            find.password = newpassword;
            await find.save(); // Lưu thay đổi
            var state = { status: 'success', message: 'Change password successful' }
          } else {
            var state = { status: 'warning', message: 'Invalid password' }
          }
          // Các xử lý khác sau khi đăng nhập thành công
          // Đăng nhập thành công, tạo flash message
          req.session.flash = {
            type: state.status,
            intro: 'change pass feature',
            message: state.message,
          };
          console.log(req.session.flash);

          res.json({ status: state.status, message: state.message });
        }
      }



    } catch (error) {

      next(error);
    }
  }



  // async getProfilebyId(req, res, next) {
  //   try {
  //     const accountId = req.params.id;
  //     const find = await User.findById(accountId);
  //     if (!find) {
  //       var state = { status: 'warning', message: 'Account not found' }
  //     }
  //     else {
  //       var check_password = await bcrypt.compare(currpass, find.password);
  //       if (check_password) {
  //         const newpassword = await bcrypt.hash(newpass, parseInt(process.env.BCRYPT_SALT_ROUND));
  //         find.password = newpassword;
  //         await find.save(); // Lưu thay đổi
  //         var state = { status: 'success', message: 'Change password successful' }
  //       } else {
  //         var state = { status: 'warning', message: 'Invalid password' }
  //       }
  //       // Các xử lý khác sau khi đăng nhập thành công
  //       // Đăng nhập thành công, tạo flash message
  //       req.session.flash = {
  //         type: state.status,
  //         intro: 'change pass feature',
  //         message: state.message,
  //       };
  //       console.log(req.session.flash);

  //       res.json({ status: state.status, message: state.message });
  //     }




  //   } catch (error) {

  //     next(error);
  //   }
  // }

  logout = async (req, res, next) => {
      try {
          // await req.logout();
          req.logout((err) => {
            if (err) {
                console.error("Error during logout:", err);
                return res.status(500).json({
                    flashMessage: {
                        type: 'error',
                        message: 'An error occurred, please log in again'
                    }
                });
            }

          // Destroy the session
          req.session.destroy((err) => {
              if (err) {
                  console.error("Error destroying session during logout:", err);
                  return res.status(500).json({
                      flashMessage: {
                          type: 'error',
                          message: 'An error occurred, please log in again' 
                      }
                  });
              }

              // Clear the session cookie
              res.clearCookie('connect.sid', { path: '/' });
              return res.json({
                  flashMessage: {
                      type: 'success',
                      message: 'Logout successful'
                  }
              });
          });
      });
      } catch (err) {
          console.error("Error during logout:", err);
          return res.status(500).json({
              flashMessage: {
                  type: 'error',
                  message: 'An error occurred, please log in again'
              }
          });
      }
  }

  async sendOTP_func(req, res, next) {
      console.log("Email input SEND OTP:", req.body.email);

      if (!validate.validateEmail(req.body.email)) {
          return res.status(400).json({
              status: 'warning',
              message: 'Invalid email. Please enter a valid email address.'
          });
      }

      let user = await User.findOne({ email: req.body.email });

      if (!user) {
          // New user registration
          const email = req.body.email;
          const domain = email.split('@')[1];
          const isStudent = domain.endsWith('.edu.vn');
          const role = isStudent ? 'student' : 'company';
          const access = isStudent ? student_feature_list : company_feature_list;
          let profilePicture = "";
          const currentTime = moment().format("HH:mm | DD/MM/YYYY");

          if(access == student_feature_list){
            profilePicture = '/images/student_default_avatar.png';
          }
          if(access == company_feature_list){
            profilePicture = '/images/company_default_avatar.png';
          }

          // Create new user
          user = new User({
              email: email,
              role: role,
              access: access,
              fullName: '', // Will be set during OTP verification
              profilePicture: profilePicture,
              createdAt: currentTime,
              lastLogin: currentTime,
              lock: false,
          });

          // Generate OTP
          const otp = user.createOTP();
          await user.save({ validateBeforeSave: false });

          const message = `Your OTP code is: ${otp}\n\nThis code is valid for 10 minutes.`;

          try {
              await mailer.sendMailForOTP({
                  email: user.email,
                  subject: 'Your Registration OTP (valid for 10 min)',
                  message: message
              });

              return res.status(200).json({
                  status: 'newUser',
                  message: 'OTP has been sent to your email! Please check your email to register!'
              });
          } catch (err) {
              user.otp = undefined;
              user.otpExpires = undefined;
              await user.save({ validateBeforeSave: false });

              console.error('Error during sending OTP:', err);

              return res.status(500).json({
                  status: 'error',
                  message: 'There was an error while sending the email. Try again later!'
              });
          }
      } 
      // Verify for admin
      if (user.role === 'admin') {
          return res.status(200).json({
              status: 'requirePassword',
              message: 'Admin account detected. Please enter your password.'
          });
      }
      if (user) {
        // Existing user
        let featureList;
        if (user.role === 'student') {
          featureList = student_feature_list;
        } if (user.role === 'company') {
          featureList = company_feature_list;
        } 
        featureList.forEach((feature) => {
           if (!user.access.some((item) => item.access === feature.access)) {
             user.access.push(feature); // Thêm feature nếu chưa tồn tại
           }
         });
     
         const otp = user.createOTP();
         await user.save({ validateBeforeSave: false });
     
         const message = `Your OTP code is: ${otp}\n\nThis code is valid for 10 minutes.`;
     
         try {
             await mailer.sendMailForOTP({
                 email: user.email,
                 subject: 'Your Login OTP (valid for 10 min)',
                 message: message
             });
     
             return res.status(200).json({
                 status: 'success',
                 message: 'OTP has been sent to your email! Please check your email to login.'
             });
         } catch (err) {
               user.otp = undefined;
               user.otpExpires = undefined;
               await user.save({ validateBeforeSave: false });
       
               console.error('Error during sending OTP:', err);
       
               return res.status(500).json({
                   status: 'error',
                   message: 'There was an error while sending the email. Try again later!'
               });
           }
       }
 
      // Generate OTP for existing user
      // const otp = user.createOTP();
      // await user.save({ validateBeforeSave: false });

      // const message = `Your OTP code is: ${otp}\n\nThis code is valid for 10 minutes.`;

      // try {
      //     await mailer.sendMailForOTP({
      //         email: user.email,
      //         subject: 'Your Login OTP (valid for 10 min)',
      //         message: message
      //     });

      //     return res.status(200).json({
      //         status: 'success',
      //         message: 'OTP has been sent to your email! Please check your email to login.'
      //     });
      // } catch (err) {
      //     user.otp = undefined;
      //     user.otpExpires = undefined;
      //     await user.save({ validateBeforeSave: false });

      //     console.error('Error during sending OTP:', err);

      //     return res.status(500).json({
      //         status: 'error',
      //         message: 'There was an error while sending the email. Try again later!'
      //     });
      // }
  }

  async verify_OTP(req, res, next) {
      console.log("VerifYING...");
      const { email, otp, password, fullName } = req.body;

      try {
          let user = await User.findOne({ email });

          if (!user) {
              return res.status(400).json({
                  status: 'error',
                  message: 'User not found with this email!'
              });
          }

          if (user.lock) {
            return res.status(400).json({
                status: 'warning',
                message: 'Account has been locked!'
            });
          }

          // Handle OTP verification
          if (otp) {
              if (!user.otp || user.otpExpires < Date.now()) {
                  return res.status(400).json({
                      status: 'error',
                      message: 'OTP has expired. Please request a new one!'
                  });
              }

              if (user.otp !== otp) {
                  return res.status(400).json({
                      status: 'error',
                      message: 'Invalid OTP. Please try again!'
                  });
              }

              // Valid OTP
              user.otp = null;
              user.otpExpires = null;

              // Cập nhật access nếu thiếu
              let featureList = [];
              if (user.role === 'student') {
                featureList = student_feature_list;
              } if (user.role === 'company') {
                featureList = company_feature_list;
              } 
              featureList.forEach((feature) => {
                if (!user.access.some((item) => item.access === feature.access)) {
                  user.access.push(feature); // Thêm feature nếu chưa tồn tại
                }
              });

              // For new user registration
              if (!user.fullName && fullName) {
                  user.fullName = fullName;
                  // Access type is already set during user creation
                  await user.save();

                  // Create a new company if the user role is 'company'
                if (user.role === 'company') {
                  await Company.create({
                      // representativeIds: user._id, 
                      representativeIds: [user._id],
                      name: '', 
                      isProfileUpdated: false,
                      averageRating: 0,
                  });
                }
              } else {
                  // Existing user
                  await user.save();
              }

              const token = jwt.sign(
                { id: user._id, role: user.role, access: user.access },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
              );
              
              req.session.account = user._id.toString();
              req.session.loggedIn = true;
              req.session.role = user.role;
              req.session.access = user.access;

              req.session.save((err) => {
                if (err) {
                  console.error("Error saving session:", err);
                  return res.status(500).json({
                    status: 'error',
                    message: 'Server error. Please try again later.'
                  });
                }

                res.cookie("remember", token, { 
                  maxAge: 30 * 24 * 60 * 60 * 1000, // lưu cookie 30 ngày
                  httpOnly: true, // ko cho truy cập cookie JS từ client
                  secure: process.env.NODE_ENV === 'production' // chỉ dc gửi cookie qua HTTPS trong env production
                });

                return res.status(200).json({
                  status: 'success',
                  message: 'Login successful!',
                  redirect: '/home'
                });
              });
              return;
          }

          // Handle password authentication for admin
          if (password) {
              const isPasswordValid = await bcrypt.compare(password, user.password);
              if (!isPasswordValid) {
                  return res.status(400).json({
                      status: 'warning',
                      message: 'Invalid password. Please try again!'
                  });
              }

              const token = jwt.sign(
                { id: user._id, role: user.role, access: user.access },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
              );
              res.cookie("remember", token, { 
                maxAge: 30 * 24 * 60 * 60 * 1000, // lưu cookie 30 ngày
                httpOnly: true, // ko cho truy cập cookie JS từ client
                secure: process.env.NODE_ENV === 'production' // chỉ dc gửi cookie qua HTTPS trong env production
              });

              req.session.account = user._id.toString();
              req.session.role = user.role;
              req.session.loggedIn = true;
              req.session.isAdmin = true;
              req.session.access = user.access;

              return res.status(200).json({
                  status: 'success',
                  message: 'Admin login successful!',
                  redirect: '/admin/company'
              });
          }

          // If neither OTP nor password is provided
          return res.status(400).json({
              status: 'error',
              message: 'Invalid request. Please provide OTP or password.'
          });
      } catch (error) {
          console.error('Error verifying OTP or password:', error);
          return res.status(500).json({
              status: 'error',
              message: 'Server error. Please try again later.'
          });
      }
  }

  async toggleFavoriteCompany (req, res) {
    try {
          const userId = req.session.account;
          const { companyId } = req.body;
          console.log("TOGGLE FAVORITE COMPANYID: ", companyId);
          
          const user = await User.findById(userId);
          if (!user) {
              return res.status(404).json({ status: 'warning', message: 'User not found!' });
          }

          if (!Array.isArray(user.savedCompanies)) {
            user.savedCompanies = [];
          }
  
          const index = user.savedCompanies.indexOf(companyId);
          if (index === -1) {
              // công ty chưa có trong danh sách thì thêm vào
              user.savedCompanies.push(companyId);
              await user.save();
              return res.status(200).json({ status: 'success', message: 'Company added to favorites!', action: 'added' });
          } else {
              // công ty đã có => xóa
              user.savedCompanies.splice(index, 1);
              await user.save();
              return res.status(200).json({ status: 'success', message: 'Company removed from favorites!', action: 'removed' });
          }
      } catch (error) {
          console.error('Error toggling favorite company:', error);
          res.status(500).json({ status: 'error', message: 'Server error!' });
      }
    }


}

module.exports = new UserController();