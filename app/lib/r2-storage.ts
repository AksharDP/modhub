import { S3Client, DeleteObjectsCommand, CopyObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
    region: process.env.S3_REGION || "auto",
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
});

const bucketName = process.env.S3_BUCKET_NAME!;

export async function deleteFilesFromR2(keys: string[]) {
    if (keys.length === 0) return;

    const command = new DeleteObjectsCommand({
        Bucket: bucketName,
        Delete: {
            Objects: keys.map(key => ({ Key: key }))
        },
    });

    try {
        await s3Client.send(command);
    } catch (error) {
        console.error("Error deleting files from R2:", error);
        throw new Error("Failed to delete files from storage.");
    }
}

export async function moveFileInR2(sourceKey: string) {
    const destinationKey = `deleted/${sourceKey}`;
    const copyCommand = new CopyObjectCommand({
        Bucket: bucketName,
        CopySource: `${bucketName}/${sourceKey}`,
        Key: destinationKey,
    });

    const deleteCommand = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: sourceKey,
    });

    try {
        await s3Client.send(copyCommand);
        await s3Client.send(deleteCommand);
        return destinationKey;
    } catch (error) {
        console.error(`Error moving file from ${sourceKey} to ${destinationKey}:`, error);
        throw new Error("Failed to move file in storage.");
    }
}
