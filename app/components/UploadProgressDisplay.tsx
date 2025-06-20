import React from 'react';

interface UploadProgress {
  fileIndex: number;
  fileName: string;
  progress: number;
  completed: boolean;
  error?: string;
}

interface UploadProgressProps {
  uploadProgress: UploadProgress[];
  overallProgress: number;
  isUploading: boolean;
}

export default function UploadProgressDisplay({ 
  uploadProgress, 
  overallProgress, 
  isUploading 
}: UploadProgressProps) {
  if (!isUploading && uploadProgress.length === 0) {
    return null;
  }

  const completedCount = uploadProgress.filter(p => p.completed).length;
  const totalCount = uploadProgress.length;
  const hasErrors = uploadProgress.some(p => p.error);

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-white">
            Upload Progress
          </h3>
          <span className="text-sm text-gray-400">
            {completedCount} / {totalCount} files completed
          </span>
        </div>
        
        {/* Overall Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
          <div 
            className={`h-3 rounded-full transition-all duration-300 ${
              hasErrors ? 'bg-red-500' : overallProgress === 100 ? 'bg-green-500' : 'bg-purple-500'
            }`}
            style={{ width: `${Math.max(0, Math.min(100, overallProgress))}%` }}
          />
        </div>
        
        <div className="text-center text-sm text-gray-400 mb-4">
          Overall: {Math.round(overallProgress)}%
        </div>
      </div>

      {/* Individual File Progress */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {uploadProgress.map((file) => (
          <div key={file.fileIndex} className="bg-gray-900 rounded p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white text-sm font-medium truncate max-w-xs">
                {file.fileName}
              </span>
              <div className="flex items-center space-x-2">
                {file.error ? (
                  <span className="text-red-400 text-xs">Error</span>
                ) : file.completed ? (
                  <span className="text-green-400 text-xs">✓ Complete</span>
                ) : (
                  <span className="text-gray-400 text-xs">{Math.round(file.progress)}%</span>
                )}
              </div>
            </div>
            
            {!file.error && (
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    file.completed ? 'bg-green-500' : 'bg-purple-500'
                  }`}
                  style={{ width: `${Math.max(0, Math.min(100, file.progress))}%` }}
                />
              </div>
            )}
            
            {file.error && (
              <div className="text-red-400 text-xs mt-1">
                {file.error}
              </div>
            )}
          </div>
        ))}
      </div>

      {hasErrors && (
        <div className="mt-4 p-3 bg-red-900 border border-red-700 rounded">
          <p className="text-red-300 text-sm">
            Some files failed to upload. Please try again.
          </p>
        </div>
      )}
    </div>
  );
}
