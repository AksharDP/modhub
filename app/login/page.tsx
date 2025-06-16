"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();            if (response.ok) {
                // Update client-side context with user data
                login(data.user);
                router.push("/");
            } else {
                setError(data.error || "Login failed");
            }} catch {
            setError("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };    return (
        <div className="h-screen bg-gray-900 flex items-center justify-center py-4 px-4 sm:px-6 lg:px-8 overflow-hidden">
            <div className="max-w-md w-full space-y-6">
                <div>
                    <h2 className="mt-2 text-center text-3xl font-extrabold text-white">
                        Sign in to ModHub
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-400">
                        Welcome back! Please enter your credentials.
                    </p>
                </div>
                <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="username" className="sr-only">
                                Username
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                autoComplete="username"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white bg-gray-800 rounded-t-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white bg-gray-800 rounded-b-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                                "Sign in"
                            )}
                        </button>
                    </div>

                    <div className="flex flex-col space-y-2 text-center">
                        <Link
                            href="/reset-password"
                            className="text-purple-400 hover:text-purple-300 text-sm"
                        >
                            Forgot your password?
                        </Link>
                        <div className="text-gray-400 text-sm">
                            Don&apos;t have an account?{" "}
                            <Link
                                href="/signup"
                                className="text-purple-400 hover:text-purple-300"
                            >
                                Sign up
                            </Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
