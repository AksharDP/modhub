import { Suspense } from "react";
import NewUploadPage from "./new-upload-page";

const Page = () => (
    <Suspense>
        <NewUploadPage />
    </Suspense>
);

export default Page;
