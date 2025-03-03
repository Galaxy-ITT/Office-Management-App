import adminsTable from "./tables.js";  // ✅ Ensure `.js` is included

export async function initTables() {
    console.log("Initializing tables...");
    await adminsTable();
    console.log("Tables initialized successfully.");
}

initTables();
