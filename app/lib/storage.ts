import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

interface StorageConfig {
  endpoint?: string;
  region: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  bucketName: string;
}

interface StorageValidationResult {
  isValid: boolean;
  missingVariables: string[];
  endpointType: string;
}

class StorageManager {
  private s3Client: S3Client | null = null;
  private config: StorageConfig | null = null;
  private validationResult: StorageValidationResult;

  constructor() {
    this.validationResult = this.validateEnvironment();
    
    if (this.validationResult.isValid && this.config) {
      this.initializeS3Client();
    }
  }

  private validateEnvironment(): StorageValidationResult {
    const endpoint = process.env.S3_ENDPOINT || process.env.ENDPOINT;
    const region = process.env.S3_REGION || process.env.AWS_REGION || 'auto';
    const accessKeyId = process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
    const bucketName = process.env.S3_BUCKET_NAME;

    const missingVariables: string[] = [];
    let endpointType = 'Unknown';

    // Determine endpoint type
    if (endpoint) {
      if (endpoint.includes('cloudflare') || endpoint.includes('r2.cloudflarestorage.com')) {
        endpointType = 'Cloudflare R2';
      } else if (endpoint.includes('amazonaws.com')) {
        endpointType = 'AWS S3';
      } else {
        endpointType = 'Custom S3-compatible';
      }
    } else {
      endpointType = 'AWS S3 (default)';
    }

    // Check required variables
    if (!bucketName) {
      missingVariables.push('S3_BUCKET_NAME');
    }

    // For Cloudflare R2 or custom endpoints, require credentials
    if (endpoint && (endpoint.includes('cloudflare') || !endpoint.includes('amazonaws.com'))) {
      if (!accessKeyId) {
        missingVariables.push('S3_ACCESS_KEY_ID');
      }
      if (!secretAccessKey) {
        missingVariables.push('S3_SECRET_ACCESS_KEY');
      }
    }

    const isValid = missingVariables.length === 0;

    if (isValid) {
      this.config = {
        endpoint,
        region,
        accessKeyId,
        secretAccessKey,
        bucketName: bucketName!
      };
    }

    return {
      isValid,
      missingVariables,
      endpointType
    };
  }

  private initializeS3Client(): void {
    if (!this.config) return;    const clientConfig: {
      region: string;
      credentials?: { accessKeyId: string; secretAccessKey: string };
      endpoint?: string;
      forcePathStyle?: boolean;
    } = {
      region: this.config.region,
    };

    // Add credentials if provided
    if (this.config.accessKeyId && this.config.secretAccessKey) {
      clientConfig.credentials = {
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey,
      };
    }

    // Add custom endpoint if provided
    if (this.config.endpoint) {
      clientConfig.endpoint = this.config.endpoint;
      
      // For Cloudflare R2, we need to force path style
      if (this.config.endpoint.includes('cloudflare') || this.config.endpoint.includes('r2.cloudflarestorage.com')) {
        clientConfig.forcePathStyle = true;
      }
    }

    this.s3Client = new S3Client(clientConfig);
  }

  public getValidationResult(): StorageValidationResult {
    return this.validationResult;
  }

  public isConfigured(): boolean {
    return this.validationResult.isValid && this.s3Client !== null;
  }

  public async uploadFile(key: string, file: Buffer | Uint8Array, contentType?: string): Promise<string> {
    if (!this.isConfigured() || !this.config) {
      throw new Error('Storage is not properly configured');
    }

    const command = new PutObjectCommand({
      Bucket: this.config.bucketName,
      Key: key,
      Body: file,
      ContentType: contentType || 'application/octet-stream',
    });

    await this.s3Client!.send(command);
    
    // Return the public URL or signed URL
    return this.getFileUrl(key);
  }

  public async deleteFile(key: string): Promise<void> {
    if (!this.isConfigured() || !this.config) {
      throw new Error('Storage is not properly configured');
    }

    const command = new DeleteObjectCommand({
      Bucket: this.config.bucketName,
      Key: key,
    });

    await this.s3Client!.send(command);
  }

  public async fileExists(key: string): Promise<boolean> {
    if (!this.isConfigured() || !this.config) {
      throw new Error('Storage is not properly configured');
    }

    try {
      const command = new HeadObjectCommand({
        Bucket: this.config.bucketName,
        Key: key,
      });

      await this.s3Client!.send(command);
      return true;    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'name' in error && error.name === 'NotFound') {
        return false;
      }
      throw error;
    }
  }

  public async getSignedUploadUrl(key: string, contentType: string, expiresIn: number = 3600): Promise<string> {
    if (!this.isConfigured() || !this.config) {
      throw new Error('Storage is not properly configured');
    }

    const command = new PutObjectCommand({
      Bucket: this.config.bucketName,
      Key: key,
      ContentType: contentType,
    });

    return await getSignedUrl(this.s3Client!, command, { expiresIn });
  }

  public async getSignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
    if (!this.isConfigured() || !this.config) {
      throw new Error('Storage is not properly configured');
    }

    const command = new GetObjectCommand({
      Bucket: this.config.bucketName,
      Key: key,
    });

    return await getSignedUrl(this.s3Client!, command, { expiresIn });
  }

  public getFileUrl(key: string): string {
    if (!this.config) {
      throw new Error('Storage is not properly configured');
    }

    if (this.config.endpoint) {
      // For custom endpoints, construct the URL
      const baseUrl = this.config.endpoint.replace(/\/$/, '');
      return `${baseUrl}/${this.config.bucketName}/${key}`;
    } else {
      // For AWS S3, use the standard URL format
      return `https://${this.config.bucketName}.s3.${this.config.region}.amazonaws.com/${key}`;
    }
  }

  public generateFileKey(originalName: string, userId?: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = originalName.split('.').pop();
    const baseName = originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '-');
    
    const prefix = userId ? `users/${userId}` : 'uploads';
    return `${prefix}/${timestamp}-${randomString}-${baseName}.${extension}`;
  }
}

// Create a singleton instance
export const storageManager = new StorageManager();

// Export utility functions
export const uploadFile = (key: string, file: Buffer | Uint8Array, contentType?: string) => 
  storageManager.uploadFile(key, file, contentType);

export const deleteFile = (key: string) => 
  storageManager.deleteFile(key);

export const fileExists = (key: string) => 
  storageManager.fileExists(key);

export const getSignedUploadUrl = (key: string, contentType: string, expiresIn?: number) => 
  storageManager.getSignedUploadUrl(key, contentType, expiresIn);

export const getSignedDownloadUrl = (key: string, expiresIn?: number) => 
  storageManager.getSignedDownloadUrl(key, expiresIn);

export const getFileUrl = (key: string) => 
  storageManager.getFileUrl(key);

export const generateFileKey = (originalName: string, userId?: string) => 
  storageManager.generateFileKey(originalName, userId);

export const getStorageValidation = () => 
  storageManager.getValidationResult();

export const isStorageConfigured = () => 
  storageManager.isConfigured();
