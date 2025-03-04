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