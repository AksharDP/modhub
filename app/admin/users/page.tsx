import { Suspense } from "react";
import AdminNavigation from "../components/AdminNavigation";
import { redirect } from "next/navigation";
import { getCurrentSession } from "../../lib/auth";
import UserManagement from "../components/UserManagement";
import UserCount from "../components/UserCount";

export default async function AdminUsersPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const { user } = await getCurrentSession();
    if (!user || user.role !== "admin") {
        redirect("/login");
    }

    // Await searchParams for dynamic API compliance
    const params = await searchParams;
    const search = typeof params.search === "string" ? params.search : "";
    const role = typeof params.role === "string" ? params.role : "";
    const status = typeof params.status === "string" ? params.status : "";
    const joinDate = typeof params.joinDate === "string" ? params.joinDate : "";
    const limit = typeof params.limit === "string" ? parseInt(params.limit) || 20 : 20;
    const offset = typeof params.offset === "string" ? parseInt(params.offset) || 0 : 0;

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
                <AdminNavigation />
                <Suspense fallback={<div>Loading users...</div>}>
                    <UserCountWrapper
                        search={search}
                        role={role}
                        status={status}
                        joinDate={joinDate}
                        limit={limit}
                        offset={offset}
                    />
                </Suspense>
            </div>
        </div>
    );
}

async function UserCountWrapper({
    search,
    role,
    status,
    joinDate,
    limit,
    offset,
}: {
    search: string;
    role: string;
    status: string;
    joinDate: string;
    limit: number;
    offset: number;
}) {
    const total = await UserCount({ search, role, status, joinDate });
    
    const pagination = {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
    };

    return (
        <UserManagement
            pagination={pagination}
            search={search}
            role={role}
            status={status}
            joinDate={joinDate}
        />
    );
}
