//api/email/_mailer.ts
import nodemailer from "nodemailer";
export const prerender = false;

const provider = import.meta.env.EMAIL_PROVIDER;

const getTransporter = () => {
  const commonOptions = {
    host: provider === "yahoo" ? "smtp.mail.yahoo.com" : "smtp.gmail.com",
    port: 587,
    secure: false, // STARTTLS
    auth: {
      user: import.meta.env.EMAIL_USER,
      pass: import.meta.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,  // ← Esto ignora certificados autofirmados
    },
  };

  return nodemailer.createTransport(commonOptions);
};

export const transporter = getTransporter();