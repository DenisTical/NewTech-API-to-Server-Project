const nodemailer = require('nodemailer');
const sendEmail = async(info) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const emailOptions = {
        from: 'MyShifts App<support@myshifts.com>',
        to: info.email,
        subject: info.subject,
        text: info.message
    }

    await transporter.sendMail(emailOptions);
}

module.exports = sendEmail;