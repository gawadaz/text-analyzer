import { Alert, AlertDescription, AlertIcon, AlertTitle, Box, Text } from '@chakra-ui/react';

type Props = {
  lastUploadedFileName: string | null;
  isSuccess: boolean;
};

export function UploadSuccessAlert({ lastUploadedFileName, isSuccess }: Props) {
  if (!isSuccess) {
    return null;
  }

  return (
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
            <Text fontSize="xs" color="gray.600" noOfLines={1} title={lastUploadedFileName}>
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
  );
}

export default UploadSuccessAlert;
