import { Suspense } from "react";
import UploadPage from "./uploadPage";

const Page = () => (
    <Suspense>
        <UploadPage />
    </Suspense>
);

export default Page;
