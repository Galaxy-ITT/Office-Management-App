import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { transporter } from "./utils/util";
import os from "os";
import axios from "axios";

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

export async function sendAdminRemovalNotification(name: string, email: string, role: string): Promise<boolean> {
  try {
    const subject = "Admin Access Revoked - Office Management";
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px; padding: 20px;">
      <h2 style="color: #d9534f; text-align: center;">Access Revoked</h2>
      <p>Dear <strong>${name}</strong>,</p>
      <p>We would like to inform you that your role as <strong>${role}</strong> in OfficeManagement has been removed.</p>
      <p>You no longer have access to the system.</p>

      <hr style="border: 0; height: 1px; background: #ddd; margin: 20px 0;">

      <p>If you believe this was a mistake or require further clarification, please contact the support team.</p>
      
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

    console.log(`📧 Removal notification sent successfully to ${email}`);
    return !!info.messageId;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return false;
  }
}


export async function sendAdminLoginNotification(email: string, role: string): Promise<boolean> {
  try {
    // const ipAddress = await getPublicIP();
    const subject = "Login Alert - Office Management";
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
      <h2 style="color: #2d89ef; text-align: center;">Login Notification</h2>
      <p>Dear Admin,</p>
      <p>Your OfficeManagement account with the role of <strong>${role}</strong> has been logged in successfully.</p>
      <p><strong>Login Details:</strong></p>
      <div style="background: #f3f3f3; padding: 10px; border-radius: 6px;">
        <p><strong>Date & Time:</strong> ${new Date().toLocaleString()}</p>
      </div>

      <p>If this was you, no further action is needed.</p>
      <p>If you did NOT log in, please reset your password immediately using the link below:</p>
      <p><a href="http://localhost:3000/pages/change-password-admins" style="color: #2d89ef;">Reset Password</a></p>

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

    console.log(`📧 Login notification sent successfully to ${email}`);
    return !!info.messageId;
  } catch (error) {
    console.error("❌ Error sending login notification email:", error);
    return false;
  }
}

export async function sendRoleAssignmentNotification(
  to: string,
  employeeName: string,
  roleName: string,
  departmentName: string | null,
  description: string | null,
  username?: string,
  password?: string
): Promise<boolean> {
  try {
    const subject = "New Role Assignment and Account Details - Office Management";
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
      <h2 style="color: #2d89ef; text-align: center;">Role Assignment Notification</h2>
      <p>Dear <strong>${employeeName}</strong>,</p>
      <p>We are pleased to inform you that you have been assigned a new role in our organization:</p>
      
      <div style="background: #f3f3f3; padding: 15px; border-radius: 6px; margin: 15px 0;">
        <p><strong>Role:</strong> ${roleName}</p>
        ${departmentName ? `<p><strong>Department:</strong> ${departmentName}</p>` : ''}
        ${description ? `<p><strong>Description:</strong> ${description}</p>` : ''}
      </div>
      
      <p>This assignment is effective immediately.</p>

      ${username && password ? `
      <h3 style="color: #2d89ef; margin-top: 20px;">Access Your Dashboard</h3>
      <p>We've created an administrator account for you to access the OfficeManagement system. Below are your login credentials:</p>
      
      <div style="background: #f3f3f3; padding: 15px; border-radius: 6px; margin: 15px 0;">
        <p><strong>Username:</strong> ${username}</p>
        <p><strong>Password:</strong> ${password}</p>
      </div>
      
      <p><a href="http://localhost:3000/pages/admins-login" style="background: #2d89ef; color: #fff; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block;">Log in to OfficeManagement</a></p>
      
      <p>For security reasons, we recommend changing your password immediately after your first login.</p>
      <p><a href="http://localhost:3000/pages/change-password-admins" style="color: #2d89ef;">Change Password</a></p>
      ` : ''}

      <hr style="border: 0; height: 1px; background: #ddd; margin: 20px 0;">
      
      <p>Please contact your supervisor or HR department if you have any questions regarding your new responsibilities.</p>
      
      <p style="text-align: center; color: #888;">Best regards, <br> <strong>Office Management Team</strong></p>
    </div>
    `;

    // Send email
    const info = await transporter.sendMail({
      from: `"Office Management" <${process.env.EMAIL}>`,
      to,
      subject,
      html,
    });

    console.log(`📧 Role assignment notification sent successfully to ${to}`);
    return !!info.messageId;
  } catch (error) {
    console.error("❌ Error sending role assignment notification:", error);
    return false;
  }
}

export async function sendEmployeeAccountNotification(
  to: string,
  name: string,
  position: string,
  department: string | null,
  username: string,
  password: string
): Promise<boolean> {
  try {
    const subject = "Your Employee Account Details - Office Management";
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
      <h2 style="color: #2d89ef; text-align: center;">Welcome to OfficeManagement!</h2>
      <p>Dear <strong>${name}</strong>,</p>
      <p>Your employee account has been created for the position of <strong>${position}</strong>${department ? ` in the ${department} department` : ''}. Below are your login credentials:</p>
      <div style="background: #f3f3f3; padding: 10px; border-radius: 6px;">
        <p><strong>Username:</strong> ${username}</p>
        <p><strong>Password:</strong> ${password}</p>
      </div>
      <p>You can log in using the link below:</p>
      <p><a href="http://localhost:3000/pages/admins-login" style="background: #2d89ef; color: #fff; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block;">Log in to OfficeManagement</a></p>

      <p>For security reasons, we recommend changing your password immediately. Use the link below to reset it:</p>
      <p><a href="http://localhost:3000/pages/change-password-admins" style="color: #2d89ef;">Change Password</a></p>

      <hr style="border: 0; height: 1px; background: #ddd; margin: 20px 0;">

      <p>If you have any questions or need assistance, please contact your HR representative.</p>
      
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

    console.log(`📧 Employee account email sent successfully to ${to}`);
    return !!info.messageId;
  } catch (error) {
    console.error("❌ Error sending employee account email:", error);
    return false;
  }
}
