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
        username VARCHAR(240) NOT NULL,
        email VARCHAR(240) NOT NULL,
        role VARCHAR(240) NOT NULL,
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
        attachmentUrl VARCHAR(255),
        attachmentName VARCHAR(255),
        attachmentSize INT,
        attachmentType VARCHAR(100),
        FOREIGN KEY (file_id) REFERENCES files_table(id) ON DELETE CASCADE,
        INDEX idx_file_id (file_id)
      )
    `)
    console.log("records_table created successfully")

    // Create forwarded_records table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS forwarded_records (
        forward_id VARCHAR(36) PRIMARY KEY,
        record_id VARCHAR(36) NOT NULL,
        file_id VARCHAR(36) NOT NULL,
        forwarded_by INT NOT NULL,
        forwarded_to VARCHAR(255) NOT NULL,
        recipient_type VARCHAR(50) NOT NULL,
        notes TEXT,
        forward_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'Pending',
        FOREIGN KEY (record_id) REFERENCES records_table(id) ON DELETE CASCADE,
        FOREIGN KEY (file_id) REFERENCES files_table(id) ON DELETE CASCADE,
        FOREIGN KEY (forwarded_by) REFERENCES lists_of_admins(admin_id) ON DELETE RESTRICT,
        INDEX idx_record_id (record_id),
        INDEX idx_forwarded_by (forwarded_by)
      )
    `)
    console.log("forwarded_records table created successfully")

    // Create reviews_records table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews_records (
        review_id VARCHAR(36) PRIMARY KEY,
        record_id VARCHAR(36) NOT NULL,
        forward_id VARCHAR(36) NOT NULL,
        reviewed_by VARCHAR(255) NOT NULL,
        review_action VARCHAR(50) NOT NULL,
        review_note TEXT,
        department VARCHAR(255),
        department_person VARCHAR(255),
        review_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (record_id) REFERENCES records_table(id) ON DELETE CASCADE,
        FOREIGN KEY (forward_id) REFERENCES forwarded_records(forward_id) ON DELETE CASCADE,
        INDEX idx_record_id (record_id),
        INDEX idx_forward_id (forward_id)
      )
    `)
    console.log("reviews_records table created successfully")

    // Create departments_table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS departments_table (
        department_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        head_of_department VARCHAR(255),
        location VARCHAR(255),
        created_by INT NOT NULL,
        date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES lists_of_admins(admin_id) ON DELETE RESTRICT,
        INDEX idx_created_by (created_by)
      )
    `)
    console.log("departments_table created successfully")

    // Create employees_table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS employees_table (
        employee_id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        position VARCHAR(100) NOT NULL DEFAULT 'Staff',
        department_id INT,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (department_id) REFERENCES departments_table(department_id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES lists_of_admins(admin_id) ON DELETE RESTRICT,
        INDEX idx_department (department_id),
        INDEX idx_created_by (created_by)
      )
    `)
    console.log("employees_table created successfully")

    // Create roles_table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS roles_table (
        role_id VARCHAR(36) PRIMARY KEY,
        role_name VARCHAR(100) NOT NULL, 
        employee_id VARCHAR(36) NOT NULL,
        department_id INT,
        description TEXT,
        assigned_by INT NOT NULL,
        admin_id INT,
        date_assigned TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
        FOREIGN KEY (employee_id) REFERENCES employees_table(employee_id) ON DELETE CASCADE,
        FOREIGN KEY (department_id) REFERENCES departments_table(department_id) ON DELETE SET NULL,
        FOREIGN KEY (assigned_by) REFERENCES lists_of_admins(admin_id) ON DELETE RESTRICT,
        FOREIGN KEY (admin_id) REFERENCES lists_of_admins(admin_id) ON DELETE SET NULL,
        INDEX idx_employee (employee_id),
        INDEX idx_department (department_id),
        INDEX idx_assigned_by (assigned_by),
        INDEX idx_admin (admin_id)
      )
    `)
    console.log("roles_table created successfully")

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
        username VARCHAR(240) NOT NULL,
        email VARCHAR(240) NOT NULL,
        role VARCHAR(240) NOT NULL,
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
        attachmentUrl VARCHAR(255),
        attachmentName VARCHAR(255),
        attachmentSize INT,
        attachmentType VARCHAR(100),
        FOREIGN KEY (file_id) REFERENCES files_table(id) ON DELETE CASCADE,
        INDEX idx_file_id (file_id)
      )
    `)
    console.log("records_table created successfully")

    // Create forwarded_records table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS forwarded_records (
        forward_id VARCHAR(36) PRIMARY KEY,
        record_id VARCHAR(36) NOT NULL,
        file_id VARCHAR(36) NOT NULL,
        forwarded_by INT NOT NULL,
        forwarded_to VARCHAR(255) NOT NULL,
        recipient_type VARCHAR(50) NOT NULL,
        notes TEXT,
        forward_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'Pending',
        FOREIGN KEY (record_id) REFERENCES records_table(id) ON DELETE CASCADE,
        FOREIGN KEY (file_id) REFERENCES files_table(id) ON DELETE CASCADE,
        FOREIGN KEY (forwarded_by) REFERENCES lists_of_admins(admin_id) ON DELETE RESTRICT,
        INDEX idx_record_id (record_id),
        INDEX idx_forwarded_by (forwarded_by)
      )
    `)
    console.log("forwarded_records table created successfully")

    // Create reviews_records table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews_records (
        review_id VARCHAR(36) PRIMARY KEY,
        record_id VARCHAR(36) NOT NULL,
        forward_id VARCHAR(36) NOT NULL,
        reviewed_by VARCHAR(255) NOT NULL,
        review_action VARCHAR(50) NOT NULL,
        review_note TEXT,
        department VARCHAR(255),
        department_person VARCHAR(255),
        review_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (record_id) REFERENCES records_table(id) ON DELETE CASCADE,
        FOREIGN KEY (forward_id) REFERENCES forwarded_records(forward_id) ON DELETE CASCADE,
        INDEX idx_record_id (record_id),
        INDEX idx_forward_id (forward_id)
      )
    `)
    console.log("reviews_records table created successfully")

    await pool.query(`
      CREATE TABLE IF NOT EXISTS departments_table (
        department_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        head_of_department VARCHAR(255),
        location VARCHAR(255),
        created_by INT NOT NULL,
        date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES lists_of_admins(admin_id) ON DELETE RESTRICT,
        INDEX idx_created_by (created_by)
      )
    `)
    console.log("departments_table created successfully")

    return { success: true, message: "Tables created successfully" }
  } catch (error) {
    console.error("Error creating tables:", error)
    return { success: false, error: error.message }
  }
}

