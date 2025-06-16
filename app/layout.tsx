import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "./components/nav";
import { getCurrentSession } from "./lib/auth";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
    display: "swap",
    preload: true,
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
    display: "swap",
    preload: false,
});

export const metadata: Metadata = {
    title: "ModHub - Your Gaming Mod Hub",
    description: "Discover, download, and share game modifications",
    keywords: "mods, gaming, modifications, download, community",
    authors: [{ name: "ModHub Team" }],
    robots: "index, follow",
    openGraph: {
        title: "ModHub - Your Gaming Mod Hub",
        description: "Discover, download, and share game modifications",
        type: "website",
        locale: "en_US",
    },
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { user } = await getCurrentSession();

    return (
        <html lang="en">
            <head>
                <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='%238a2be2' d='M50,0c-4.4,0-8,3.6-8,8v12c-1.8,0.3-3.4,0.9-5,1.7l-9.5-9.5c-3.1-3.1-8.2-3.1-11.3,0l-8.5,8.5c-3.1,3.1-3.1,8.2,0,11.3l9.5,9.5c-0.8,1.6-1.4,3.2-1.7,5H8c-4.4,0-8,3.6-8,8v16c0,4.4,3.6,8,8,8h12c0.3,1.8,0.9,3.4,1.7,5l-9.5,9.5c-3.1,3.1-3.1,8.2,0,11.3l8.5,8.5c3.1,3.1,8.2,3.1,11.3,0l9.5-9.5c1.6,0.8,3.2,1.4,5,1.7v12c0,4.4,3.6,8,8,8h16c4.4,0,8-3.6,8-8v-12c1.8-0.3,3.4-0.9,5-1.7l9.5,9.5c3.1,3.1,8.2,3.1,11.3,0l8.5-8.5c3.1-3.1,3.1-8.2,0-11.3l-9.5-9.5c0.8-1.6,1.4-3.2,1.7-5h12c4.4,0,8-3.6,8-8V42c0-4.4-3.6-8-8-8h-12c-0.3-1.8-0.9-3.4-1.7-5l9.5-9.5c3.1-3.1,3.1-8.2,0-11.3l-8.5-8.5c-3.1-3.1-8.2-3.1-11.3,0l-9.5,9.5c-1.6-0.8-3.2-1.4-5-1.7V8c0-4.4-3.6-8-8-8H50zM50,32c9.9,0,18,8.1,18,18s-8.1,18-18,18s-18-8.1-18-18S40.1,32,50,32z'/%3E%3Ccircle cx='50' cy='50' r='12' fill='%236a0dad'/%3E%3C/svg%3E" />
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <NavBar user={user} />
                {children}
            </body>
        </html>
    );
}
