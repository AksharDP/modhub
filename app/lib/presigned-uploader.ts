interface UploadProgress {
  fileIndex: number;
  fileName: string;
  progress: number;
  completed: boolean;
  error?: string;
}

interface UploadResult {
  recordId: number;
  url: string;
  fileType: 'image' | 'mod';
}

export class PresignedUploader {
  private gameSlug: string;
  private modId: number;
  private onProgress?: (progress: UploadProgress[], overallProgress: number) => void;

  constructor(
    gameSlug: string, 
    modId: number, 
    onProgress?: (progress: UploadProgress[], overallProgress: number) => void
  ) {
    this.gameSlug = gameSlug;
    this.modId = modId;
    this.onProgress = onProgress;
  }

  async uploadFiles(files: File[], fileType: 'image' | 'mod'): Promise<UploadResult[]> {
    const uploadProgress: UploadProgress[] = files.map((file, index) => ({
      fileIndex: index,
      fileName: file.name,
      progress: 0,
      completed: false,
    }));

    const results: UploadResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        // Update progress: starting this file
        uploadProgress[i].progress = 0;
        this.updateProgress(uploadProgress);

        // Get pre-signed URL
        const presignedResponse = await fetch('/api/upload/presigned-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gameSlug: this.gameSlug,
            modId: this.modId,
            fileType,
            fileName: file.name,
            contentType: file.type,
          }),
        });

        if (!presignedResponse.ok) {
          throw new Error(`Failed to get pre-signed URL: ${presignedResponse.statusText}`);
        }

        const { presignedUrl, recordId, storageKey } = await presignedResponse.json();

        // Upload file to pre-signed URL with progress tracking
        await this.uploadToPresignedUrl(
          file, 
          presignedUrl, 
          (progress) => {
            uploadProgress[i].progress = progress;
            this.updateProgress(uploadProgress);
          }
        );

        // Finalize upload
        const finalizeResponse = await fetch('/api/upload/finalize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recordId,
            fileType,
            storageKey,
            fileSize: file.size,
          }),
        });

        if (!finalizeResponse.ok) {
          throw new Error(`Failed to finalize upload: ${finalizeResponse.statusText}`);
        }

        const { url } = await finalizeResponse.json();

        // Mark as completed
        uploadProgress[i].progress = 100;
        uploadProgress[i].completed = true;
        this.updateProgress(uploadProgress);

        results.push({
          recordId,
          url,
          fileType,
        });

      } catch (error) {
        uploadProgress[i].error = error instanceof Error ? error.message : 'Upload failed';
        this.updateProgress(uploadProgress);
        throw error;
      }
    }

    return results;
  }

  private async uploadToPresignedUrl(
    file: File, 
    presignedUrl: string, 
    onProgress: (progress: number) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.open('PUT', presignedUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    });
  }

  private updateProgress(uploadProgress: UploadProgress[]): void {
    if (!this.onProgress) return;

    const completedFiles = uploadProgress.filter(p => p.completed).length;
    const totalFiles = uploadProgress.length;
    const currentFileProgress = uploadProgress.find(p => !p.completed && !p.error)?.progress || 0;
    
    // Calculate overall progress: completed files + current file progress
    const overallProgress = totalFiles > 0 
      ? ((completedFiles + (currentFileProgress / 100)) / totalFiles) * 100 
      : 0;

    this.onProgress(uploadProgress, overallProgress);
  }
}
