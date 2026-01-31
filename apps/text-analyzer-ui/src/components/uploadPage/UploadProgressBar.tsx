import { Box, Progress, Text } from '@chakra-ui/react';

type Props = {
  isVisible: boolean;
  message: string;
  progress: number;
};

export function UploadProgressBar({ isVisible, message, progress }: Props) {
  if (!isVisible) {
    return null;
  }

  return (
    <Box as="section" aria-live="polite">
      <Text fontSize="sm" color="gray.600" mb={2}>
        {message}
      </Text>
      <Progress value={progress} size="sm" colorScheme="blue" borderRadius="md" />
    </Box>
  );
}

export default UploadProgressBar;
