// ──────────────────────────────────────────────────────────────────────────────
// apps/api/src/listings/r2.service.ts
//
// Cloudflare R2 integration via S3-compatible API.
// - Presigned PUT URLs for direct browser-to-R2 uploads (no API bandwidth cost)
// - DeleteObject for media cleanup
// ──────────────────────────────────────────────────────────────────────────────

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomBytes } from 'crypto';
import type { PresignedUrlResponse } from '@rentnear/types';

@Injectable()
export class R2Service {
  private readonly logger = new Logger(R2Service.name);
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(private readonly config: ConfigService) {
    const accountId = this.config.get<string>('R2_ACCOUNT_ID', '');
    const accessKeyId = this.config.get<string>('R2_ACCESS_KEY_ID', '');
    const secretAccessKey = this.config.get<string>('R2_SECRET_ACCESS_KEY', '');

    this.bucket = this.config.get<string>('R2_BUCKET_NAME', 'rentnear-dev');
    this.publicUrl = this.config.get<string>('R2_PUBLIC_URL', 'http://localhost:9000/rentnear-dev');

    this.s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    });
  }

  /**
   * Generate a presigned PUT URL valid for 5 minutes.
   * The client uploads the file directly to R2 — zero API bandwidth cost.
   */
  async getPresignedPutUrl(
    prefix: string,
    contentType = 'image/jpeg',
  ): Promise<PresignedUrlResponse> {
    const ext = contentType === 'image/png' ? 'png' : 'jpg';
    const r2Key = `${prefix}/${randomBytes(16).toString('hex')}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: r2Key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn: 300 });
    const publicUrl = `${this.publicUrl}/${r2Key}`;

    this.logger.debug(`Generated presigned PUT URL for key: ${r2Key}`);

    return { uploadUrl, r2Key, publicUrl };
  }

  /**
   * Delete an object from R2 by key.
   * Called when a media record is removed from the DB.
   */
  async deleteObject(r2Key: string): Promise<void> {
    try {
      await this.s3.send(
        new DeleteObjectCommand({ Bucket: this.bucket, Key: r2Key }),
      );
      this.logger.debug(`Deleted R2 object: ${r2Key}`);
    } catch (err) {
      // Log but don't throw — DB record should still be cleaned up
      this.logger.error(`Failed to delete R2 object ${r2Key}:`, err);
    }
  }
}
