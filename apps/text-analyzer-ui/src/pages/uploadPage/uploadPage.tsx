import { useState } from 'react';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Heading,
  Progress,
  Text,
  VStack,
} from '@chakra-ui/react';
import { UploadFile } from '../../components/uploadFile/uploadFile';
import { uploadFileToS3 } from '../../services/uploadToS3Service';

type UploadStatus = 'idle' | 'presigning' | 'uploading' | 'success' | 'error';

export function UploadPage() {
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);

  const onUploadFile = async (file: File) => {
    try {
      setErrorMessage('');
      setUploadProgress(0);
      setUploadStatus('presigning');
      await uploadFileToS3(file, (progressPercent) => {
        setUploadStatus('uploading');
        setUploadProgress(progressPercent);
      });
      setUploadStatus('success');
      setUploadProgress(100);
      alert('File uploaded successfully!');
    } catch (error: unknown) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setUploadProgress(0);
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('An unknown error occurred during file upload.');
      }
    }
  };

  const onUploadFileError = (error: Error) => {
    console.error('Upload error:', error);
    setUploadStatus('error');
    setUploadProgress(0);
    setErrorMessage(error.message);
  };

  const isBusy = uploadStatus === 'presigning' || uploadStatus === 'uploading';
  const showProgress = uploadStatus !== 'idle';
  const statusMessage =
    uploadStatus === 'presigning'
      ? 'Preparing upload...'
      : uploadStatus === 'uploading'
        ? `Uploading... ${uploadProgress}%`
        : uploadStatus === 'success'
          ? 'Upload complete.'
          : uploadStatus === 'error'
            ? 'Upload failed.'
            : '';

  return (
    <VStack spacing={6} align="stretch">
      <Box as="section">
        <Heading as="h1" size="lg" mb={2}>
          Analyze Your Text
        </Heading>
        <Text color="gray.600" fontSize="sm">
          Upload a .txt file to analyze word frequency, unique words, and more.
        </Text>
      </Box>

      <Box as="section">
        <UploadFile
          onUpload={onUploadFile}
          onUploadError={onUploadFileError}
          isBusy={isBusy}
        />
      </Box>

      {showProgress && (
        <Box as="section" aria-live="polite">
          <Text fontSize="sm" color="gray.600" mb={2}>
            {statusMessage}
          </Text>
          <Progress
            value={uploadStatus === 'uploading' ? uploadProgress : undefined}
            isIndeterminate={uploadStatus === 'presigning'}
            size="sm"
            colorScheme={uploadStatus === 'error' ? 'red' : 'blue'}
            borderRadius="md"
          />
        </Box>
      )}

      <Box as="section" aria-live="polite">
        {errorMessage && (
          <Alert status="error" variant="left-accent">
            <AlertIcon />
            <AlertTitle>Upload failed</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
      </Box>
    </VStack>
  );
}

export default UploadPage;
