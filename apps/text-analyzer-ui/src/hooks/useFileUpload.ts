import { useCallback, useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { uploadFileToS3 } from '../services/uploadToS3Service';

type UploadStatus = 'idle' | 'ready' | 'presigning' | 'uploading' | 'success' | 'error';

type UseFileUploadOptions = {
  onUploadSuccess?: (file: File) => Promise<void> | void;
};

type UseFileUploadResult = {
  errorMessage: string;
  uploadStatus: UploadStatus;
  uploadProgress: number;
  isBusy: boolean;
  showProgress: boolean;
  statusMessage: string;
  errorTitle: string;
  errorDescription: string;
  startUpload: (file: File) => Promise<void>;
  prepareForUpload: () => void;
  resetUploadState: () => void;
  setSelectionError: (error: Error) => void;
};

const normalizeErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
};

/**
 * Manages file upload lifecycle, progress, and error state.
 */
export const useFileUpload = (options: UseFileUploadOptions = {}): UseFileUploadResult => {
  const { onUploadSuccess } = options;
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);

  const resetUploadState = useCallback(() => {
    setUploadStatus('idle');
    setUploadProgress(0);
    setErrorMessage('');
  }, []);

  const prepareForUpload = useCallback(() => {
    setUploadStatus('ready');
    setUploadProgress(0);
    setErrorMessage('');
  }, []);

  const handleUploadError = useCallback((error: unknown) => {
    console.error('Upload error:', error);
    setUploadStatus('error');
    setUploadProgress(0);
    setErrorMessage(normalizeErrorMessage(error, 'An unknown error occurred during file upload.'));
  }, []);

  const setSelectionError = useCallback((error: Error) => {
    setUploadStatus('error');
    setUploadProgress(0);
    setErrorMessage(normalizeErrorMessage(error, 'An unknown error occurred while selecting the file.'));
  }, []);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      setErrorMessage('');
      setUploadProgress(0);
      setUploadStatus('presigning');
      await uploadFileToS3(file, (progressPercent) => {
        setUploadStatus('uploading');
        setUploadProgress(progressPercent);
      });
      return file;
    },
    onSuccess: async (file) => {
      setUploadStatus('success');
      setUploadProgress(100);
      if (onUploadSuccess) {
        await onUploadSuccess(file);
      }
    },
    onError: handleUploadError,
  });

  const startUpload = useCallback(
    async (file: File) => {
      await uploadMutation.mutateAsync(file);
    },
    [uploadMutation]
  );

  const isBusy = uploadStatus === 'presigning' || uploadStatus === 'uploading';
  const showProgress = uploadStatus === 'uploading';
  const statusMessage = uploadStatus === 'uploading' ? `Uploading... ${uploadProgress}%` : '';

  const isDuplicateUpload = useMemo(
    () => errorMessage.toLowerCase().includes('already uploaded'),
    [errorMessage]
  );
  const errorTitle = isDuplicateUpload ? 'File already uploaded' : 'Upload failed';
  const errorDescription = isDuplicateUpload
    ? 'This file was already uploaded. View it in history or choose a different file.'
    : errorMessage;

  return {
    errorMessage,
    uploadStatus,
    uploadProgress,
    isBusy,
    showProgress,
    statusMessage,
    errorTitle,
    errorDescription,
    startUpload,
    prepareForUpload,
    resetUploadState,
    setSelectionError,
  };
};
