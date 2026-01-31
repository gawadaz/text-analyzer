import { Badge, Box, Button, HStack, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { formatDateTime, formatFileSizeKb } from '../../utils/fileFormatters';

type Props = {
  file: File;
  isBusy: boolean;
  isPreparing: boolean;
  onUpload: () => void;
  onClear: () => void;
};

export function SelectedFileCard({ file, isBusy, isPreparing, onUpload, onClear }: Props) {
  const fileSizeLabel = formatFileSizeKb(file.size);
  const lastModifiedLabel = formatDateTime(file.lastModified);

  return (
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
              {file.name}
            </Text>
          </Box>
          <Box>
            <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wider">
              Size
            </Text>
            <Text fontSize="sm" fontWeight="semibold" color="gray.800">
              {fileSizeLabel}
            </Text>
          </Box>
          <Box>
            <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wider">
              Last modified
            </Text>
            <Text fontSize="sm" fontWeight="semibold" color="gray.800">
              {lastModifiedLabel}
            </Text>
          </Box>
        </SimpleGrid>
        <HStack spacing={3} pt={1} flexWrap="wrap">
          <Button
            colorScheme="blue"
            onClick={onUpload}
            isLoading={isPreparing}
            loadingText="Preparing"
            isDisabled={isBusy}
          >
            Upload file
          </Button>
          <Button variant="ghost" onClick={onClear} isDisabled={isBusy}>
            Clear selection
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}

export default SelectedFileCard;
