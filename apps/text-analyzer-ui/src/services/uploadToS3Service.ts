import axios from 'axios';
import axiosClient from '../axiosClient';
import { PresignRequest, PresignResponse } from '../types/uploadTypes';
import { createFileFingerprintHash } from '../utils/hashFingerprint';
import { cacheFingerprint, isFingerprintCached } from './uploadFingerprintCache';

function getOrCreateOwnerId(): string {
  const key = "text-analyzer-owner-id";
  let ownerId = localStorage.getItem(key);

  if (!ownerId) {
    ownerId = `anon_${crypto.randomUUID()}`;
    localStorage.setItem(key, ownerId);
  }

  return ownerId;
}

const presignFileUpload = async (
  fileName: string,
  fileType: string,
  ownerId: string,
  fingerprintHash: string,
): Promise<{ uploadUrl: string; key: string }> => {
  try {
    const payload: PresignRequest = {
      fileName,
      contentType: fileType,
      ownerId,
      fingerprintHash,
    };
    const response = await axiosClient.post('/uploads/presign', payload);
    if (response.status !== 200) {
      throw new Error(`Failed to get presigned URL: ${response.statusText}`);
    }
    const data = response.data.data as PresignResponse;
    return {
      uploadUrl: data.uploadUrl,
      key: data.key,
    };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status;
      const message =
        (error.response?.data as { error?: { message?: string } } | undefined)?.error
          ?.message ?? 'Failed to get presigned URL.';
      const presignError = new Error(message) as Error & {
        statusCode?: number;
        existingFileId?: string;
      };
      presignError.statusCode = statusCode;
      presignError.existingFileId =
        (error.response?.data as { error?: { fileId?: string } } | undefined)?.error
          ?.fileId;
      throw presignError;
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Failed to get presigned URL.');
  }
};

export const uploadFileToS3 = async (
  file: File,
  onProgress?: (progressPercent: number) => void,
): Promise<void> => {
  const ownerId = getOrCreateOwnerId();
  const fingerprintHash = await createFileFingerprintHash(file);

  if (isFingerprintCached(ownerId, fingerprintHash)) {
    throw new Error('You already uploaded this file.');
  }

  let uploadUrl: string;
  let key: string;
  try {
    const presignResult = await presignFileUpload(
      file.name,
      file.type,
      ownerId,
      fingerprintHash,
    );
    uploadUrl = presignResult.uploadUrl;
    key = presignResult.key;
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      (error as { statusCode?: number }).statusCode === 409
    ) {
      cacheFingerprint(ownerId, fingerprintHash);
    }
    throw error;
  }

  // Upload the file to S3 using the presigned URL
  const response = await axios.put(uploadUrl, file, {
    headers: {
      'Content-Type': file.type,
    },
    onUploadProgress: (event) => {
      if (!onProgress) {
        return;
      }
      const total = event.total ?? 0;
      if (total > 0) {
        const percent = Math.round((event.loaded / total) * 100);
        onProgress(percent);
      } else {
        onProgress(0);
      }
    },
  });

  if (response.status < 200 || response.status >= 300) {
    throw new Error(`File upload failed: ${response.statusText}`);
  }

  cacheFingerprint(ownerId, fingerprintHash);

  console.log(`File uploaded successfully with key: ${key}`);
};
