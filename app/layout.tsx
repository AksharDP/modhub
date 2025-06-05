import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TRPCProvider } from "./components/TRPCProvider";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
    display: "swap", // Optimize font loading
    preload: true,
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
    display: "swap", // Optimize font loading
    preload: false, // Only preload primary font
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

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <TRPCProvider>
                    {children}
                </TRPCProvider>
            </body>
        </html>
    );
}
