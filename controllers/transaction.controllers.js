const Transaction = require('../models/transactions');
const Course = require('../models/companies');
const User = require('../models/users');
const { validationResult } = require('express-validator');

// sửa course thành companies

class TransactionController {
  async get_list_transaction() {
    try {
      const transactions = await Transaction.find({});
    
      const processedTransactions = [];
    
      for (const transaction of transactions) {
        const { amountPaid, cardOwner, transactionDate, paymentMethod, userId, courseIds } = transaction;
    
        const user = await User.findById(userId).select('fullName'); // Lấy thông tin người dùng từ bảng User
    
        const courses = await Course.find({ _id: { $in: courseIds } }).select('courseName coursePrice'); // Lấy thông tin khóa học từ bảng Course
    
        const transactionData = {
          amountPaid,
          cardOwner,
          transactionDate,
          paymentMethod,
          fullName: user.fullName,
          courses: courses.map(course => ({
            courseName: course.courseName,
            coursePrice: course.coursePrice
          }))
        };
    
        processedTransactions.push(transactionData);
      }
    
      console.log(processedTransactions);
      return processedTransactions;
    } catch (error) {
      console.log(error);
    }
  }


}
module.exports = new TransactionController();