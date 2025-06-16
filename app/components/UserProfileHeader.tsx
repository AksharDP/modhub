"use client";

import Image from "next/image";

interface UserProfileHeaderProps {
    user: {
        username: string;
        profilePicture?: string | null;
        bio?: string | null;
        createdAt?: string | Date;
        role: string;
    };
    createdAtFormatted: string;
}

export default function UserProfileHeader({
    user,
    createdAtFormatted,
}: UserProfileHeaderProps) {
    return (
        <div className="bg-gray-800 rounded-lg shadow-xl p-6">
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="relative">
                    <Image
                        src={
                            user.profilePicture ||
                            "https://placehold.co/128x128/7C3AED/FFFFFF/png?text=" +
                                user.username.charAt(0).toUpperCase()
                        }
                        alt={`${user.username}'s profile picture`}
                        width={128}
                        height={128}
                        className="rounded-full border-4 border-purple-500 object-cover"
                        unoptimized={
                            !!user.profilePicture &&
                            user.profilePicture.startsWith("http")
                        }
                    />
                </div>
                <div className="text-center sm:text-left flex-grow">
                    <h1 className="text-3xl sm:text-4xl font-bold text-purple-400 mb-2">
                        {user.username}
                    </h1>
                    {user.bio && (
                        <p className="text-gray-300 mb-2">{user.bio}</p>
                    )}
                    <p className="text-sm text-gray-500">
                        Member since {createdAtFormatted}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                        <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                user.role === "admin"
                                    ? "bg-red-600 text-red-100"
                                    : user.role === "supporter"
                                    ? "bg-yellow-600 text-yellow-100"
                                    : "bg-gray-600 text-gray-100"
                            }`}
                        >
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
