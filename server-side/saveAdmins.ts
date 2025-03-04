"use server";
import pool from "@/app/database/connection";
import { sendAdminNotification } from "./adminEmail";

export async function saveAdmins(data: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    // Convert FormData to an object
    const adminData: { [key: string]: string } = {};
    data.forEach((value, key) => {
      adminData[key] = value.toString();
    });

    console.log("📝 Received FormData:", adminData);

    // Extract values
    const { name, email, role, username, password } = adminData;

    if (!name || !email || !role || !username || !password) {
      console.error("❌ Missing required fields");
      return { success: false, error: "Missing required fields" };
    }

    // Check for existing username or email
    const [rows] = await pool.query(
        "SELECT username, email FROM lists_of_admins WHERE username = ? OR email = ?",
        [username, email]
      );
 
      // Ensure rows is an array and get the first match
      //@ts-ignore
      if (rows.length > 0) {
        // @ts-ignore
        const existing = rows[0];
        if (existing.username === username) return { success: false, error: "Username already exists" };
        if (existing.email === email) return { success: false, error: "Email already exists" };
      }
      

    // Send email notification
    const emailSent = await sendAdminNotification(email, name, username, password, role);

    if (!emailSent) {
      console.error("❌ Failed to send email. Admin not saved.");
      return { success: false, error: "Failed to send email notification" };
    }

    // // Insert admin into database
    const query = `
      INSERT INTO lists_of_admins (name, email, role, username, password)
      VALUES (?, ?, ?, ?, ?)
    `;

    await pool.query(query, [name, email, role, username, password]);

    // console.log("✅ Admin saved to database");
    return { success: true };
  } catch (error) {
    console.error("❌ Error saving admin:", error);
    return { success: false, error: "Internal server error" };
  }
}
