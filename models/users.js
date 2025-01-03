const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const crypto = require('crypto')

const userSchema = new Schema({
    // username: { type: String, required: true },
    password: { type: String, required: false },
    email: { type: String, required: true , unique: true},
    googleId: {type: String, required: false},
    fullName: { type: String, required: true },
    role: { type: String, enum: ['admin', 'student','company'], required: true },
    access: [
        {
          access: { type: String, required: true },
          icon: { type: String, required: true }
        },
    ],
    //cart: [{ type: Schema.Types.ObjectId, ref: 'Course' }], // Sửa lại thành mảng các ObjectId liên kết với mô hình "courseSchema"
    // subscribed: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
    // exercise: { type: [String]},
    // note: { type: [String]},
    
    // mới
    // profileUpdated: { type: Boolean, default: false }, 
    // verified: { type: Boolean, default: false }, 
    // savedCompanies: [{ type: Schema.Types.ObjectId, ref: 'Company' }], // doanh nghiệp yêu thích (dành cho sinh viên)
    applicationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }, // Trạng thái ứng tuyển
    otp: { type: String }, 
    otpExpires: { type: Date },

    profilePicture: { type: String, required: true},
    lastLogin: { type: String , required: true},
    createdAt: { type: String, default: new Date().toUTCString()},
    lock: { type: Boolean, default: false},
    passwordChangedAt: { type: Date},
    // password_reset_token: { type: String},
    // password_reset_expires: { type: Date},
});

userSchema.methods.createResetPasswordToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex')

  this.password_reset_token = crypto.createHash('sha256').update(resetToken).digest('hex')
  this.password_reset_expires = Date.now() + 10 * 60 * 1000

  console.log({ resetToken }, this.password_reset_token)
  return resetToken
}

userSchema.methods.createOTP = function() {
  const otp = crypto.randomInt(100000, 999999).toString(); // Tạo OTP 6 chữ số
  this.otp = otp;
  this.otpExpires = Date.now() + 10 * 60 * 1000; // OTP hết hạn sau 10 phút
  return otp;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
