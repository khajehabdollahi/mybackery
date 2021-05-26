const nodemailer = require("nodemailer");

// async..await is not allowed in global scope, must use a wrapper
module.exports = async function main(to, subject, text) {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "noreplybackeryhelper@gmail.com",
      pass: "Zxc!1234",
    },
  });
  //noreplybackeryhelper@gmail.com

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Backery Help " <noreplybackeryhelper@gmail.com>', // sender address
    to,
    subject,
    text,
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
};
