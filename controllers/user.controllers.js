const User = require('../models/users');
const Instructor = require('../models/instructors')
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

const admin_feature_list = [
  { access: "Student", icon: "<i class='bx bx-grid-alt'></i>" },
  { access: "Instructor", icon: "<i class='fa-solid fa-bars-progress'></i>" },
  { access: "Course Manager", icon: "<i class='fa-solid fa-list'></i>" },
  { access: "Transaction", icon: "<i class='fa-solid fa-cart-plus'></i>" },
  { access: "Statistical", icon: "<i class='fa-solid fa-signal'></i>" }
]

const student_feature_list = [
  { access: "Course", icon: "<i class='fa-solid fa-graduation-cap'></i>" },
  { access: "Subscribed", icon: "<i class='fa-solid fa-square-check'></i>" }
]


const instructor_feature_list = [
  { access: "Course", icon: "<i class='fa-solid fa-graduation-cap'></i>" },
  { access: "Exercise", icon: "<i class='fa-solid fa-pen-to-square'></i>" }
]

class UserController {
  // account có quyền hạn cao nhất các account sau đó được phân chia quyền hạn dựa trên admin
  createDefaultAccount() {
    console.log("DEFAULT ADMIN : ")
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
            profilePicture: '../../images/dejault_avatar.png',
            lastLogin: currentTime,
          });
          await defaultAdmin.save();
          resolve(); // Tài khoản mặc định đã được tạo thành công
        } else {
          // console.log('Tài khoản admin đã tồn tại.');
          resolve(); // Tài khoản admin đã tồn tại
        }
      } catch (error) {
        // console.error('Lỗi khi tạo tài khoản admin mặc định:', error);
        reject(error); // Xảy ra lỗi khi tạo tài khoản
      }
    });
  }





  async login(req, res, next) {
    // TODO: thêm xử lý đăng nhập khi đăng ký bên ngoài 
    // trường hợp không phải admin tạo
    console.log("LOGIN : ")
    try {
      // req.session.admin_feature = admin_feature_list;
      // req.session.staff_feature = student_feature_list;

      // Kiểm tra thông tin đăng nhập và xác thực
      // console.log("HERE");
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
        const { username, password } = req.body;
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


  async signup(req, res, next) {
    // TODO: thêm xử lý đăng nhập khi đăng ký bên ngoài 
    // trường hợp không phải admin tạo
    console.log("SIGN UP : ")
    try {
      const errors = validationResult(req);
      // console.log(errors);

      if (!errors.isEmpty()) {
        var err_msg = "";
        var list_err = errors.array();
        list_err.forEach(err => {
          err_msg += err.msg + " , ";
        });

        console.log(err_msg);

        //CƠ CHẾ CỦA VALIDATOR KHÔNG CHO ĐI TIẾP
        var state = { status: 'warning', message: err_msg };
        res.json({ status: state.status, message: state.message , redirect: ""});
      } else {
        const { username , email, password , accountType } = req.body;
        const currentTime = moment().format("HH:mm | DD/MM/YYYY");

        if(accountType == "student"){
          var access = student_feature_list;
        }
        if(accountType == "instructor"){
          var access = instructor_feature_list;
        }

  

        console.log(username , email, password , accountType);
        const find = await User.findOne({ email: email });
        if (!find) {
          const password_hash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_SALT_ROUND));
          // console.log(defaultpassword);
          const newAccount = new User({
            username: username,
            // Trong thực tế, hãy sử dụng mã hóa mật khẩu bằng bcrypt hoặc một thư viện tương tự
            password: password_hash,
            email: email,
            fullName: email.split("@")[0],
            role: accountType,
            access: access,
            profilePicture: '../../images/dejault_avatar.png',
            lastLogin: currentTime,
          });

          // res.json({ added: true, status: "success", message: "Add staff successfully" });
          await newAccount.save()
            .then((savedAccount) => {
              var goto = '/home'
              // Lưu thành công
              console.log('Account saved successfully:');
              // Thực hiện các hành động tiếp theo ở đây

              req.session.flash = {
                type: "success",
                intro: 'signup feature',
                message: "Create account successfully, Login now !!!",
              };
              res.json({ status: "success", message: "Create account successfully, Login now !!!", redirect: goto});
            }).catch((error) => {
              // Xử lý lỗi nếu quá trình lưu không thành công
              console.error('Error saving account:', error);
              res.json({ status: "error", message: "Failed to add student", redirect: "" });
            })
        }
        else {
          // res.json({ added: true, status: "success", message: "Add staff successfully" });
          res.json({ status: "warning", message: "Account already exists", redirect: "" });
        }
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

  async getlistinstructor() {
    try {

      const find = await User.find({ $or: [{ role: 'instructor' }] });
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

      // console.log(partial, layout);
      // console.log(req.session.account)
      // const verifyaccess = await this.verifyAccess(req.session.account);
      const account = await this.getAccount(req.session.account)
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
        const sidebar = req.session.access;

        //TODO: chỗ này tùy chỉnh tùy theo page
        const data_render = req.page_data ? req.page_data : "";
        // Lấy flash message từ session
        var flashMessage = req.session.flash;
        if (flashMessage) {
          console.log(flashMessage);
        }
        // Xóa flash message khỏi session
        delete req.session.flash;
        //RENDER KHÁC VỚI JSON NÓ VẪN CHẠY TIẾP

        console.log("data: ", data_render)
        res.render(partial, { layout: layout, access: sidebar, account: account, flashMessage, data: data_render });
      }
    } catch (error) {
      next(error);
    }
  }

  async getAccount(accountID) {
    console.log("curr account : " + accountID)
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


  //chỉ verify cho account có status là inactive
  //nếu account đã kích hoạt nhảy page
  async verifyAccount(req, res, next) {
    console.log("Verify staff account: ")
    try {
      const token = req.query.token;
      console.log(token)
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(decoded)
      const accountId = decoded.accountId;
      const currentTime = Math.floor(Date.now() / 1000);
      if (decoded.exp < currentTime) {
        throw new Error('Token has expired');
      }
      // Xác minh thành công, trả về userId
      // res.json(accountId);
      const find = await User.findById(accountId);
      if (find) {
        find.status = "intial"; // Cập nhật trường "status" thành "intial"
        await find.save(); // Lưu thay đổi
        res.redirect('/login')
      }
    } catch (error) {
      next(error);
    }
  }


  async togglelockAccount(req, res, next) {
    console.log("Lock and Unlock account: ")
    try {
      const { accountID } = req.body;
      console.log(accountID)
      const find = await User.findById(accountID);
      // // console.log(find)
      if (find) {
        if (find.lock == false) {
          find.lock = true;
          var tmp = 'OPEN';
        } else {
          find.lock = false;
          var tmp = 'CLOSE';
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
          await find.save(); // Lưu thay đổi
          req.session.flash = {
            type: 'success',
            intro: 'Change fullname',
            message: 'Fullname has been changed successfully',
          };
          res.json({
            changed: true,
            status: 'success',
            message: 'Fullname has been changed successfully'
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



  async getProfilebyId(req, res, next) {
    try {
      const accountId = req.params.id;
      const find = await User.findById(accountId);
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




    } catch (error) {

      next(error);
    }
  }

  async logout(req, res) {
    console.log("LOGOUT : ")
    try {
      if (req.session.loggedIn) {
        req.session.loggedIn = false;
        var state = { status: 'success', message: 'Logout successful' };
      }
      else {
        var state = { status: 'warning', message: 'Có lỗi xảy ra hãy đăng nhập lại' };
      }

      req.session.flash = {
        type: state.status,
        intro: 'logout feature',
        message: state.message,
      };
      var goto = "/login"
      var flashMessage = req.session.flash;
      // console.log(flashMessage);
      // Trả về phản hồi thành công
      return res.status(200).json({ flashMessage: flashMessage, redirect: goto });
      //   var state = { status: 'warning', message: err_msg };



    } catch (error) {

      next(error);
    }
  }

  forgotPassword = async(req, res, next) => {
    if (!validate.validateEmail(req.body.email)) {
      req.session.flash = {
        type: 'warning',
        intro: 'Invalid email format',
        message: 'Please enter a valid email address.',
      };
      return res.redirect("/forgot-password");
    }

    const user = await User.findOne({ email: req.body.email })
    if (!user || user.role === 'admin') {
      var state = { status: 'warning', message: 'User not found with this email!' };
      req.session.flash = {
        type: state.status,
        intro: 'forgotpass feature',
        message: state.message,
      }
      return res.redirect("/forgot-password")
      // return res.status(404).json({
      //   status: 'warning',
      //   message: 'User not found with this email'
      // });
    }
    const resetToken = user.createResetPasswordToken()

    await user.save({ validateBeforeSave: false})

    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`
    const message = `Forgot your password ? Paste this link to your browser\n\n`+
                    `${resetUrl}\n\n` +
                    `If you didn't forget your password, please ignore this email!\n`
    
    try {
      await mailer.sendMailResetPassword({
        email: user.email,
        subject: 'Your password reset token (valid for 10 min)',
        message: message
      })

      req.session.flash = {
        type: 'success',
        message: 'Token has been sent to your email! Please check your email to reset password.'
      }
      return res.redirect("/forgot-password");
    } catch (err) {
      user.password_reset_token = undefined
      user.password_reset_expires = undefined
      user.save({ validateBeforeSave: false })

      console.error('Error during password reset process:', err);
        // res.status(500).json({
        //     status: 'error',
        //     message: 'There was an error sending the email. Try again later!'
        // });
      var state = {
        status: 'error',
        message: 'There was an error while sending the email. Try again later!'
      }
      req.session.flash = {
        type: state.status,
        message: state.message
      }
      return res.redirect('redirect: "/forgot-password"');
    }
  }

  async resetPassword(req, res, next) {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    console.log(hashedToken)

    const user = await User.findOne({
      password_reset_token: hashedToken,
      password_reset_expires: { $gt: Date.now() }
    });
  
    if (!user) {
      req.session.flash = {
        type: 'warning',
        message: 'Token is invalid or has expired. You can get a new one here!'
      };
      return res.redirect('/forgot-password');
    }
    // set new password
    if (req.body.password !== req.body.confirmPassword) {
      req.session.flash = {
        type: 'warning',
        message: 'Passwords do not match. Please try again!'
      };
      return res.redirect(`/reset-password/${req.params.token}`);
    }

    user.password = await bcrypt.hash(req.body.password, parseInt(process.env.BCRYPT_SALT_ROUND));
    user.password_reset_token = undefined
    user.password_reset_expires = undefined
    user.passwordChangedAt = Date.now()
    await user.save()

    // log the user in, send JWT
    const loginToken = jwt.sign({ accountId: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.cookie("remember", loginToken, { maxAge: 30 * 24 * 60 * 60 * 1000 })

    req.session.flash = {
      type: 'success',
      message: 'Your password has been reset successfully. Please login with your new password.'
    };
  
    return res.redirect('/login');
  }
}

module.exports = new UserController();