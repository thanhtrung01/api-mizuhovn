const nodemailer = require('nodemailer')
const dotenv = require('dotenv')
dotenv.config()

const sendMail = (keyWord, to, subject, text) => {
  const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD
    }
  })
  const mailOptions = {
    from:  "chovay.noreply <noreply@chovay.com>",
    to: to,
    subject: subject,
    html:  `<div>
          <div>Xin chào,</div>
          <div><i>Hello,</i></div>
          <br/>
          <div>Mã xác minh của bạn:</div>
          <div><i>Your verification code:</i></div>
          <p style="font-size: 1.25rem; font-weight: bold; padding: 5px 0; background-color: #ccc; color: #000; text-align: center; width: 90px;">${keyWord}</p>
          <div>Vui lòng không chia sẻ mã này với bất kỳ ai.</div>
          <div><i>Please do not share this code with anyone.</i></div>
          <br/>
          <div>Trân trọng,</div>
          <div><i>Best regards,</i></div>
        </div>`,
  }
   transport.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('error', error)
      res.status(400).json({ error: 'email not send' })
    } else {
      console.log('Email sent', info.response)
      res.status(200).json({ message: 'Email sent Successfully' })
    }
  })
}

module.exports = { sendMail }
