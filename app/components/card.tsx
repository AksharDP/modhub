import Image from "next/image";
import Link from "next/link";

interface CardProps {
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

export default function Card({
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
    return (
        <>
            <div className="bg-gray-800 text-white rounded-lg shadow-lg m-4 w-80">
                <Link
                    href={`/${gameName}/mods/${modId}`}
                    className="block relative w-full h-48 mb-4"
                >
                    <Image
                        src={imageUrl}
                        alt={title}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-t-lg"
                        loading="lazy"
                    />
                </Link>
                <div className="pb-2 px-3 flex flex-col h-full">
                    <Link href={`/${gameName}/mods/${modId}`} className="block">
                        <h2
                            className="text-xl font-bold mb-0.5 truncate"
                            title={title}
                        >
                            {title}
                        </h2>
                    </Link>
                    <p className="text-sm text-gray-400 mb-1 h-12 overflow-hidden">
                        {description}
                    </p>
                    <div className="mt-auto text-xs text-gray-500">
                        <div className="flex justify-between items-center mb-1.5">
                            <div className="flex flex-col space-y-1.5">
                                <Link
                                    href={`/author/${encodeURIComponent(
                                        author
                                    )}/mods`}
                                    className="flex items-center hover:underline"
                                >
                                    <Image
                                        src={authorPFP}
                                        alt={`${author}'s profile picture`}
                                        width={18}
                                        height={18}
                                        className="rounded-full mr-1.5"
                                        loading="lazy"
                                    />
                                    <span className="font-medium text-gray-300">
                                        {author}
                                    </span>
                                </Link>
                                <div className="flex space-x-4 items-center">
                                    <span
                                        className="flex items-center"
                                        title={`${likes} likes`}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-3.5 w-3.5 mr-1 text-pink-500"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        {likes}
                                    </span>
                                    <span
                                        className="flex items-center"
                                        title={`${downloads} downloads`}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-3.5 w-3.5 mr-1 text-blue-500"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        {downloads}
                                    </span>
                                    <span
                                        className="flex items-center"
                                        title={`Size: ${size}`}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-3.5 w-3.5 mr-1 text-purple-500"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path d="M3 12v3c0 1.1.9 2 2 2h10a2 2 0 002-2v-3H3zM3 8V5c0-1.1.9-2 2-2h10a2 2 0 002 2v3H3z" />
                                            <path
                                                fillRule="evenodd"
                                                d="M5 4a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zM5 16a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        {size}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <a
                                    href={`/categories/${category.toLowerCase()}`}
                                    className="text-xs text-gray-300 hover:text-purple-500 hover:underline transition-colors"
                                    title={`View mods in ${category}`}
                                >
                                    {category}
                                </a>
                            </div>
                        </div>
                        <hr className="border-gray-700 my-1.5" />{" "}
                        <div className="flex justify-between">
                            <span
                                className="flex items-center cursor-default"
                                title={`Uploaded: ${new Date(
                                    uploaded
                                ).toLocaleDateString(undefined, {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}`}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-3.5 w-3.5 mr-1 text-green-500"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                {`${Math.floor(
                                    (new Date().getTime() -
                                        new Date(uploaded).getTime()) /
                                        (1000 * 60 * 60 * 24 * 7)
                                )}w ago`}
                            </span>
                            <span
                                className="flex items-center cursor-default"
                                title={`Last Updated: ${new Date(
                                    lastUpdated
                                ).toLocaleDateString(undefined, {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}`}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-3.5 w-3.5 mr-1 text-yellow-500"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                {`${Math.floor(
                                    (new Date().getTime() -
                                        new Date(lastUpdated).getTime()) /
                                        (1000 * 60 * 60 * 24 * 7)
                                )}w ago`}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
