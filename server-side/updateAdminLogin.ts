"use server";

import pool from "@/app/database/connection";
import { notifyAdminUpdate } from "./adminEmail";

export async function updateAdminLogin(email: string, username: string, password: string) {
  try {
  
    const [result]: any = await pool.query(
      "UPDATE lists_of_admins SET username = ?, password = ? WHERE email = ?",
      [username, password, email]
    );

    if (result.affectedRows > 0) {
      await notifyAdminUpdate(email);
      return { success: true, message: "Admin login updated successfully!" };
    } else {
      return { success: false, message: "No matching admin found." };
    }
  } catch (error) {
    console.error("Error updating admin login:", error);
    return { success: false, message: "Database error. Please try again." };
  }
}
