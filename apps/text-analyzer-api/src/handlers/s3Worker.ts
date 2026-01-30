import { S3Event } from 'aws-lambda';
import { analyzeS3Object } from '../services/analyticsService';
import { getFileMetadataItem, markFileProcessingInProgress, updateFileMetadataItemStatus } from '../services/dynamoDB';

const decodeS3Key = (key: string): string => decodeURIComponent(key.replace(/\+/g, ' '));

const extractFileIdFromKey = (key: string): string => {
  const decodedKey = decodeS3Key(key);
  const lastSegment = decodedKey.split('/').pop();
  if (!lastSegment) {
    throw new Error('Invalid S3 key format');
  }

  const match = lastSegment.match(/^([a-f0-9]{64})-/i);
  if (!match) {
    throw new Error('Unable to extract fileId from S3 key');
  }

  return match[1];
};

export const handler = async (event: S3Event): Promise<void> => {
  for (const record of event.Records ?? []) {
    const bucket = record.s3?.bucket?.name;
    const objectKey = record.s3?.object?.key;

    if (!bucket || !objectKey) {
      console.warn('Skipping record with missing bucket or key');
      continue;
    }

    const key = decodeS3Key(objectKey);
    let fileId: string;
    try {
      fileId = extractFileIdFromKey(key);
    } catch (error) {
      console.warn('Skipping record with invalid key format', { key, error });
      continue;
    }

    const metadata = await getFileMetadataItem(fileId);
    if (!metadata) {
      console.warn('No metadata found for fileId', { fileId, key });
      continue;
    }

    if (metadata.status === 'COMPLETED') {
      console.info('File already processed, skipping', { fileId, key });
      continue;
    }

    if (metadata.status === 'IN_PROGRESS') {
      console.info('File is already in progress, skipping', { fileId, key });
      continue;
    }

    const canProcess = await markFileProcessingInProgress(fileId, metadata.ownerId);
    if (!canProcess) {
      console.info('Processing already claimed by another worker, skipping', { fileId, key });
      continue;
    }

    try {
      const result = await analyzeS3Object(metadata.s3Bucket, metadata.s3Key);
      await updateFileMetadataItemStatus(fileId, 'COMPLETED', undefined, metadata.ownerId, result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to process file', { fileId, key, message });
      await updateFileMetadataItemStatus(fileId, 'FAILED', message, metadata.ownerId);
    }
  }
};
