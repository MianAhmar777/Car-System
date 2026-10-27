import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private supabaseClient: SupabaseClient | null = null;
  private isLocalStorage = false;
  private localStoragePath: string;

  constructor(private configService: ConfigService) {
    const provider = this.configService.get<string>('STORAGE_PROVIDER', 'local');
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (provider === 'supabase' && supabaseUrl && supabaseKey && !supabaseUrl.includes('your-supabase-project')) {
      this.supabaseClient = createClient(supabaseUrl, supabaseKey);
      this.logger.log('Supabase Storage client initialized successfully.');
    } else {
      this.isLocalStorage = true;
      this.localStoragePath = path.resolve(
        this.configService.get<string>('LOCAL_STORAGE_PATH', './uploads'),
      );
      if (!fs.existsSync(this.localStoragePath)) {
        fs.mkdirSync(this.localStoragePath, { recursive: true });
      }
      this.logger.log(`Using Local Private File Storage at: ${this.localStoragePath}`);
    }
  }

  async uploadFile(
    bucket: string,
    filePath: string,
    fileBuffer: Buffer,
    mimeType: string,
  ): Promise<{ path: string; bucket: string }> {
    if (this.supabaseClient && !this.isLocalStorage) {
      const { data, error } = await this.supabaseClient.storage
        .from(bucket)
        .upload(filePath, fileBuffer, {
          contentType: mimeType,
          upsert: true,
        });

      if (error) {
        this.logger.error(`Supabase upload error for bucket ${bucket}/${filePath}: ${error.message}`);
        throw new Error(`Failed to upload file to Supabase Storage: ${error.message}`);
      }
      return { path: data.path, bucket };
    } else {
      // Local private storage handling
      const bucketDir = path.join(this.localStoragePath, bucket);
      if (!fs.existsSync(bucketDir)) {
        fs.mkdirSync(bucketDir, { recursive: true });
      }
      const fullPath = path.join(bucketDir, filePath);
      const parentDir = path.dirname(fullPath);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }
      fs.writeFileSync(fullPath, fileBuffer);
      return { path: filePath, bucket };
    }
  }

  async getSignedUrl(bucket: string, filePath: string, expiresInSeconds: number = 3600): Promise<string> {
    if (this.supabaseClient && !this.isLocalStorage) {
      const { data, error } = await this.supabaseClient.storage
        .from(bucket)
        .createSignedUrl(filePath, expiresInSeconds);

      if (error) {
        this.logger.error(`Supabase signed URL error: ${error.message}`);
        throw new Error(`Failed to generate signed URL: ${error.message}`);
      }
      return data.signedUrl;
    } else {
      // Local signed URL mock route format
      return `/api/v1/storage/file/${bucket}/${filePath}`;
    }
  }

  async getFileBuffer(bucket: string, filePath: string): Promise<Buffer> {
    if (this.supabaseClient && !this.isLocalStorage) {
      const { data, error } = await this.supabaseClient.storage
        .from(bucket)
        .download(filePath);

      if (error) {
        throw new Error(`Failed to download file from Supabase: ${error.message}`);
      }
      const arrayBuffer = await data.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } else {
      const fullPath = path.join(this.localStoragePath, bucket, filePath);
      if (!fs.existsSync(fullPath)) {
        throw new Error(`File not found in local storage: ${filePath}`);
      }
      return fs.readFileSync(fullPath);
    }
  }

  async deleteFile(bucket: string, filePath: string): Promise<boolean> {
    if (this.supabaseClient && !this.isLocalStorage) {
      const { error } = await this.supabaseClient.storage
        .from(bucket)
        .remove([filePath]);
      return !error;
    } else {
      const fullPath = path.join(this.localStoragePath, bucket, filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
      return true;
    }
  }
}
