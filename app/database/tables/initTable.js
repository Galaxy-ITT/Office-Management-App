import adminsTable from "./tables.js";  // ✅ Ensure `.js` is included
import { table_files } from "./tables.js";
import { createAllTables } from "./tables.js";

export async function initTables() {
    console.log("Initializing tables...");
    // await adminsTable();
    // await table_files();
    await createAllTables();
    console.log("Tables initialized successfully.");
}

initTables();
