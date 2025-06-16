"use client";

import Link from "next/link";
import Image from "next/image";
import { memo, useMemo, useState, useEffect, useRef, Suspense } from "react";
import { CardProps } from "@/app/types/common";
import dynamic from "next/dynamic";
import CollectionsModalLoading from "./CollectionsModalLoading";

const AddToCollectionModal = dynamic(() => import("./AddToCollectionModal"), {
    ssr: false,
    loading: () => <CollectionsModalLoading />
});

const Card = memo(function Card({
    modId,
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
    const [showDropdown, setShowDropdown] = useState(false);
    const [showCollectionModal, setShowCollectionModal] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        if (showDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [showDropdown]);

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

    // Use slug and gameName if needed for future features or links
    // For now, modUrl only uses modId as per new routing
    const modUrl = `/mod/${modId}`;
    const authorUrl = `/profile/${encodeURIComponent(author)}`;

    // Ensure categories is always an array
    const categories: string[] = Array.isArray(category)
        ? category
        : category
        ? [category]
        : [];    return (
        <>
            <div className="bg-gray-800 text-white rounded-[var(--border-radius-custom)] shadow-lg m-2 w-80 h-[400px] flex flex-col overflow-hidden hover:shadow-xl transition-shadow duration-200 relative group">
                {/* Dropdown Menu */}
                <div className="absolute top-2 right-2 z-10">
                    <div className="relative" ref={dropdownRef}>                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className={`p-1 rounded-full bg-gray-700 bg-opacity-80 hover:bg-opacity-100 transition-all ${
                                showDropdown ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                            }`}
                        >
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
                            </svg>
                        </button>
                        
                        {showDropdown && (
                            <div className="absolute right-0 mt-1 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 py-1">
                                <button
                                    onClick={() => {
                                        setShowCollectionModal(true);
                                        setShowDropdown(false);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 flex items-center gap-2"
                                    style={{ alignItems: "center" }}
                                >
                                    <span className="flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-library-big-icon lucide-library-big w-4 h-4">
                                            <rect width="8" height="18" x="3" y="3" rx="1"/>
                                            <path d="M7 3v18"/>
                                            <path d="M20.4 18.9c.2.5-.1 1.1-.6 1.3l-1.9.7c-.5.2-1.1-.1-1.3-.6L11.1 5.1c-.2-.5.1-1.1.6-1.3l1.9-.7c.5-.2 1.1.1 1.3.6Z"/>
                                        </svg>
                                    </span>
                                    <span className="flex items-center">Add to Collection</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <Link href={modUrl} className="block h-44 w-full relative group">
                    <Image
                        src={imageUrl}
                        alt={title}
                        fill
                        className="object-cover w-full h-full"
                        sizes="320px"
                        priority={false}
                    />
                </Link>
            <div className="flex-1 flex flex-col justify-between p-4">
                <div>
                    <Link href={modUrl} className="text-lg font-bold text-purple-300 hover:underline line-clamp-1">
                        {title}
                    </Link>
                    <p className="text-gray-300 text-sm mt-1 line-clamp-2 min-h-[40px]">{description}</p>
                </div>
                <div className="flex flex-col">
                    <div className="flex items-center mt-3 mb-2">
                        <Link href={authorUrl} className="flex items-center hover:underline">
                            <Image
                                src={authorPFP}
                                alt={author}
                                width={24}
                                height={24}
                                className="rounded-full mr-2 border border-purple-400"
                            />
                            <span className="text-xs text-gray-200">{author}</span>
                        </Link>
                    </div>
                    {/* Category badges below author, styled as links */}
                    <div
                        className="flex flex-nowrap gap-2 mt-2 mb-2 overflow-hidden"
                        style={{
                            minHeight: "24px",
                            maxHeight: "24px",
                        }}
                        title={categories.join(", ")}
                    >
                        {categories.map((cat, idx) => (
                            <span
                                key={cat + idx}
                                className="text-xs font-semibold text-purple-300 hover:underline cursor-pointer whitespace-nowrap text-ellipsis overflow-hidden"
                                style={{
                                    maxWidth: "120px",
                                }}
                            >
                                {cat}
                            </span>
                        ))}
                    </div>
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
                </div>                <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                    <span title="Uploaded">Uploaded {formattedDates.uploadedWeeksAgo === 0 ? 'this week' : `${formattedDates.uploadedWeeksAgo}w ago`}</span>
                    <span title="Last Updated">Updated {formattedDates.updatedWeeksAgo === 0 ? 'this week' : `${formattedDates.updatedWeeksAgo}w ago`}</span>
                </div>
            </div>
        </div>
          {/* Add to Collection Modal */}
        <Suspense fallback={<CollectionsModalLoading />}>
            <AddToCollectionModal
                isOpen={showCollectionModal}
                onClose={() => setShowCollectionModal(false)}
                modId={modId}
                modTitle={title}
            />
        </Suspense>
    </>
);
});

export default Card;
