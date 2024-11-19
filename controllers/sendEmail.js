// Trong tệp emailUtils.js
const mailer = require('../utils/mailer');
const jwt = require('jsonwebtoken');

const sendConfirmationEmail = (email, accountId) => {
  const verify_token = jwt.sign({ accountId: accountId.toString() }, process.env.JWT_SECRET, { expiresIn: '1m' });
  mailer.sendMail(email, "Confirm your account", `${process.env.APP_URL}/verify?token=${verify_token}`);
};

module.exports = {
  sendConfirmationEmail,
};