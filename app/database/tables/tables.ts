import { Pool } from 'pg';
import { getClient } from '..'; // Ensure this points to your correct DB client setup
import bcrypt from 'bcrypt';

// Helper function to generate hashed password
async function generatePassword(password: string) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
}

// Function to check if a specific table exists
async function tableExists(client: Pool, tableName: string) {
    const queryRes = await client.query(`
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = $1
        )
    `, [tableName]);

    return queryRes.rows[0].exists;
}

// Function to handle the superAdmin table creation and insertion
export async function superAdmin() {
    try {
        const client = await getClient();

        // Check if the superAdmin table exists
        const superAdminExists = await tableExists(client, 'superAdmin');
        if (superAdminExists) {
            console.log("superAdmin table already exists, skipping data insertion.");
            return;
        }

        // Create the superAdmin table
        await client.query(`
            CREATE TABLE IF NOT EXISTS superAdmin (
                username VARCHAR(240) NOT NULL,
                password VARCHAR(240) NOT NULL
            )
        `);

        console.log("superAdmin table created successfully.");

        // Generate a hashed password for the super admin
        const hashedPassword = await generatePassword('admin');

        // Insert the super admin into the table
        await client.query(`
            INSERT INTO superAdmin (username, password)
            VALUES ('galaxy', $1)
        `, [hashedPassword]);

        console.log("Super Admin inserted successfully.");
    } catch (error) {
        console.error("Error creating superAdmin table or inserting data:", error);
    }
}

// Function to handle the admins table creation and insertion
export async function adminsTable() {
    try {
        const client = await getClient();

        // Check if the lists_of_admins table exists
        const adminsTableExists = await tableExists(client, 'lists_of_admins');
        if (adminsTableExists) {
            console.log("lists_of_admins table already exists, skipping data insertion.");
            return;
        }

        // Create the lists_of_admins table
        await client.query(`
            CREATE TABLE IF NOT EXISTS lists_of_admins (
                admin_id SERIAL PRIMARY KEY,
                name VARCHAR(240) NOT NULL,
                role VARCHAR(240) NOT NULL,
                password VARCHAR(240) NOT NULL,
                date_assigned TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log("lists_of_admins table created successfully.");

        // Admins data
        const admins = [
            { name: 'admin1', role: 'Admin' },
            { name: 'admin2', role: 'Admin' },
            { name: 'admin3', role: 'Admin' }
        ];

        // Insert the admins into the table
        for (let admin of admins) {
            // Generate a random password for each admin and hash it
            const randomPassword = `password-${admin.name}`;
            const hashedPassword = await generatePassword(randomPassword);

            await client.query(`
                INSERT INTO lists_of_admins (name, role, password)
                VALUES ($1, $2, $3)
            `, [admin.name, admin.role, hashedPassword]);

            console.log(`${admin.name} inserted successfully.`);
        }
    } catch (error) {
        console.error("Error creating lists_of_admins table or inserting data:", error);
    }
}

export async function recordsTable() {
    try {
        const client = await getClient();

        const recordsTableExists = await tableExists(client, 'records');
        if (recordsTableExists) {
            console.log("records table already exists, skipping creation.");
            return;
        }

        await client.query(`
            CREATE TABLE IF NOT EXISTS records (
                id SERIAL PRIMARY KEY,
                name VARCHAR(240) NOT NULL,
                date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status VARCHAR(50) NOT NULL,
                source VARCHAR(100) NOT NULL,
                description TEXT,
                sender_name VARCHAR(240) NOT NULL,
                receiver_name VARCHAR(240) NOT NULL,
                sender_signature VARCHAR(240) NOT NULL,
                receiver_signature VARCHAR(240) NOT NULL,
                date_sent TIMESTAMP,
                date_received TIMESTAMP,
                organization_ref_number VARCHAR(100) NOT NULL,
                admin_id INT REFERENCES lists_of_admins(admin_id) ON DELETE CASCADE,
                file BYTEA
            )
        `).then(() => console.log("records table created successfully."));
    } catch (error) {
        console.error("Error creating records table:", error);
    }
}
