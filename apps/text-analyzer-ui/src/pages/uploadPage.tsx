import { useState } from 'react';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Heading,
  HStack,
  Progress,
  Text,
  VStack,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { UploadFile } from '../components/uploadFile/uploadFile';
import { uploadFileToS3 } from '../services/uploadToS3Service';

type UploadStatus = 'idle' | 'ready' | 'presigning' | 'uploading' | 'success' | 'error';

export function UploadPage() {
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [lastUploadedFileName, setLastUploadedFileName] = useState<string | null>(null);

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
      setLastUploadedFileName(file.name);
      setSelectedFile(null);
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

  const onFileSelected = (file: File) => {
    setSelectedFile(file);
    setLastUploadedFileName(null);
    setErrorMessage('');
    setUploadProgress(0);
    setUploadStatus('ready');
  };

  const onFileSelectError = (error: Error) => {
    setSelectedFile(null);
    onUploadFileError(error);
  };

  const onStartUpload = async () => {
    if (!selectedFile || isBusy) {
      return;
    }
    await onUploadFile(selectedFile);
  };

  const isBusy = uploadStatus === 'presigning' || uploadStatus === 'uploading';
  const showProgress = uploadStatus === 'uploading';
  const statusMessage =
    uploadStatus === 'uploading'
      ? `Uploading... ${uploadProgress}%`
      : '';

  return (
    <VStack spacing={6} align="stretch">
      <Box as="section">
        <HStack justify="space-between" align="start" spacing={4} flexWrap="wrap">
          <Box>
            <Heading as="h1" size="lg" mb={2}>
              Analyze Your Text
            </Heading>
            <Text color="gray.600" fontSize="sm">
              Upload a .txt file to analyze word frequency, unique words, and more.
            </Text>
          </Box>
          <Button as={RouterLink} to="/history" variant="outline" colorScheme="gray">
            View history
          </Button>
        </HStack>
      </Box>

      <Box as="section">
        <UploadFile
          onSelect={onFileSelected}
          onSelectError={onFileSelectError}
          isBusy={isBusy}
        />
      </Box>

      {selectedFile && (
        <Box as="section" aria-live="polite">
          <VStack align="start" spacing={2} mb={4}>
            <Text fontWeight="semibold">Selected file</Text>
            <Text fontSize="sm" color="gray.600">
              Name: {selectedFile.name}
            </Text>
            <Text fontSize="sm" color="gray.600">
              Size: {Math.ceil(selectedFile.size / 1024)} KB
            </Text>
            <Text fontSize="sm" color="gray.600">
              Last modified: {new Date(selectedFile.lastModified).toLocaleString()}
            </Text>
          </VStack>
          <HStack spacing={3}>
            <Button
              colorScheme="blue"
              onClick={onStartUpload}
              isLoading={uploadStatus === 'presigning'}
              loadingText="Preparing"
              isDisabled={isBusy}
            >
              Upload file
            </Button>
            <Button variant="ghost" onClick={() => {
              setSelectedFile(null);
              setUploadStatus('idle');
              setUploadProgress(0);
              setErrorMessage('');
              setLastUploadedFileName(null);
            }} isDisabled={isBusy}>
              Clear selection
            </Button>
          </HStack>
        </Box>
      )}

      {showProgress && (
        <Box as="section" aria-live="polite">
          <Text fontSize="sm" color="gray.600" mb={2}>
            {statusMessage}
          </Text>
          <Progress
            value={uploadStatus === 'uploading' ? uploadProgress : undefined}
            size="sm"
            colorScheme="blue"
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
        {uploadStatus === 'success' && !errorMessage && (
          <Alert status="success" variant="left-accent">
            <AlertIcon />
            <AlertTitle>Upload complete</AlertTitle>
            <AlertDescription>
              {lastUploadedFileName
                ? `File uploaded successfully: ${lastUploadedFileName}.`
                : 'File uploaded successfully.'}
            </AlertDescription>
          </Alert>
        )}
      </Box>
    </VStack>
  );
}

export default UploadPage;
