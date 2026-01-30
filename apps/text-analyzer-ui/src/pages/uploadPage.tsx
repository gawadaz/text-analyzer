import { useEffect, useState } from 'react';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Badge,
  Button,
  Heading,
  HStack,
  Progress,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { UploadFile } from '../components/uploadFile/uploadFile';
import { PageTabs } from '../components/pageTabs/pageTabs';
import { RecentUploadsPanel } from '../components/recentUploadsPanel/recentUploadsPanel';
import { fetchCurrentOwnerAnalytics } from '../services/analyticsService';
import { uploadFileToS3 } from '../services/uploadToS3Service';
import { AnalyticsItem } from '../types/analyticsTypes';

type UploadStatus = 'idle' | 'ready' | 'presigning' | 'uploading' | 'success' | 'error';

export function UploadPage() {
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [lastUploadedFileName, setLastUploadedFileName] = useState<string | null>(null);
  const [recentUploads, setRecentUploads] = useState<AnalyticsItem[]>([]);
  const [recentUploadsLoading, setRecentUploadsLoading] = useState(false);
  const [recentUploadsError, setRecentUploadsError] = useState('');

  const loadRecentUploads = async () => {
    setRecentUploadsLoading(true);
    setRecentUploadsError('');
    try {
      const items = await fetchCurrentOwnerAnalytics();
      const sortedItems = [...items].sort((first, second) => second.updatedAt - first.updatedAt);
      setRecentUploads(sortedItems.slice(0, 3));
    } catch (error: unknown) {
      if (error instanceof Error) {
        setRecentUploadsError(error.message);
      } else {
        setRecentUploadsError('Failed to load recent uploads.');
      }
    } finally {
      setRecentUploadsLoading(false);
    }
  };

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
      await loadRecentUploads();
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

  const isDuplicateUpload = errorMessage.toLowerCase().includes('already uploaded');
  const errorTitle = isDuplicateUpload ? 'File already uploaded' : 'Upload failed';
  const errorDescription = isDuplicateUpload
    ? 'This file was already uploaded. View it in history or choose a different file.'
    : errorMessage;
  useEffect(() => {
    void loadRecentUploads();
  }, []);

  return (
    <VStack spacing={5} align="stretch">
      <Box as="section">
        <HStack justify="space-between" align="start" spacing={4} flexWrap="wrap">
          <Box>
            <HStack spacing={3} align="center" flexWrap="wrap" mb={2}>
              <Heading as="h1" size="xl">
                Analyze Your Text
              </Heading>
              <Badge colorScheme="blue" variant="subtle" borderRadius="full" px={3}>
                .txt only
              </Badge>
            </HStack>
            <Text color="gray.600" fontSize="md">
              Upload a .txt file to analyze word frequency, unique words, and more.
            </Text>
          </Box>
          <PageTabs active="upload" />
        </HStack>
      </Box>

      <Box as="section" maxW="960px" w="full">
        <UploadFile
          onSelect={onFileSelected}
          onSelectError={onFileSelectError}
          isBusy={isBusy}
        />
      </Box>

      {selectedFile && (
        <Box
          as="section"
          aria-live="polite"
          maxW="960px"
          w="full"
          borderWidth="1px"
          borderRadius="lg"
          bg="gray.50"
          p={{ base: 4, md: 5 }}
        >
          <VStack align="start" spacing={4}>
            <HStack spacing={2}>
              <Text fontWeight="semibold" fontSize="md">
                Selected file
              </Text>
              <Badge colorScheme="blue" variant="subtle" borderRadius="full" px={2}>
                Ready
              </Badge>
            </HStack>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} w="full">
              <Box>
                <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wider">
                  File name
                </Text>
                <Text fontSize="sm" fontWeight="semibold" color="gray.800">
                  {selectedFile.name}
                </Text>
              </Box>
              <Box>
                <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wider">
                  Size
                </Text>
                <Text fontSize="sm" fontWeight="semibold" color="gray.800">
                  {Math.ceil(selectedFile.size / 1024)} KB
                </Text>
              </Box>
              <Box>
                <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wider">
                  Last modified
                </Text>
                <Text fontSize="sm" fontWeight="semibold" color="gray.800">
                  {new Date(selectedFile.lastModified).toLocaleString()}
                </Text>
              </Box>
            </SimpleGrid>
            <HStack spacing={3} pt={1} flexWrap="wrap">
              <Button
                colorScheme="blue"
                onClick={onStartUpload}
                isLoading={uploadStatus === 'presigning'}
                loadingText="Preparing"
                isDisabled={isBusy}
              >
                Upload file
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setSelectedFile(null);
                  setUploadStatus('idle');
                  setUploadProgress(0);
                  setErrorMessage('');
                  setLastUploadedFileName(null);
                }}
                isDisabled={isBusy}
              >
                Clear selection
              </Button>
            </HStack>
          </VStack>
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
          <Box
            maxW="960px"
            w="full"
            borderWidth="1px"
            borderRadius="lg"
            borderColor="red.200"
            bg="red.50"
            p={{ base: 4, md: 5 }}
          >
            <Alert status="error" variant="left-accent" bg="transparent" p={0}>
              <AlertIcon />
              <Box>
                <AlertTitle>{errorTitle}</AlertTitle>
                <AlertDescription>{errorDescription}</AlertDescription>
              </Box>
            </Alert>
            <HStack spacing={3} mt={4} flexWrap="wrap">
              <Button
                as={RouterLink}
                to="/history"
                size="sm"
                variant="outline"
                colorScheme="red"
              >
                View history
              </Button>
              <Button
                size="sm"
                colorScheme="red"
                onClick={() => {
                  setSelectedFile(null);
                  setUploadStatus('idle');
                  setUploadProgress(0);
                  setErrorMessage('');
                  setLastUploadedFileName(null);
                }}
                isDisabled={isBusy}
              >
                Choose a different file
              </Button>
            </HStack>
          </Box>
        )}
        {uploadStatus === 'success' && !errorMessage && (
          <Alert
            status="success"
            variant="left-accent"
            py={2}
            px={3}
            minH="auto"
            maxW="960px"
            w="full"
          >
            <AlertIcon boxSize={4} mt={0.5} />
            <Box minW={0}>
              <AlertTitle fontSize="sm" lineHeight="short">
                Upload complete
              </AlertTitle>
              <AlertDescription as={Box} mt={0.5}>
                {lastUploadedFileName ? (
                  <Text
                    fontSize="xs"
                    color="gray.600"
                    noOfLines={1}
                    title={lastUploadedFileName}
                  >
                    {lastUploadedFileName}
                  </Text>
                ) : (
                  <Text fontSize="xs" color="gray.600">
                    File uploaded successfully.
                  </Text>
                )}
              </AlertDescription>
            </Box>
          </Alert>
        )}
      </Box>

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
