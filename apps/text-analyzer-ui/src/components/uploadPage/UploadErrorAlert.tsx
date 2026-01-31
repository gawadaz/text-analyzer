import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  HStack,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

type Props = {
  errorMessage: string;
  errorTitle: string;
  errorDescription: string;
  isBusy: boolean;
  onChooseDifferent: () => void;
};

export function UploadErrorAlert({
  errorMessage,
  errorTitle,
  errorDescription,
  isBusy,
  onChooseDifferent,
}: Props) {
  if (!errorMessage) {
    return null;
  }

  return (
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
        <Button as={RouterLink} to="/history" size="sm" variant="outline" colorScheme="red">
          View history
        </Button>
        <Button size="sm" colorScheme="red" onClick={onChooseDifferent} isDisabled={isBusy}>
          Choose a different file
        </Button>
      </HStack>
    </Box>
  );
}

export default UploadErrorAlert;
