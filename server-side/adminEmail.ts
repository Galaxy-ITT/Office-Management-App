import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { transporter } from "./utils/util";

dotenv.config();

export async function sendAdminNotification(
  to: string,
  name: string,
  username: string,
  password: string,
  role: string
): Promise<boolean> {
  try {
    const subject = "Your Admin Account Details - Office Management";
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
      <h2 style="color: #2d89ef; text-align: center;">Welcome to OfficeManagement!</h2>
      <p>Dear <strong>${name}</strong>,</p>
      <p>You have been assigned the role of <strong>${role}</strong> in Office Management. Below are your login credentials:</p>
      <div style="background: #f3f3f3; padding: 10px; border-radius: 6px;">
        <p><strong>Username:</strong> ${username}</p>
        <p><strong>Password:</strong> ${password}</p>
      </div>
      <p>You can log in using the link below:</p>
      <p><a href="http://localhost:3000/pages/admins-login" style="background: #2d89ef; color: #fff; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block;">Log in to OfficeManagement</a></p>

      <p>For security reasons, we recommend changing your password immediately. Use the link below to reset it:</p>
      <p><a href="http://localhost:3000/pages/change-password-admins" style="color: #2d89ef;">Change Password</a></p>

      <hr style="border: 0; height: 1px; background: #ddd; margin: 20px 0;">

      <p>If you did not request this account, or if you have any concerns, please contact support immediately.</p>
      
      <p style="text-align: center; color: #888;">Best regards, <br> <strong>OfficeManagement Team</strong></p>
    </div>
    `;

    // Send email
    const info = await transporter.sendMail({
      from: `"Office Management" <${process.env.EMAIL}>`,
      to,
      subject,
      html,
    });

    console.log(`📧 Email sent successfully to ${to}`);
    return !!info.messageId;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return false;
  }
}

export async function notifyAdminUpdate(email: string): Promise<boolean> {
  try {
    const subject = "Your Admin Account Details Have Been Updated - Office Management";
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
      <h2 style="color: #2d89ef; text-align: center;">Account Details Updated</h2>
      <p>Dear Admin,</p>
      <p>This is to inform you that your OfficeManagement account details have been updated.</p>
      <p>If you made this change, no further action is required.</p>

      <p>If you did NOT make this change, please reset your password immediately using the link below:</p>
      <p><a href="http://localhost:3000/pages/change-password-admins" style="color: #2d89ef;">Change Password</a></p>

      <hr style="border: 0; height: 1px; background: #ddd; margin: 20px 0;">

      <p>If you have any concerns, please contact support immediately.</p>
      
      <p style="text-align: center; color: #888;">Best regards, <br> <strong>OfficeManagement Team</strong></p>
    </div>
    `;

    // Send email
    const info = await transporter.sendMail({
      from: `"Office Management" <${process.env.EMAIL}>`,
      to: email,
      subject,
      html,
    });

    console.log(`📧 Notification email sent successfully to ${email}`);
    return !!info.messageId;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return false;
  }
}
