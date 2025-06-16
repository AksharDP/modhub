"use client";
import Image from "next/image";
import { useState } from "react";
import AuthorModActions from "./ModEditActions";
import UserCollectionsWrapper from "@/app/components/UserCollectionsWrapper";
import type { Mod, User } from "@/app/db/schema";

// Add suspendedUntil to the user type if available
interface AuthorProfileClientProps {
  currentUser: User | null;
  profileUser: User & { suspendedUntil: string | null };
  userMods: Mod[];
}

export default function AuthorProfileClient({ currentUser, profileUser, userMods }: AuthorProfileClientProps) {
  const isAdmin = currentUser?.role === "admin";
  const isSelf = currentUser?.id === profileUser.id;
  const [banPending, setBanPending] = useState(false);
  const [suspendPending, setSuspendPending] = useState(false);
  const [unbanPending, setUnbanPending] = useState(false);
  const [unsuspendPending, setUnsuspendPending] = useState(false);

  const handleBanUser = async () => {
    if (confirm("Are you sure you want to permanently ban this user?")) {
      setBanPending(true);
      await fetch(`/api/admin/users/${profileUser.id}/ban`, { method: "POST" });
      setBanPending(false);
      window.location.reload();
    }
  };
  const handleSuspendUser = async () => {
    const duration = prompt("Enter suspension duration in days (leave blank for indefinite):");
    if (duration !== null) {
      setSuspendPending(true);
      await fetch(`/api/admin/users/${profileUser.id}/suspend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ duration: duration ? parseInt(duration) : undefined }),
      });
      setSuspendPending(false);
      window.location.reload();
    }
  };
  const handleUnbanUser = async () => {
    setUnbanPending(true);
    await fetch(`/api/admin/users/${profileUser.id}/role`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "user" }),
    });
    setUnbanPending(false);
    window.location.reload();
  };
  const handleUnsuspendUser = async () => {
    setUnsuspendPending(true);
    await fetch(`/api/admin/users/${profileUser.id}/role`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "user" }),
    });
    setUnsuspendPending(false);
    window.location.reload();
  };

  // Show user status
  let statusLabel = null;
  if (profileUser.role === "banned") statusLabel = <span className="ml-2 px-2 py-1 rounded text-xs font-bold bg-red-800 text-red-200">Banned</span>;
  if (profileUser.role === "suspended") {
    let untilText = "";
    if (profileUser.suspendedUntil) {
      const until = new Date(profileUser.suspendedUntil);
      untilText = ` (until ${until.toLocaleString()})`;
    }
    statusLabel = <span className="ml-2 px-2 py-1 rounded text-xs font-bold bg-yellow-800 text-yellow-200">Suspended{untilText}</span>;
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-6 mb-8">
          <Image
            src={profileUser.profilePicture || "https://placehold.co/128x128/7C3AED/FFFFFF/png?text=" + profileUser.username.charAt(0).toUpperCase()}
            alt={`${profileUser.username}'s profile picture`}
            width={96}
            height={96}
            className="rounded-full border-4 border-purple-500 object-cover"
          />
          <div>
            <h1 className="text-3xl font-bold text-purple-400 flex items-center">{profileUser.username} {statusLabel}</h1>
            <p className="text-gray-400">{profileUser.bio}</p>
            <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${profileUser.role === "admin" ? "bg-red-600 text-red-100" : profileUser.role === "supporter" ? "bg-yellow-600 text-yellow-100" : profileUser.role === "banned" ? "bg-red-800 text-red-200" : profileUser.role === "suspended" ? "bg-yellow-800 text-yellow-200" : "bg-gray-600 text-gray-100"}`}>{profileUser.role.charAt(0).toUpperCase() + profileUser.role.slice(1)}</span>
          </div>
        </div>
        {isAdmin && !isSelf && (
          <div className="flex gap-4 mb-8">
            {profileUser.role === "banned" ? (
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded" onClick={handleUnbanUser} disabled={unbanPending}>Unban User</button>
            ) : profileUser.role === "suspended" ? (
              <>
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded" onClick={handleUnsuspendUser} disabled={unsuspendPending}>Unsuspend User</button>
                <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded" onClick={handleBanUser} disabled={banPending}>Ban User</button>
                <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded" onClick={handleSuspendUser} disabled={suspendPending}>Update Suspension</button>
              </>
            ) : (
              <>
                <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded" onClick={handleBanUser} disabled={banPending}>Ban User</button>
                <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded" onClick={handleSuspendUser} disabled={suspendPending}>Suspend User</button>
              </>
            )}
          </div>
        )}        <h2 className="text-2xl font-bold mb-4 text-purple-300">Mods by {profileUser.username}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {userMods.map((mod) => (
            <div key={mod.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-4 mb-2">
                <Image src={mod.imageUrl || "/placeholder1.svg"} alt={mod.title} width={64} height={64} className="rounded object-cover" />
                <div>
                  <h3 className="text-lg font-semibold text-white">{mod.title}</h3>
                  <p className="text-sm text-gray-400">{mod.description}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-2 items-center">
                <span className={`px-2 py-1 rounded text-xs font-medium ${mod.isActive ? "bg-green-600 text-green-100" : "bg-gray-600 text-gray-100"}`}>{mod.isActive ? "Active" : "Inactive"}</span>
                {isAdmin && !isSelf && (
                  <AuthorModActions
                    mod={mod}
                    onModUpdated={() => {}}
                    onModDeleted={() => {}}
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Collections Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4 text-purple-300">{profileUser.username}&apos;s Collections</h2>
          <UserCollectionsWrapper userId={profileUser.id} isOwnProfile={isSelf} />
        </div>
      </div>
    </div>
  );
}
