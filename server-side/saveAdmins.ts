"use server";
import pool from "@/app/database/connection";

export async function saveAdmins(data: FormData) { 
    try {
        // Convert FormData to an object for better logging
        const formDataObject: { [key: string]: string } = {};
        
        data.forEach((value, key) => {
            formDataObject[key] = value.toString();
        });

        console.log("📝 Received FormData:", formDataObject);

        // Example: Extracting specific values
        const name = data.get("name") as string;
        const email = data.get("email") as string;

        console.log("✅ Name:", name);
        console.log("✅ Email:", email);

    } catch (error) {
        console.error("❌ Error processing FormData:", error);
    }
}
