var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const expressLayouts = require('express-ejs-layouts');
const app = express();


// middleware setup

// var adminRouter = require('./routes/adminRoute');

const userController = require('./controllers/user.controllers');


// Đường dẫn tới file .env trong thư mục config
// const envPath = path.join(__dirname, 'config', '.env');
const envPath = path.join(__dirname, '.env.example');

require('dotenv').config({ path: envPath });

console.log(process.env.APP_NAME);

// Sử dụng middleware express-ejs-layouts
app.use(expressLayouts);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
// Đặt tên layout chính
app.set('layout', 'layouts/main'); // layout.ejs là tên main layout
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'uploads')));

// app.use(session({
//   secret:  process.env.SESSION_SECRET,
//   //chỉ lưu nếu có sự thay đổi giá trị
//   resave: false,
//   //session chỉ được lưu lại khi nó đã được khởi tạo
//   saveUninitialized: false,
// }))

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI, 
      collectionName: 'sessions'
  }),
  cookie: {
      httpOnly: true,
      secure: false, // Đặt true nếu dùng HTTPS
      maxAge: 24 * 60 * 60 * 1000 // 1 ngày
  }
}));

app.use(passport.initialize());
app.use(passport.session());

app.get('/', function (req, res) {
  res.redirect('/login');
})


userController.createDefaultAccount()
.then(() => {
  console.log('Create default account successful');
  // Tiếp tục với logic của ứng dụng của bạn sau khi tạo tài khoản mặc định
})
.catch(error => {
  console.error('Error:', error);
  // Xử lý lỗi nếu cần thiết
});


// app.use('/home', authentication, staffRouter);

// app.use('/admin', authentication, isAdmin, adminRouter);

// Routes Init
const route = require("./routes/main.route");
route(app);



app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('pages/error' , {layout: false});
});


module.exports = app;
