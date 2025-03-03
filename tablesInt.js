import { adminsTable } from "./app/database/tables/tables";

export async function initTables() {
    console.log("Initializing tables...");
    await adminsTable();
    console.log("Tables initialized successfully.");
}

initTables();