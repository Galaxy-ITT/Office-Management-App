# Database Documentation

## Overview

This document provides an overview of the database structure and setup for our application. The database consists of several tables managed through TypeScript functions.

## Database Tables

### 1. super_admin

| Column   | Type         | Description                    |
|----------|--------------|--------------------------------|
| username | VARCHAR(240) | Username of the super admin    |
| password | VARCHAR(240) | Hashed password of super admin |

### 2. lists_of_admins

| Column        | Type         | Description                     |
|---------------|--------------|----------------------------------|
| admin_id      | SERIAL       | Primary key                      |
| name          | VARCHAR(240) | Name of the admin                |
| role          | VARCHAR(240) | Role of the admin                |
| password      | VARCHAR(240) | Hashed password of the admin     |
| date_assigned | TIMESTAMP    | Date when the admin was assigned |
| username      | VARCHAR(240) | Unique username of the admin     |
| remember_me   | BOOLEAN      | Remember me flag                 |

### 3. records

| Column                  | Type         | Description                           |
|-------------------------|--------------|---------------------------------------|
| id                      | SERIAL       | Primary key                           |
| name                    | VARCHAR(240) | Name of the record                    |
| date_created            | TIMESTAMP    | Date when the record was created      |
| status                  | VARCHAR(50)  | Status of the record                  |
| source                  | VARCHAR(100) | Source of the record                  |
| sender_name             | VARCHAR(240) | Name of the sender                    |
| date_sent               | TIMESTAMP    | Date when the record was sent         |
| date_received           | TIMESTAMP    | Date when the record was received     |
| organization_ref_number | VARCHAR(100) | Organization reference number         |
| file                    | BYTEA        | Binary data of the associated file    |

## Database Setup

To set up the database:

1. Ensure you have PostgreSQL installed and running on your system.

2. Edit the `index.ts` file in your project root:

   ```typescript
   // index.ts
   import { Pool } from 'pg';

   const pool = new Pool({
     user: 'your_username',
     host: 'your_host',
     database: 'your_database',
     password: 'your_password',
     port: 5432,
   });

   export const getClient = () => pool.connect();

   