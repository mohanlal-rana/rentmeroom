import nodemailer from "nodemailer";

const sendotp = async function (email, otp) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  await transporter.sendMail({
    from: "rentmeroom",
    to: email,
    subject: "verify your email",
    text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
  });
};
export default sendotp;
