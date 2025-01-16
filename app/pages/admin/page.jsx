import { FileSystemProvider } from "@/components/FileSystemContext"; // Adjust the import path as necessary
import AdminDashboard from "@/components/Admin-Dashboard";

export default function Page() {
    return (
        <FileSystemProvider>
            <main className="min-h-screen bg-background">
                <AdminDashboard />
            </main>
        </FileSystemProvider>
    );
}