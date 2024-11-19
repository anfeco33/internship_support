
const adminRoute = require("./admin.route"),
  userRoute = require("./user.route"),
  authRoute = require("./auth.route"),
  profileRoute = require("./profile.route"),
  fileRoute = require("./file.route"),
  paymentRoute = require('./payment.route');
const connect = require("../config/connection");
var { authentication, isAdmin } = require('../middleware/authentication');
const mailer = require('../utils/mailer')
const userControllers = require('../controllers/user.controllers');

//TODO: để giữ dark mode dùng ajax lưu state và gắn class .dark cho body

// const OrderRoute = require("./orderRoute");
// const checkUser = require("../app/middleware/checkUser");

const router = (app) => {
  //connect MongoDB
  app.use("/", authRoute)
  connect.connect();

  //TODO: sửa lại để check khi user click verify (gợi ý : check từng middleware) 
  app.use("/admin", authentication, isAdmin, adminRoute);
  app.use('/home', authentication, userRoute);
  // app.get('/verify', userControllers.verifyAccount);
  app.use('/' , authentication , profileRoute);
  app.use('/' , authentication , fileRoute);
  app.use('/', authentication, paymentRoute);

};

module.exports = router;
