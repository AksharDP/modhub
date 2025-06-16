"use client";
import Link from "next/link";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center bg-gray-900 text-white pt-16 w-full flex-1 min-h-0 text-center">
            <h1 className="text-6xl font-bold text-purple-500 mb-4">404</h1>
            <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
            <p className="text-gray-400 mb-8">
                Sorry, the page you are looking for does not exist.
            </p>
            <Link
                href="/"
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded transition-colors"
            >
                Go Home
            </Link>
        </div>
    );
}
