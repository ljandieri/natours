const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
   constructor(user, url) {
      this.to = user.email;
      this.firstName = user.name.split(' ')[0];
      this.url = url;
      this.from = `Levan Jandieri <${process.env.EMAIL_FROM}>`;
   }

   createTransport() {
      if (process.env.NODE_ENV === 'production') {
         // sendgrid
         return nodemailer.createTestAccount({
            service: 'SendGrid',
            auth: {
               user: process.env.SENDGRID_USERNAME,
               pass: process.env.SENDGRID_PASSWORD,
            },
         });
      }
      return nodemailer.createTransport({
         host: process.env.EMAIL_HOST,
         port: process.env.EMAIL_PORT,
         auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
         },
      });
   }

   // send the actual email
   async send(template, subject) {
      // render the HTML based on a pug template
      const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
         firstName: this.firstName,
         url: this.url,
         subject,
      });
      // define email options
      const mailOptions = {
         from: this.from,
         to: this.to,
         subject,
         html,
         text: htmlToText.fromString(html),
         // html:
      };

      // create a transport and send email
      await this.createTransport().sendMail(mailOptions);
   }

   async sendWelcome() {
      await this.send('welcome', 'Welcome to the Natours family!');
   }

   async sendPasswordReset() {
      await this.send('passwordReset', 'Your password reset token (valid for only 10 minutes.');
   }
};
