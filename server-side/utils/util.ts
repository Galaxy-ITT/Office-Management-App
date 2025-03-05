import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL, // Your Gmail address
      pass: process.env.EMAIL_PASS, // Your app password
    },
});