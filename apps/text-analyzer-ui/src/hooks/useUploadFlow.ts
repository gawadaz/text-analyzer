import { useCallback, useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { uploadFileToS3 } from '../services/uploadToS3Service';

type UploadStatus = 'idle' | 'ready' | 'presigning' | 'uploading' | 'success' | 'error';

type UseUploadFlowResult = {
  errorMessage: string;
  uploadStatus: UploadStatus;
  uploadProgress: number;
  selectedFile: File | null;
  lastUploadedFileName: string | null;
  isBusy: boolean;
  showProgress: boolean;
  statusMessage: string;
  errorTitle: string;
  errorDescription: string;
  onFileSelected: (file: File) => void;
  onFileSelectError: (error: Error) => void;
  onStartUpload: () => Promise<void>;
  clearSelection: () => void;
};

type UseUploadFlowOptions = {
  onUploadSuccess?: () => Promise<void>;
};

const normalizeErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
};

/**
 * Coordinates file upload, progress state, and recent history refresh.
 */
export const useUploadFlow = (options: UseUploadFlowOptions = {}): UseUploadFlowResult => {
  const { onUploadSuccess } = options;
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [lastUploadedFileName, setLastUploadedFileName] = useState<string | null>(null);

  const resetUploadState = useCallback(() => {
    setSelectedFile(null);
    setUploadStatus('idle');
    setUploadProgress(0);
    setErrorMessage('');
    setLastUploadedFileName(null);
  }, []);

  const handleUploadError = useCallback((error: unknown) => {
    console.error('Upload error:', error);
    setUploadStatus('error');
    setUploadProgress(0);
    setErrorMessage(normalizeErrorMessage(error, 'An unknown error occurred during file upload.'));
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
      setLastUploadedFileName(file.name);
      if (onUploadSuccess) {
        await onUploadSuccess();
      }
      setSelectedFile(null);
    },
    onError: handleUploadError,
  });

  const onUploadFile = useCallback(
    async (file: File) => {
      await uploadMutation.mutateAsync(file);
    },
    [uploadMutation]
  );

  const onFileSelected = useCallback((file: File) => {
    setSelectedFile(file);
    setLastUploadedFileName(null);
    setErrorMessage('');
    setUploadProgress(0);
    setUploadStatus('ready');
  }, []);

  const onFileSelectError = useCallback(
    (error: Error) => {
      setSelectedFile(null);
      handleUploadError(error);
    },
    [handleUploadError]
  );

  const isBusy = uploadStatus === 'presigning' || uploadStatus === 'uploading';

  const onStartUpload = useCallback(async () => {
    if (!selectedFile || isBusy) {
      return;
    }
    await onUploadFile(selectedFile);
  }, [isBusy, onUploadFile, selectedFile]);

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
    selectedFile,
    lastUploadedFileName,
    isBusy,
    showProgress,
    statusMessage,
    errorTitle,
    errorDescription,
    onFileSelected,
    onFileSelectError,
    onStartUpload,
    clearSelection: resetUploadState,
  };
};
