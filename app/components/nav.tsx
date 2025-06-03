import Link from "next/link";
import Image from "next/image";

export default function NavBar() {
    return (
        <>
            <nav className="flex items-center pl-12 space-x-4 p-4 bg-gray-800 text-white">
                <Link className="hover:text-purple-500" href="/">
                    Home
                </Link>
                <Link className="hover:text-purple-500" href="/mods">
                    Mods
                </Link>
                <Link className="hover:text-purple-500" href="/games">
                    Games
                </Link>
                <Link className="hover:text-purple-500" href="/collections">
                    Collections
                </Link>
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
                        {/* Placeholder for Upload Icon */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 inline-block mr-1" // Style as needed
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            {/* Basic cloud upload icon path */}
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M12 12v9m-4-4l4-4 4 4"
                            />
                        </svg>
                        Upload
                    </Link>
                    <Link href="/profile">
                        <Image
                            src="https://placehold.co/32x32/8A2BE2/FFFFFF/png"
                            alt="User Avatar"
                            width={32}
                            height={32}
                            className="rounded-[var(--border-radius-custom)] border border-purple-500"
                        />
                    </Link>
                </div>
            </nav>
        </>
    );
}
