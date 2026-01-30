import axios from 'axios';
import axiosClient from '../axiosClient';
import { PresignResponse } from '../types/uploadTypes';

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
): Promise<{ uploadUrl: string; key: string }> => {
  const response = await axiosClient.post('/uploads/presign', {
    fileName,
    contentType: fileType,
    ownerId,
  });
  if (response.status !== 200) {
    throw new Error(`Failed to get presigned URL: ${response.statusText}`);
  }
  const data = response.data.data as PresignResponse;
  return {
    uploadUrl: data.uploadUrl,
    key: data.key,
  };
};

export const uploadFileToS3 = async (
  file: File,
  onProgress?: (progressPercent: number) => void,
): Promise<void> => {
  const ownerId = getOrCreateOwnerId();  
  const { uploadUrl, key } = await presignFileUpload(file.name, file.type, ownerId);

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

  console.log(`File uploaded successfully with key: ${key}`);
};
