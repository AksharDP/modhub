import { redirect } from "next/navigation";
import { getCurrentSession } from "../lib/auth";

export default async function AdminPage() {
    const { user } = await getCurrentSession();

    if (!user || user.role !== "admin") {
        redirect("/login");
    }

    // Redirect to overview by default
    redirect("/admin/overview");
}
