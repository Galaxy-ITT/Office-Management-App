"use server";

import pool from "@/app/database/connection";

export async function getAdmins() {
  try {
    const [rows] = await pool.query("SELECT * FROM lists_of_admins"); // Correct MySQL2 syntax
    return rows; // MySQL2 returns results directly in `rows`
  } catch (error) {
    console.error("Error fetching admins:", error);
    return [];
  }
}

export async function getAdmin(username: string, password: string) {
  try {
    const [rows]: any = await pool.query(
      "SELECT * FROM lists_of_admins WHERE username = ? AND password = ? LIMIT 1",
      [username, password]
    );

    if (rows.length > 0) {
      return {
        success: true,
        isAdmin: true,
        data: rows[0].role, // Return the admin data if needed
      };
    }
// commit
    return {
      success: false,
      isAdmin: false,
      data: null,
    };
  } catch (error) {
    console.error("Error fetching admin:", error);
    return {
      success: false,
      isAdmin: false,
      data: null,
    };
  }
}
