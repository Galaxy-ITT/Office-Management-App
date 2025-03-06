"use server";

import pool from "@/app/database/connection";
import { sendAdminNotification, notifyAdminUpdate, sendAdminRemovalNotification } from "./adminEmail";

export async function saveAdmins(
  data: FormData,
  edit: boolean = false,
  del: boolean = false
): Promise<{ success: boolean; error?: string }> {
  try {
    // Convert FormData to an object
    const adminData: { [key: string]: string } = {};
    data.forEach((value, key) => {
      adminData[key] = value.toString();
    });

    console.log("📝 Received FormData:", adminData);

    // Extract values
    const { name, email, role, username, password } = adminData;

    if (!email) {
      console.error("❌ Missing required email field");
      return { success: false, error: "Email is required" };
    }

    if (del) {
      // Delete Admin
      const deleteQuery = `DELETE FROM lists_of_admins WHERE email = ?`;
      const [result] = await pool.query(deleteQuery, [email]);

      //@ts-ignore
      if (result.affectedRows === 0) {
        console.error("❌ Admin not found");
        return { success: false, error: "Admin not found" };
      }

      // Send deletion notification
      await sendAdminRemovalNotification(name, email, role);
      console.log("✅ Admin deleted and notified");
      return { success: true };
    }

    if (edit) {
      // Update Admin
      const updateQuery = `UPDATE lists_of_admins SET name = ?, role = ?, username = ?, password = ? WHERE email = ?`;
      const [updateResult] = await pool.query(updateQuery, [name, role, username, password, email]);

      //@ts-ignore
      if (updateResult.affectedRows === 0) {
        console.error("❌ Admin not found for update");
        return { success: false, error: "Admin not found" };
      }

      // Send update notification
      await notifyAdminUpdate(email);
      console.log("✅ Admin updated and notified");
      return { success: true };
    }

    // Check for existing username or email before inserting a new admin
    const [rows] = await pool.query(
      "SELECT username, email FROM lists_of_admins WHERE username = ? OR email = ?",
      [username, email]
    );

    //@ts-ignore
    if (rows.length > 0) {
      //@ts-ignore
      const existing = rows[0];
      if (existing.username === username) return { success: false, error: "Username already exists" };
      if (existing.email === email) return { success: false, error: "Email already exists" };
    }

    // Insert new admin
    const insertQuery = `
      INSERT INTO lists_of_admins (name, email, role, username, password)
      VALUES (?, ?, ?, ?, ?)
    `;
    await pool.query(insertQuery, [name, email, role, username, password]);

    // Send new admin notification
    await sendAdminNotification(email, name, username, password, role);
    console.log("✅ New admin saved and notified");
    return { success: true };
  } catch (error) {
    console.error("❌ Error saving admin:", error);
    return { success: false, error: "Internal server error" };
  }
}
