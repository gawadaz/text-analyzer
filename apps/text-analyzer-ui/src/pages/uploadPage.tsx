import { Box, VStack } from '@chakra-ui/react';
import { UploadFile } from '../components/uploadFile/uploadFile';
import { RecentUploadsPanel } from '../components/recentUploadsPanel/recentUploadsPanel';
import { UploadHeader } from '../components/uploadPage/UploadHeader';
import { SelectedFileCard } from '../components/uploadPage/SelectedFileCard';
import { UploadProgressBar } from '../components/uploadPage/UploadProgressBar';
import { useFileSelection } from '../hooks/useFileSelection';
import { useFileUpload } from '../hooks/useFileUpload';
import { useRecentUploads } from '../hooks/useRecentUploads';
import UploadSuccessAlert from '../components/uploadPage/UploadSuccessAlert';
import UploadErrorAlert from '../components/uploadPage/UploadErrorAlert';

export function UploadPage() {
  const {
    items: recentUploads,
    isLoading: recentUploadsLoading,
    errorMessage: recentUploadsError,
    refresh: refreshRecentUploads,
  } = useRecentUploads();
  
  const {
    selectedFile,
    lastUploadedFileName,
    onFileSelected,
    onFileSelectError,
    clearSelection,
    markUploadSuccess,
  } = useFileSelection();

  const {
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
  } = useFileUpload({
    onUploadSuccess: async (file) => {
      markUploadSuccess(file.name);
      await refreshRecentUploads();
    },
  });

  const handleFileSelected = (file: File) => {
    onFileSelected(file);
    prepareForUpload();
  };

  const handleFileSelectError = (error: Error) => {
    onFileSelectError(error);
    setSelectionError(error);
  };

  const handleClearSelection = () => {
    clearSelection();
    resetUploadState();
  };

  const handleStartUpload = async () => {
    if (!selectedFile || isBusy) {
      return;
    }
    await startUpload(selectedFile);
  };

  return (
    <VStack spacing={5} align="stretch">
      <UploadHeader />

      <Box as="section" maxW="960px" w="full">
        <UploadFile
          onSelect={handleFileSelected}
          onSelectError={handleFileSelectError}
          isBusy={isBusy}
        />
      </Box>

      {selectedFile && (
        <SelectedFileCard
          file={selectedFile}
          isBusy={isBusy}
          isPreparing={uploadStatus === 'presigning'}
          onUpload={handleStartUpload}
          onClear={handleClearSelection}
        />
      )}

      <UploadProgressBar
        isVisible={showProgress}
        message={statusMessage}
        progress={uploadProgress}
      />

      {uploadStatus === 'success' && lastUploadedFileName && (
        <UploadSuccessAlert
          lastUploadedFileName={lastUploadedFileName}
          isSuccess={true}
        />
      )}

      {errorMessage && (
        <UploadErrorAlert
          errorMessage={errorMessage}
          errorTitle={errorTitle}
          errorDescription={errorDescription}
          isBusy={isBusy}
          onChooseDifferent={handleClearSelection}
        />
      )}

      <Box as="section" maxW="960px" w="full">
        <RecentUploadsPanel
          items={recentUploads}
          isLoading={recentUploadsLoading}
          errorMessage={recentUploadsError}
        />
      </Box>
    </VStack>
  );
}

export default UploadPage;
