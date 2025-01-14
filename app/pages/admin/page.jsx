import { FileSystemProvider } from "@/components/FileSystemContext"; // Adjust the import path as necessary
import AdminDashboard from "@/components/Admin-Dashboard";

export default function Page() {
    return (
        <FileSystemProvider>
            <AdminDashboard />
        </FileSystemProvider>
    );
}