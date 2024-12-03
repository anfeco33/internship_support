const mailer = require('../utils/mailer');
const jwt = require('jsonwebtoken');

const sendConfirmationEmail = (email, accountId) => {
  const verify_token = jwt.sign({ accountId: accountId.toString() }, process.env.JWT_SECRET, { expiresIn: '1m' });
  mailer.sendMail(email, "Confirm your account", `${process.env.APP_URL}/verify?token=${verify_token}`);
};

const sendOTPEmail = async (email, otp) => {
  const subject = "Your OTP Code From InternChoice!";
  const url = null; // Không cần URL vì chỉ gửi OTP
  const message = `Your OTP code is: ${otp}. It will expire in 10 minutes.`;

  // mailer gửi OTP
  // await mailer.sendMailForOTP({
  //   email: email,
  //   subject: subject,
  //   message: message,
  // });
  mailer.sendMail(email, "Confirm your account", `${process.env.APP_URL}/verify?token=${verify_token}`);
};

module.exports = {
  sendOTPEmail,
};