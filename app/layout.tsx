import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TRPCProvider } from "./components/TRPCProvider";
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
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <NavBar user={user} />
                <TRPCProvider>{children}</TRPCProvider>
            </body>
        </html>
    );
}
