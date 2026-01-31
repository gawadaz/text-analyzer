import { useCallback, useState } from 'react';

type UseFileSelectionOptions = {
  onSelectError?: (error: Error) => void;
};

type UseFileSelectionResult = {
  selectedFile: File | null;
  lastUploadedFileName: string | null;
  onFileSelected: (file: File) => void;
  onFileSelectError: (error: Error) => void;
  clearSelection: () => void;
  markUploadSuccess: (fileName: string) => void;
};

/**
 * Handles file selection state and success metadata.
 */
export const useFileSelection = (
  options: UseFileSelectionOptions = {}
): UseFileSelectionResult => {
  const { onSelectError } = options;
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [lastUploadedFileName, setLastUploadedFileName] = useState<string | null>(null);

  const onFileSelected = useCallback((file: File) => {
    setSelectedFile(file);
    setLastUploadedFileName(null);
  }, []);

  const onFileSelectError = useCallback(
    (error: Error) => {
      setSelectedFile(null);
      onSelectError?.(error);
    },
    [onSelectError]
  );

  const clearSelection = useCallback(() => {
    setSelectedFile(null);
    setLastUploadedFileName(null);
  }, []);

  const markUploadSuccess = useCallback((fileName: string) => {
    setLastUploadedFileName(fileName);
    setSelectedFile(null);
  }, []);

  return {
    selectedFile,
    lastUploadedFileName,
    onFileSelected,
    onFileSelectError,
    clearSelection,
    markUploadSuccess,
  };
};
