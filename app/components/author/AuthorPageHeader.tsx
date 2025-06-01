import Image from "next/image";

interface AuthorPageHeaderProps {
    authorPFP: string;
    authorName: string;
    modCount: number;
    DEFAULT_PFP: string;
    setAuthorPFP: (pfp: string) => void;
}

const AuthorPageHeader: React.FC<AuthorPageHeaderProps> = ({
    authorPFP,
    authorName,
    modCount,
    DEFAULT_PFP,
    setAuthorPFP,
}) => {
    return (
        <header className="mb-10 p-6 bg-gray-800 rounded-xl shadow-xl flex flex-col items-center text-center sm:flex-row sm:text-left sm:items-start gap-6">
            <Image
                src={authorPFP}
                alt={`${authorName}'s profile picture`}
                width={128}
                height={128}
                className="rounded-full border-4 border-purple-500 object-cover flex-shrink-0 shadow-md"
                onError={() => setAuthorPFP(DEFAULT_PFP)}
            />
            <div className="flex-grow mt-4 sm:mt-0">
                <h1 className="text-4xl sm:text-5xl font-bold text-purple-400 mb-2">
                    {authorName}
                </h1>
                <p className="text-gray-400 text-md mb-3">
                    Showcasing all mods by {authorName}.
                </p>
                {modCount > 0 && (
                    <div className="text-sm text-gray-500">
                        <span className="font-medium text-gray-300">
                            {modCount}
                        </span>{" "}
                        Mod{modCount === 1 ? "" : "s"} Published
                    </div>
                )}
            </div>
        </header>
    );
};

export default AuthorPageHeader;
