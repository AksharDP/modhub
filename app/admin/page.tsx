import { redirect } from "next/navigation";
import { getCurrentSession } from "../lib/auth";

export default async function AdminPage() {
    const { user } = await getCurrentSession();

    if (!user || user.role !== "admin") {
        redirect("/login");
    }

    // This page should not be reached due to Next.js config redirect
    // But keep this as a fallback
    redirect("/admin/overview");
}

// Prevent this page from being cached
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Add metadata
export const metadata = {
    title: "Admin - ModHub",
    robots: "noindex, nofollow"
};
