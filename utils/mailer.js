const nodeMailer = require('nodemailer');

const mailConfig = require('../config/mail.config');
const Mailgen = require('mailgen');


// console.log(jwt_secret_key)

// console.log(mailConfig.PORT)
exports.sendMail = async (to, subject , url) => {

    const config = {
        service: 'gmail',
        host: mailConfig.HOST,
        port: parseInt(mailConfig.PORT),
        secure: false,
        auth: {
            user: mailConfig.USERNAME,
            pass: mailConfig.PASSWORD,
        }
    }
    const transport = nodeMailer.createTransport(config)

    const mailgenerator = new Mailgen({
        theme: 'default',
        product:{
            name: 'Mailgen',
            link: 'https://mailgen.js/'
        },

    })

    const email = {
        body: {
            name: to,
            intro: `Welcome to ${mailConfig.APPNAME}! We\'re very excited to have you on board.`,
            action: {
                instructions: 'To get started with InternChoice, please click here:',
                button: {
                    color: '#22BC66', // Optional action button color
                    text: 'Confirm your account',
                    link: url
                }
            },
            outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
        }
    };
    
    // Generate an HTML email with the provided contents
    const emailBody = mailgenerator.generate(email);
    
    // // Generate the plaintext version of the e-mail (for clients that do not support HTML)
    // const emailText = mailgenerator.generatePlaintext(email);
    
    // // Optionally, preview the generated HTML e-mail by writing it to a local file
    // require('fs').writeFileSync('preview.html', emailBody, 'utf8');
    
    // `emailBody` now contains the HTML body,
    // and `emailText` contains the textual version.
    // 
    // It's up to you to send the e-mail.
    // Check out nodemailer to accomplish this:
    // https://nodemailer.com/

    const message = {
        from: mailConfig.FROM_ADDRESS,
        to: to,
        subject: subject,
        html: emailBody
    }
    return await transport.sendMail(message , (err , info) =>{
        if (err) {
            console.log('Error occurred:', err.message);
          } else {
            console.log('Email sent successfully!');
            console.log('Message ID:', info.messageId);
          }
    });
}

exports.sendMailForOTP = async (option) => {
    var smtpConfig = {
        service: 'Gmail',
            auth: {
                user: process.env.MAIL_USERNAME,
                pass: process.env.MAIL_PASSWORD
            },
    };
    var transporter = nodeMailer.createTransport(smtpConfig);

    const emailOptions = {
        from: 'InternChoice support<support@internchoice.com>',
        to: option.email,
        subject: option.subject,
        text: option.message, // Gửi OTP ở đây
    }

    await transporter.sendMail(emailOptions)
}

exports.sendReportMail = async (from, to, subject, html) => {
    try {
        const smtpConfig = {
            service: 'Gmail',
            auth: {
                user: process.env.MAIL_USERNAME,
                pass: process.env.MAIL_PASSWORD,
            },
        };

        const transporter = nodeMailer.createTransport(smtpConfig);

        const emailOptions = {
            from: from, // User who reported
            to: to, // Admin's email
            subject: subject, // Email subject
            html: html, // Email content as HTML
        };

        const info = await transporter.sendMail(emailOptions);

        console.log(`Report email sent successfully: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error(`Error sending report email: ${error.message}`);
        throw error;
    }
};
