import adminsTable from "./tables.js";  // ✅ Ensure `.js` is included
import { table_files } from "./tables.js";

export async function initTables() {
    console.log("Initializing tables...");
    await adminsTable();
    await table_files();
    console.log("Tables initialized successfully.");
}

initTables();
