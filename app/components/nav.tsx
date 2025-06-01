import Link from "next/link";
import Image from "next/image";

export default function NavBar() {
    return (
        <>
            <nav className="flex items-center pl-12 space-x-4 p-4 bg-gray-800 text-white">
                {/* Fixed Home link with border on inner span */}
                <Link href="/">
                    <span className="hover:text-purple-500 text-sm border-b-2 border-purple-500 pb-1">
                        Home
                    </span>
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
                {/* Create a search bar and avatar log to the right */}
                <div className="flex-grow"></div>
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <Link href="/profile">
                        <Image
                            src="https://placehold.co/32x32/8A2BE2/FFFFFF/png"
                            alt="User Avatar"
                            width={32}
                            height={32}
                            className="rounded-full border border-purple-500"
                        />
                    </Link>
                </div>
                <Link className="hover:text-purple-500" href="/login">
                    Login
                </Link>
                <Link className="hover:text-purple-500" href="/register">
                    Register
                </Link>
            </nav>
        </>
    );
}
