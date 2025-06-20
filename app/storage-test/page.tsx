'use client';

import React, { useState, useEffect, useRef } from 'react';
import StorageStatus from '../components/StorageStatus';
import FileUpload from '../components/FileUpload';
import { storageStatusCache } from '../lib/storageStatusCache';

interface StorageTestResult {
    configured: boolean;
    endpointType: string;
    missingVariables?: string[];
}

interface UploadResult {
    success: boolean;
    fileKey: string;
    fileUrl: string;
    fileName: string;
    fileSize: number;
    contentType: string;
}

export default function StorageTestPage() {
    const [storageStatus, setStorageStatus] = useState<StorageTestResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fetchingRef = useRef(false);

    useEffect(() => {
        if (!fetchingRef.current) {
            fetchingRef.current = true;
            fetchStorageStatus();
        }
    }, []);    const fetchStorageStatus = async () => {
        try {
            const data = await storageStatusCache.getStorageStatus();
            setStorageStatus(data);
        } catch (error) {
            console.error('Failed to fetch storage status:', error);
        } finally {
            setLoading(false);
            fetchingRef.current = false;
        }
    };

    const handleUploadSuccess = (result: UploadResult) => {
        setUploadResult(result);
        setUploadError(null);
    };

    const handleUploadError = (error: string) => {
        setUploadError(error);
        setUploadResult(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                <span className="ml-4 text-lg">Loading storage status...</span>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 text-white min-h-screen flex flex-col">
            <main className="flex-grow container mx-auto px-4 py-8">
                <header className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-purple-400 mb-2">
                        Storage Configuration Test
                    </h1>
                    <p className="text-gray-400 mt-2">
                        Check your storage setup and test file uploads.
                    </p>
                </header>

                <div className="space-y-8 max-w-3xl mx-auto">                    {/* Storage Status */}
                    <section className="bg-gray-800 rounded-lg border border-gray-700 shadow p-6">
                        <h2 className="text-xl font-semibold mb-4 text-purple-300">Storage Status</h2>
                        <StorageStatus showDetails={true} statusData={storageStatus} />

                        {storageStatus && (
                            <div className="mt-4 p-4 bg-gray-900 rounded-lg border border-gray-700">
                                <h3 className="font-medium mb-2 text-gray-200">API Status:</h3>
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <span className="font-medium">Configured:</span>{' '}
                                        <span className={storageStatus.configured ? 'text-green-400' : 'text-red-400'}>
                                            {storageStatus.configured ? '✓ Yes' : '✗ No'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-medium">Endpoint Type:</span> {storageStatus.endpointType}
                                    </div>
                                    {storageStatus.missingVariables && storageStatus.missingVariables.length > 0 && (
                                        <div>
                                            <span className="font-medium text-red-400">Missing Variables:</span>
                                            <ul className="list-disc list-inside ml-4 text-red-400">
                                                {storageStatus.missingVariables.map((variable) => (
                                                    <li key={variable}>{variable}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </section>

                    {/* File Upload Test */}
                    {storageStatus?.configured && (
                        <section className="bg-gray-800 rounded-lg border border-gray-700 shadow p-6">
                            <h2 className="text-xl font-semibold mb-4 text-purple-300">File Upload Test</h2>
                            <FileUpload
                                onUploadSuccess={handleUploadSuccess}
                                onUploadError={handleUploadError}
                                acceptedFileTypes={['image/*']}
                                maxFileSize={10 * 1024 * 1024} // 10MB
                                className="mb-4"
                            />

                            {uploadResult && (
                                <div className="mt-4 p-4 bg-green-900 border border-green-700 rounded-lg">
                                    <h3 className="font-medium text-green-300 mb-2">Upload Successful!</h3>
                                    <div className="space-y-2 text-sm">
                                        <div><span className="font-medium">File Name:</span> {uploadResult.fileName}</div>
                                        <div><span className="font-medium">File Size:</span> {Math.round(uploadResult.fileSize / 1024)} KB</div>
                                        <div><span className="font-medium">Content Type:</span> {uploadResult.contentType}</div>
                                        <div><span className="font-medium">File Key:</span> <code className="bg-gray-900 px-1 rounded">{uploadResult.fileKey}</code></div>
                                        <div>
                                            <span className="font-medium">File URL:</span>{' '}
                                            <a href={uploadResult.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all">
                                                {uploadResult.fileUrl}
                                            </a>
                                        </div>
                                    </div>
                                    {uploadResult.contentType.startsWith('image/') && (
                                        <div className="mt-4">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={uploadResult.fileUrl}
                                                alt="Uploaded file"
                                                className="max-w-xs max-h-64 object-contain border rounded"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {uploadError && (
                                <div className="mt-4 p-4 bg-red-900 border border-red-700 rounded-lg">
                                    <h3 className="font-medium text-red-300 mb-2">Upload Failed</h3>
                                    <p className="text-red-200">{uploadError}</p>
                                </div>
                            )}
                        </section>
                    )}

                    {/* Configuration Instructions */}
                    <section className="bg-gray-800 rounded-lg border border-gray-700 shadow p-6">
                        <h2 className="text-xl font-semibold mb-4 text-purple-300">Configuration Instructions</h2>
                        <div className="prose prose-invert max-w-none">
                            <p>
                                To configure storage for your ModHub application, you need to set the appropriate environment variables:
                            </p>

                            <h3 className="text-lg font-medium mb-2">For Cloudflare R2:</h3>
                            <pre className="bg-gray-900 p-3 rounded text-sm overflow-x-auto border border-gray-700">
{`S3_ENDPOINT=https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com
S3_ACCESS_KEY_ID=your_cloudflare_r2_access_key_id
S3_SECRET_ACCESS_KEY=your_cloudflare_r2_secret_access_key
S3_BUCKET_NAME=your_bucket_name
S3_REGION=auto`}
                            </pre>

                            <h3 className="text-lg font-medium mb-2 mt-4">For AWS S3:</h3>
                            <pre className="bg-gray-900 p-3 rounded text-sm overflow-x-auto border border-gray-700">
{`S3_ACCESS_KEY_ID=your_aws_access_key_id
S3_SECRET_ACCESS_KEY=your_aws_secret_access_key
S3_BUCKET_NAME=your_bucket_name
S3_REGION=us-east-1`}
                            </pre>

                            <p className="mt-4 text-sm text-gray-400">
                                Don&apos;t forget to restart your development server after updating environment variables.
                            </p>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
