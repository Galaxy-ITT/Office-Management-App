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
        email VARCHAR(255) NOT NULL UNIQUE,
        phone VARCHAR(20),
        position VARCHAR(100) NOT NULL,
        department_id INT,
        hire_date DATE,
        status VARCHAR(20) DEFAULT 'active',
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (department_id) REFERENCES departments_table(department_id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES lists_of_admins(admin_id) ON DELETE RESTRICT,
        INDEX idx_department_id (department_id)
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

  
    // Create proposals_table - for employee proposals
    await pool.query(`
      CREATE TABLE IF NOT EXISTS proposals_table (
        proposal_id VARCHAR(36) PRIMARY KEY,
        employee_id VARCHAR(36) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) DEFAULT 'pending',
        reviewed_by INT,
        review_date TIMESTAMP NULL,
        review_note TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees_table(employee_id) ON DELETE CASCADE,
        FOREIGN KEY (reviewed_by) REFERENCES lists_of_admins(admin_id) ON DELETE SET NULL,
        INDEX idx_employee_id (employee_id),
        INDEX idx_status (status)
      )
    `)
    console.log("proposals_table created successfully")

    // Create tasks_table - for employee tasks and assignments
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks_table (
        task_id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        employee_id VARCHAR(36) NOT NULL,
        assigned_by INT NOT NULL,
        due_date DATE NOT NULL,
        priority VARCHAR(20) DEFAULT 'medium',
        status VARCHAR(20) DEFAULT 'pending',
        completion_date TIMESTAMP NULL,
        completion_note TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees_table(employee_id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_by) REFERENCES lists_of_admins(admin_id) ON DELETE CASCADE,
        INDEX idx_employee_id (employee_id),
        INDEX idx_assigned_by (assigned_by),
        INDEX idx_status (status)
      )
    `)
    console.log("tasks_table created successfully")

    // Create employee_skills_table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS employee_skills_table (
        skill_id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id VARCHAR(36) NOT NULL,
        skill_name VARCHAR(100) NOT NULL,
        proficiency_level ENUM('Beginner', 'Intermediate', 'Advanced', 'Expert') NOT NULL,
        years_experience DECIMAL(4,1),
        date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees_table(employee_id) ON DELETE CASCADE,
        UNIQUE KEY unique_employee_skill (employee_id, skill_name),
        INDEX idx_employee_id (employee_id)
      )
    `)
    console.log("employee_skills_table created successfully")

    // Create professional_development_table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS professional_development_table (
        course_id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id VARCHAR(36) NOT NULL,
        course_name VARCHAR(255) NOT NULL,
        provider VARCHAR(255),
        certification_obtained BOOLEAN DEFAULT FALSE,
        start_date DATE,
        completion_date DATE,
        status ENUM('In Progress', 'Completed', 'Planned') NOT NULL DEFAULT 'In Progress',
        notes TEXT,
        date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees_table(employee_id) ON DELETE CASCADE,
        INDEX idx_employee_id (employee_id)
      )
    `)
    console.log("professional_development_table created successfully")

    // Create employee_documents_table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS employee_documents_table (
        document_id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id VARCHAR(36) NOT NULL,
        document_name VARCHAR(255) NOT NULL,
        document_type VARCHAR(100) NOT NULL,
        file_url VARCHAR(512) NOT NULL,
        description TEXT,
        upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees_table(employee_id) ON DELETE CASCADE,
        INDEX idx_employee_id (employee_id)
      )
    `)
    console.log("employee_documents_table created successfully")

    // Create leave_applications_table (with boss_comment and hod_comment)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS leave_applications_table (
        leave_id VARCHAR(36) PRIMARY KEY,
        employee_id VARCHAR(36) NOT NULL,
        leave_type VARCHAR(50) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        reason TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        approved_by INT,
        boss_comment TEXT,
        hod_comment TEXT,
        evidence_name VARCHAR(255),
        evidence_url VARCHAR(512),
        evidence_file LONGBLOB,
        application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees_table(employee_id) ON DELETE CASCADE,
        FOREIGN KEY (approved_by) REFERENCES lists_of_admins(admin_id) ON DELETE SET NULL,
        INDEX idx_employee_id (employee_id)
      )
    `)
    console.log("leave_applications_table created successfully")

    // Create approved_leaves_table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS approved_leaves_table (
        approval_id VARCHAR(36) PRIMARY KEY,
        leave_id VARCHAR(36) NOT NULL,
        employee_id VARCHAR(36) NOT NULL,
        approved_by INT NOT NULL,
        approval_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        comment TEXT,
        FOREIGN KEY (leave_id) REFERENCES leave_applications_table(leave_id) ON DELETE CASCADE,
        FOREIGN KEY (employee_id) REFERENCES employees_table(employee_id) ON DELETE CASCADE,
        FOREIGN KEY (approved_by) REFERENCES lists_of_admins(admin_id) ON DELETE RESTRICT,
        INDEX idx_leave_id (leave_id),
        INDEX idx_employee_id (employee_id)
      )
    `)
    console.log("approved_leaves_table created successfully")

    // Create rejected_leaves_table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rejected_leaves_table (
        rejection_id VARCHAR(36) PRIMARY KEY,
        leave_id VARCHAR(36) NOT NULL,
        employee_id VARCHAR(36) NOT NULL,
        rejected_by INT NOT NULL,
        rejection_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reason TEXT,
        FOREIGN KEY (leave_id) REFERENCES leave_applications_table(leave_id) ON DELETE CASCADE,
        FOREIGN KEY (employee_id) REFERENCES employees_table(employee_id) ON DELETE CASCADE,
        FOREIGN KEY (rejected_by) REFERENCES lists_of_admins(admin_id) ON DELETE RESTRICT,
        INDEX idx_leave_id (leave_id),
        INDEX idx_employee_id (employee_id)
      )
    `)
    console.log("rejected_leaves_table created successfully")

    return { success: true, message: "Tables created successfully" }
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
        head_of_department_id INT,
        location VARCHAR(255),
        created_by INT NOT NULL,
        date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES lists_of_admins(admin_id) ON DELETE RESTRICT,
        FOREIGN KEY (head_of_department_id) REFERENCES lists_of_admins(admin_id) ON DELETE SET NULL,
        INDEX idx_created_by (created_by),
        INDEX idx_head_of_department (head_of_department_id)
      )
    `)
    console.log("departments_table created successfully")

    return { success: true, message: "Tables created successfully" }
  } catch (error) {
    console.error("Error creating tables:", error)
    return { success: false, error: error.message }
  }
}

