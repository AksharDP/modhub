import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface UploadResult {
  success: boolean;
  fileKey: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  contentType: string;
}

interface FileUploadProps {
  onUploadSuccess?: (result: UploadResult) => void;
  onUploadError?: (error: string) => void;
  acceptedFileTypes?: string[];
  maxFileSize?: number;
  userId?: string;
  className?: string;
}

export default function FileUpload({
  onUploadSuccess,
  onUploadError,
  acceptedFileTypes = ['*'],
  maxFileSize = 100 * 1024 * 1024, // 100MB default
  userId,
  className = ''
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (userId) {
        formData.append('userId', userId);
      }

      // Simulate progress (since fetch doesn't provide upload progress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      onUploadSuccess?.(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      onUploadError?.(errorMessage);
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }, [onUploadSuccess, onUploadError, userId]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: maxFileSize,
    accept: acceptedFileTypes.reduce((acc, type) => {
      if (type === '*') {
        return { '*/*': [] };
      }
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    disabled: uploading,
  });

  return (
    <div className={`relative ${className}`}>
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${uploading ? 'cursor-not-allowed opacity-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        {uploading ? (
          <div className="space-y-4">
            <div className="text-blue-600">Uploading...</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <div className="text-sm text-gray-500">{uploadProgress}%</div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-lg font-medium text-gray-700">
              {isDragActive ? 'Drop the file here' : 'Drag & drop a file here'}
            </div>
            <div className="text-sm text-gray-500">
              or click to select a file
            </div>
            <div className="text-xs text-gray-400">
              Max file size: {Math.round(maxFileSize / 1024 / 1024)}MB
            </div>
          </div>
        )}
      </div>      {fileRejections.length > 0 && (
        <div className="mt-2 text-sm text-red-600">
          {fileRejections.map(({ file, errors }, index) => (
            <div key={`${file.name}-${index}`}>
              File &quot;{file.name}&quot; was rejected:
              <ul className="list-disc list-inside ml-2">
                {errors.map((error, errorIndex) => (
                  <li key={`${error.code}-${errorIndex}`}>{error.message}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
