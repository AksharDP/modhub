import { redirect } from "next/navigation";
import { getCurrentSession } from "../../lib/auth";
import ModManagement from "../components/ModManagement";
import AdminNavigation from "../components/AdminNavigation";

export default async function AdminModsPage() {
    const { user } = await getCurrentSession();

    if (!user || user.role !== "admin") {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
                <AdminNavigation />
                <ModManagement />
            </div>
        </div>
    );
}
