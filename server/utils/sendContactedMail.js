import nodemailer from "nodemailer";

const sendContactedMail = async (email, roomTitle) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"RentMeRoom" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Owner Contacted You",
    text: `Good news! Owner contacted you about room: ${roomTitle} go and check your account for more details.`,
  });
};

export default sendContactedMail;