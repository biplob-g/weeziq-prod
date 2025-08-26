"use server";
import nodemailer from "nodemailer";

export const onMailer = async (email: string) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", // Fix typo: "smpt" -> "smtp"
    port: 465,
    secure: true,
    auth: {
      user: process.env.NODE_MAILER_EMAIL,
      pass: process.env.NODE_MAILER_GMAIL_APP_PASSWORD,
    },
  });

  const mailOptions = {
    to: email,
    subject: "Realtime Support",
    text: "One of your Customers on WeezIQ, just switched to the realtime mode",
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    return { success: true };
  } catch (error) {
    console.log(error);
    return { success: false, error };
  }
};
