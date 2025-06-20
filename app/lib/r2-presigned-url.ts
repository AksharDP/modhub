import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
    region: process.env.S3_REGION || "auto",
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
});

export async function getPresignedUrl(key: string) {
    const command = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: key,
    });

    try {
        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // Expires in 1 hour
        return url;
    } catch (error) {
        console.error(`Error generating presigned URL for key ${key}:`, error);
        return null;
    }
}
