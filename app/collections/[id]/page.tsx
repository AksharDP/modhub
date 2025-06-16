import { Suspense } from "react";
import CollectionsPageLoading from "../../components/CollectionsPageLoading";
import CollectionViewClient from "./CollectionViewClient";

export default function CollectionViewPage({ params }: { params: Promise<{ id: string }> }) {
    return (
        <Suspense fallback={<CollectionsPageLoading />}>
            <CollectionViewClient params={params} />
        </Suspense>
    );
}
