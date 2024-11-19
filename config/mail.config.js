const path = require('path')
const envPath = path.join(__dirname, '../.env.example');
require('dotenv').config({ path: envPath });

// console.log(process.env.MAIL_MAILER);

module.exports = {
    MAILER: process.env.MAIL_MAILER,
    HOST: process.env.MAIL_HOST,
    PORT: process.env.MAIL_PORT,
    APPNAME: process.env.APP_NAME,
    USERNAME: process.env.MAIL_USERNAME,
    PASSWORD: process.env.MAIL_PASSWORD,
    ENCRYPTION: process.env.MAIL_ENCRYPTION,
    FROM_ADDRESS: process.env.MAIL_FROM_ADDRESS,
    FROM_NAME: process.env.MAIL_FROM_NAME,
}