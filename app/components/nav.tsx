"use client";

import Link from "next/link";
import Image from "next/image";
import React, { memo } from "react";
import { User } from "../db/schema";

const NavBar = memo(function NavBar({ user }: { user: User | null }) {
    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "/";
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    return (
        <nav className="flex items-center pl-12 space-x-4 p-4 bg-gray-800 text-white">
            <Link className="hover:text-purple-500" href="/">
                Home
            </Link>
            <Link className="hover:text-purple-500" href="/mods">
                Mods
            </Link>
            <Link className="hover:text-purple-500" href="/games">
                Games
            </Link>{" "}
            <Link className="hover:text-purple-500" href="/collections">
                Collections
            </Link>
            {user?.role === "admin" && (
                <Link
                    className="text-red-600 hover:text-purple-500 font-semibold"
                    href="/admin"
                >
                    Admin Panel
                </Link>
            )}
            <div className="flex-grow"></div>
            <div className="flex items-center space-x-4">
                <Link
                    href="/search"
                    className="flex items-center py-2 px-3 rounded-[var(--border-radius-custom)] bg-gray-700 text-white hover:bg-gray-600 w-40"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                    <span>Search</span>
                </Link>
                <Link className="hover:text-purple-500" href="/upload">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 inline-block mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M12 12v9m-4-4l4-4 4 4"
                        />
                    </svg>
                    Upload
                </Link>
                {user ? (
                    <div className="flex items-center space-x-3">
                        <Link href="/profile">
                            <Image
                                src={
                                    user.profilePicture ||
                                    "https://placehold.co/32x32/8A2BE2/FFFFFF/png"
                                }
                                alt="User Avatar"
                                width={32}
                                height={32}
                                className="rounded-[var(--border-radius-custom)] border border-purple-500"
                            />
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="text-gray-300 hover:text-red-400 text-sm"
                        >
                            Logout
                        </button>
                    </div>
                ) : (
                    <Link
                        href="/login"
                        className="flex items-center hover:text-purple-500"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                        </svg>
                    </Link>
                )}
            </div>
        </nav>
    );
});

export default NavBar;
