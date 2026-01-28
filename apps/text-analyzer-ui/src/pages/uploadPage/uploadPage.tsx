import { useState } from 'react';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Heading,
  Text,
  VStack,
} from '@chakra-ui/react';
import { UploadFile } from '../../components/uploadFile/uploadFile';

export function UploadPage() {

  const [errorMessage, setErrorMessage] = useState("");

  const onUploadFile = (file: File) => {
    // Handle file upload
    console.log('File uploaded:', file);
  };

  const onUploadFileError = (error: Error) => {
    console.error('Upload error:', error);
    setErrorMessage(error.message);
  };

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
        <UploadFile onUpload={onUploadFile} onUploadError={onUploadFileError} />
      </Box>

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
