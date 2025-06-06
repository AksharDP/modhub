import { redirect } from "next/navigation";
import { getCurrentSession } from "../lib/auth";
import AdminDashboard from "./components/AdminDashboard";

export default async function AdminPage() {
    const { user } = await getCurrentSession();

    if (!user || user.role !== "admin") {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
                <AdminDashboard />
            </div>
        </div>
    );
}
