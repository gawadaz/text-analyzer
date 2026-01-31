import { Badge, Box, Heading, HStack, Text } from '@chakra-ui/react';
import { PageTabs } from '../pageTabs/pageTabs';

export function UploadHeader() {
  return (
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
  );
}

export default UploadHeader;
