import nodemailer from "nodemailer";

/* =========================================
   TRANSPORTER (GMAIL SMTP)
========================================= */

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password (NOT normal password)
  },
});

/* =========================================
   CORE SEND FUNCTION
========================================= */

export async function sendEmail(to, subject, html) {
  try {
    if (!to) throw new Error("Missing recipient email");

    const mailOptions = {
      from: `"NexusControl" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    const result = await transporter.sendMail(mailOptions);

    console.log(`[EMAIL SENT] to: ${to} | subject: ${subject}`);
    return result;
  } catch (err) {
    console.error("[EMAIL ERROR]", err.message);
    throw err;
  }
}