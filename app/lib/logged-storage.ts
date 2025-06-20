import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { logger } from './logger';

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

class LoggedStorageManager {
  private s3Client: S3Client | null = null;
  private config: StorageConfig | null = null;
  private validationResult: StorageValidationResult;

  constructor() {
    this.validationResult = this.validateEnvironment();
    
    if (this.validationResult.isValid && this.config) {
      this.initializeS3Client();
    }

    // Log initialization
    logger.info("Storage manager initialized", {
      operation: "storage_init",
      isValid: this.validationResult.isValid,
      endpointType: this.validationResult.endpointType,
      missingVariables: this.validationResult.missingVariables
    });
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
    if (!accessKeyId) missingVariables.push('S3_ACCESS_KEY_ID or AWS_ACCESS_KEY_ID');
    if (!secretAccessKey) missingVariables.push('S3_SECRET_ACCESS_KEY or AWS_SECRET_ACCESS_KEY');
    if (!bucketName) missingVariables.push('S3_BUCKET_NAME');

    const isValid = missingVariables.length === 0;    if (isValid) {
      this.config = {
        endpoint,
        region,
        accessKeyId: accessKeyId!,
        secretAccessKey: secretAccessKey!,
        bucketName: bucketName!
      };
    }

    return {
      isValid,
      missingVariables,
      endpointType
    };
  }

  private initializeS3Client() {
    if (!this.config) return;

    try {
      this.s3Client = new S3Client({
        endpoint: this.config.endpoint,
        region: this.config.region,
        credentials: {
          accessKeyId: this.config.accessKeyId!,
          secretAccessKey: this.config.secretAccessKey!,
        },
        forcePathStyle: true,
      });

      logger.info("S3 client initialized successfully", {
        operation: "s3_client_init",
        endpointType: this.validationResult.endpointType,
        region: this.config.region,
        bucket: this.config.bucketName
      });
    } catch (error) {
      logger.error("Failed to initialize S3 client", {
        operation: "s3_client_init",
        error: error as Error,
        endpointType: this.validationResult.endpointType
      });
      throw error;
    }
  }

  async uploadFile(key: string, body: Buffer | Uint8Array | string, contentType?: string): Promise<string> {
    const startTime = Date.now();
    
    if (!this.isConfigured()) {
      const error = new Error('Storage is not properly configured');
      logger.error("Upload failed - storage not configured", {
        operation: "upload",
        key,
        error,
        missingVariables: this.validationResult.missingVariables
      });
      throw error;
    }

    try {
      const size = Buffer.isBuffer(body) ? body.length : 
                   body instanceof Uint8Array ? body.length : 
                   Buffer.byteLength(body.toString());

      logger.info("Starting file upload", {
        operation: "upload",
        bucket: this.config!.bucketName,
        key,
        size,
        contentType
      });

      const command = new PutObjectCommand({
        Bucket: this.config!.bucketName,
        Key: key,
        Body: body,
        ContentType: contentType,
      });

      await this.s3Client!.send(command);
      
      const duration = Date.now() - startTime;
      const url = this.getPublicUrl(key);
      
      logger.info("File upload completed successfully", {
        operation: "upload",
        bucket: this.config!.bucketName,
        key,
        size,
        duration,
        url
      });

      return url;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.logStorageError("upload", this.config!.bucketName, key, error as Error, {
        duration,
        size: Buffer.isBuffer(body) ? body.length : undefined
      });
      throw error;
    }
  }

  async getFile(key: string): Promise<Buffer> {
    const startTime = Date.now();
    
    if (!this.isConfigured()) {
      const error = new Error('Storage is not properly configured');
      logger.error("Get file failed - storage not configured", {
        operation: "get",
        key,
        error,
        missingVariables: this.validationResult.missingVariables
      });
      throw error;
    }

    try {
      logger.debug("Starting file retrieval", {
        operation: "get",
        bucket: this.config!.bucketName,
        key
      });

      const command = new GetObjectCommand({
        Bucket: this.config!.bucketName,
        Key: key,
      });

      const response = await this.s3Client!.send(command);
      const body = await response.Body?.transformToByteArray();
      
      if (!body) {
        throw new Error('Empty response body');
      }

      const duration = Date.now() - startTime;
      const buffer = Buffer.from(body);
      
      logger.info("File retrieval completed successfully", {
        operation: "get",
        bucket: this.config!.bucketName,
        key,
        size: buffer.length,
        duration
      });

      return buffer;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.logStorageError("get", this.config!.bucketName, key, error as Error, {
        duration
      });
      throw error;
    }
  }

  async deleteFile(key: string): Promise<void> {
    const startTime = Date.now();
    
    if (!this.isConfigured()) {
      const error = new Error('Storage is not properly configured');
      logger.error("Delete file failed - storage not configured", {
        operation: "delete",
        key,
        error,
        missingVariables: this.validationResult.missingVariables
      });
      throw error;
    }

    try {
      logger.info("Starting file deletion", {
        operation: "delete",
        bucket: this.config!.bucketName,
        key
      });

      const command = new DeleteObjectCommand({
        Bucket: this.config!.bucketName,
        Key: key,
      });

      await this.s3Client!.send(command);
      
      const duration = Date.now() - startTime;
      
      logger.info("File deletion completed successfully", {
        operation: "delete",
        bucket: this.config!.bucketName,
        key,
        duration
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.logStorageError("delete", this.config!.bucketName, key, error as Error, {
        duration
      });
      throw error;
    }
  }

  async fileExists(key: string): Promise<boolean> {
    const startTime = Date.now();
    
    if (!this.isConfigured()) {
      const error = new Error('Storage is not properly configured');
      logger.error("File exists check failed - storage not configured", {
        operation: "exists",
        key,
        error,
        missingVariables: this.validationResult.missingVariables
      });
      throw error;
    }

    try {
      logger.debug("Checking if file exists", {
        operation: "exists",
        bucket: this.config!.bucketName,
        key
      });

      const command = new HeadObjectCommand({
        Bucket: this.config!.bucketName,
        Key: key,
      });

      await this.s3Client!.send(command);
      
      const duration = Date.now() - startTime;
      
      logger.debug("File exists check completed", {
        operation: "exists",
        bucket: this.config!.bucketName,
        key,
        exists: true,
        duration
      });

      return true;    } catch (error: unknown) {
      const duration = Date.now() - startTime;
      
      if (error && typeof error === 'object' && 'name' in error && error.name === 'NotFound') {
        logger.debug("File exists check completed", {
          operation: "exists",
          bucket: this.config!.bucketName,
          key,
          exists: false,
          duration
        });
        return false;
      }
      
      if (error && typeof error === 'object' && '$metadata' in error) {
        const metadata = error.$metadata as { httpStatusCode?: number };
        if (metadata.httpStatusCode === 404) {
          logger.debug("File exists check completed", {
            operation: "exists",
            bucket: this.config!.bucketName,
            key,
            exists: false,
            duration
          });
          return false;
        }
      }
      
      logger.logStorageError("exists", this.config!.bucketName, key, error as Error, {
        duration
      });
      throw error;
    }
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const startTime = Date.now();
    
    if (!this.isConfigured()) {
      const error = new Error('Storage is not properly configured');
      logger.error("Get signed URL failed - storage not configured", {
        operation: "signed_url",
        key,
        error,
        missingVariables: this.validationResult.missingVariables
      });
      throw error;
    }

    try {
      logger.debug("Generating signed URL", {
        operation: "signed_url",
        bucket: this.config!.bucketName,
        key,
        expiresIn
      });

      const command = new GetObjectCommand({
        Bucket: this.config!.bucketName,
        Key: key,
      });

      const signedUrl = await getSignedUrl(this.s3Client!, command, { expiresIn });
      
      const duration = Date.now() - startTime;
      
      logger.info("Signed URL generated successfully", {
        operation: "signed_url",
        bucket: this.config!.bucketName,
        key,
        expiresIn,
        duration
      });

      return signedUrl;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.logStorageError("signed_url", this.config!.bucketName, key, error as Error, {
        duration,
        expiresIn
      });
      throw error;
    }
  }

  getPublicUrl(key: string): string {
    if (!this.config) {
      logger.warn("Cannot generate public URL - storage not configured", {
        operation: "public_url",
        key,
        missingVariables: this.validationResult.missingVariables
      });
      return '';
    }

    const publicUrl = this.config.endpoint
      ? `${this.config.endpoint}/${this.config.bucketName}/${key}`
      : `https://${this.config.bucketName}.s3.${this.config.region}.amazonaws.com/${key}`;

    logger.debug("Generated public URL", {
      operation: "public_url",
      bucket: this.config.bucketName,
      key,
      url: publicUrl
    });

    return publicUrl;
  }

  isConfigured(): boolean {
    return this.validationResult.isValid && this.s3Client !== null;
  }

  getValidationResult(): StorageValidationResult {
    return this.validationResult;
  }

  getBucketName(): string | null {
    return this.config?.bucketName || null;
  }

  getEndpointType(): string {
    return this.validationResult.endpointType;
  }
}

// Export singleton instance
export const storage = new LoggedStorageManager();
export default storage;
