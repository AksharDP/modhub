"use client";

import Link from "next/link";
import Image from "next/image";
import { memo, useMemo } from "react";

export interface CardProps {
    modId: number;
    gameName: string;
    title: string;
    description: string;
    imageUrl: string;
    author: string;
    authorPFP: string;
    category: string;
    likes: number;
    downloads: number;
    size: string;
    uploaded: string | number | Date;
    lastUpdated: string | number | Date;
}

const Card = memo(function Card({
    modId,
    gameName,
    title,
    description,
    imageUrl,
    author,
    authorPFP,
    category,
    likes,
    downloads,
    size,
    uploaded,
    lastUpdated,
}: CardProps) {
    // Memoize expensive calculations
    const formattedDates = useMemo(() => {
        const uploadedWeeksAgo = Math.floor(
            (new Date().getTime() - new Date(uploaded).getTime()) / (1000 * 60 * 60 * 24 * 7)
        );
        const updatedWeeksAgo = Math.floor(
            (new Date().getTime() - new Date(lastUpdated).getTime()) / (1000 * 60 * 60 * 24 * 7)
        );
        
        return {
            uploadedWeeksAgo,
            updatedWeeksAgo,
            uploadedFormatted: new Date(uploaded).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
            }),
            updatedFormatted: new Date(lastUpdated).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
            }),
        };
    }, [uploaded, lastUpdated]);

    const modUrl = `/${gameName}/mods/${modId}`;
    const authorUrl = `/author/${encodeURIComponent(author)}/mods`;

    return (
        <div className="bg-gray-800 text-white rounded-[var(--border-radius-custom)] shadow-lg m-2 w-80 h-[400px] flex flex-col overflow-hidden hover:shadow-xl transition-shadow duration-200">
            <Link href={modUrl} className="block h-44 w-full relative group">
                <Image
                    src={imageUrl}
                    alt={title}
                    fill
                    className="object-cover w-full h-full"
                    sizes="320px"
                    priority={false}
                />
                <span className="absolute top-2 left-2 bg-purple-700 text-xs px-2 py-1 rounded font-semibold shadow">
                    {category}
                </span>
            </Link>
            <div className="flex-1 flex flex-col justify-between p-4">
                <div>
                    <Link href={modUrl} className="text-lg font-bold text-purple-300 hover:underline line-clamp-1">
                        {title}
                    </Link>
                    <p className="text-gray-300 text-sm mt-1 line-clamp-2 min-h-[40px]">{description}</p>
                </div>
                <div className="flex items-center mt-3 mb-2">
                    <Link href={authorUrl} className="flex items-center group">
                        <Image
                            src={authorPFP}
                            alt={author}
                            width={24}
                            height={24}
                            className="rounded-full mr-2 border border-purple-400"
                        />
                        <span className="text-xs text-gray-200 group-hover:underline">{author}</span>
                    </Link>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
                    <span title="Likes" className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-pink-400" fill="currentColor" viewBox="0 0 20 20"><path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" /></svg>
                        {likes}
                    </span>
                    <span title="Downloads" className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path d="M3 14a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm7-9a1 1 0 00-1 1v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6a1 1 0 00-1-1z" /></svg>
                        {downloads}
                    </span>
                    <span title="Size" className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h12v10H4V5z" /></svg>
                        {size}
                    </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                    <span title="Uploaded">Uploaded {formattedDates.uploadedWeeksAgo === 0 ? 'this week' : `${formattedDates.uploadedWeeksAgo}w ago`}</span>
                    <span title="Last Updated">Updated {formattedDates.updatedWeeksAgo === 0 ? 'this week' : `${formattedDates.updatedWeeksAgo}w ago`}</span>
                </div>
            </div>
        </div>
    );
});

export default Card;
