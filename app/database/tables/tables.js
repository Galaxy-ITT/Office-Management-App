import pool from "../connection.js";  // ✅ Ensure `.js` if using ESM

export async function createAllTables() {
  try {
    // Create admin table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS lists_of_admins (
        admin_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(240) NOT NULL,
        email VARCHAR(240) NOT NULL,
        username VARCHAR(240) NOT NULL,
        role VARCHAR(240) NOT NULL,
        password VARCHAR(240) NOT NULL,
        date_assigned TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log("lists_of_admins table created successfully.")

    // Create files_table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS files_table (
        id VARCHAR(36) PRIMARY KEY,
        fileNumber VARCHAR(20) NOT NULL,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        dateCreated DATETIME NOT NULL,
        referenceNumber VARCHAR(50),
        admin_id INT NOT NULL,
        INDEX idx_admin_id (admin_id),
        FOREIGN KEY (admin_id) REFERENCES lists_of_admins(admin_id) ON DELETE RESTRICT
      )
    `)
    console.log("files_table created successfully")

    // Create records_table with foreign key to files_table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS records_table (
        id VARCHAR(36) PRIMARY KEY,
        file_id VARCHAR(36) NOT NULL,
        uniqueNumber VARCHAR(20) NOT NULL,
        type VARCHAR(50) NOT NULL,
        date DATETIME NOT NULL,
        \`from\` VARCHAR(255) NOT NULL,
        \`to\` VARCHAR(255) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        content TEXT,
        status VARCHAR(50) NOT NULL,
        reference VARCHAR(50),
        trackingNumber VARCHAR(50),
        FOREIGN KEY (file_id) REFERENCES files_table(id) ON DELETE CASCADE,
        INDEX idx_file_id (file_id)
      )
    `)
    console.log("records_table created successfully")

    return { success: true, message: "All tables created successfully" }
  } catch (error) {
    console.error("Error creating tables:", error)
    return { success: false, error: error.message }
  }
}

// Export individual functions for backward compatibility
export default async function adminsTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS lists_of_admins (
        admin_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(240) NOT NULL,
        email VARCHAR(240) NOT NULL,
        username VARCHAR(240) NOT NULL,
        role VARCHAR(240) NOT NULL,
        password VARCHAR(240) NOT NULL,
        date_assigned TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log("lists_of_admins table created successfully.")
    return { success: true }
  } catch (error) {
    console.error("Error creating lists_of_admins table:", error)
    return { success: false, error: error.message }
  }
}

export async function table_files() {
  try {
    // Create files_table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS files_table (
        id VARCHAR(36) PRIMARY KEY,
        fileNumber VARCHAR(20) NOT NULL,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        dateCreated DATETIME NOT NULL,
        referenceNumber VARCHAR(50),
        admin_id INT NOT NULL,
        INDEX idx_admin_id (admin_id),
        FOREIGN KEY (admin_id) REFERENCES lists_of_admins(admin_id) ON DELETE RESTRICT
      )
    `)
    console.log("files_table created successfully")

    // Create records_table with foreign key to files_table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS records_table (
        id VARCHAR(36) PRIMARY KEY,
        file_id VARCHAR(36) NOT NULL,
        uniqueNumber VARCHAR(20) NOT NULL,
        type VARCHAR(50) NOT NULL,
        date DATETIME NOT NULL,
        \`from\` VARCHAR(255) NOT NULL,
        \`to\` VARCHAR(255) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        content TEXT,
        status VARCHAR(50) NOT NULL,
        reference VARCHAR(50),
        trackingNumber VARCHAR(50),
        FOREIGN KEY (file_id) REFERENCES files_table(id) ON DELETE CASCADE,
        INDEX idx_file_id (file_id)
      )
    `)
    console.log("records_table created successfully")

    return { success: true, message: "Tables created successfully" }
  } catch (error) {
    console.error("Error creating tables:", error)
    return { success: false, error: error.message }
  }
}

