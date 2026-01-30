import {
  Badge,
  Box,
  Divider,
  Heading,
  HStack,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
} from '@chakra-ui/react';
import { AnalyticsItem } from '../../types/analyticsTypes';

type Props = {
  item: AnalyticsItem;
};

const getStatusColorScheme = (status: AnalyticsItem['status']): string => {
  switch (status) {
    case 'COMPLETED':
      return 'green';
    case 'FAILED':
      return 'red';
    case 'IN_PROGRESS':
      return 'blue';
    case 'PENDING':
    default:
      return 'gray';
  }
};

export const AnalysisResultsPanel = ({ item }: Props) => {
  if (item.status === 'FAILED') {
    return (
      <Box borderWidth="1px" borderRadius="lg" p={6} bg="red.50">
        <Heading as="h2" size="md" mb={2}>
          Analysis failed
        </Heading>
        <Text color="red.700">
          {item.errorMessage ?? 'The analysis could not be completed.'}
        </Text>
      </Box>
    );
  }

  if (item.status !== 'COMPLETED' || !item.result) {
    return (
      <Box borderWidth="1px" borderRadius="lg" p={6} bg="gray.50">
        <Heading as="h2" size="md" mb={2}>
          Analysis in progress
        </Heading>
        <Text color="gray.600">
          Results will appear once processing is complete.
        </Text>
      </Box>
    );
  }

  return (
    <VStack align="stretch" spacing={6}>
      <Box borderWidth="1px" borderRadius="lg" p={{ base: 4, md: 5 }}>
        <VStack align="stretch" spacing={4}>
          <HStack justify="space-between" align="center">
            <Heading as="h2" size="md">
              Summary
            </Heading>
            <Badge
              colorScheme={getStatusColorScheme(item.status)}
              variant="subtle"
              px={3}
              py={1}
              borderRadius="full"
              fontSize="xs"
            >
              {item.status.split('_').join(' ')}
            </Badge>
          </HStack>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} w="full">
            <Box borderRight={{ base: 'none', md: '1px solid' }} borderColor="gray.200" pr={{ md: 4 }}>
              <Stat>
                <StatLabel color="gray.600">Total words</StatLabel>
                <StatNumber fontSize="2xl">{item.result.totalWords}</StatNumber>
              </Stat>
            </Box>
            <Box
              borderRight={{ base: 'none', md: '1px solid' }}
              borderColor="gray.200"
              px={{ md: 4 }}
            >
              <Stat>
                <StatLabel color="gray.600">Unique words</StatLabel>
                <StatNumber fontSize="2xl">{item.result.uniqueWords}</StatNumber>
              </Stat>
            </Box>
            <Box pl={{ md: 4 }}>
              <Stat>
                <StatLabel color="gray.600">Average word length</StatLabel>
                <StatNumber fontSize="2xl">
                  {item.result.avgWordLength.toFixed(2)}
                </StatNumber>
              </Stat>
            </Box>
          </SimpleGrid>
        </VStack>
      </Box>

      <Divider />

      <Box>
        <Heading as="h3" size="sm" mb={3}>
          Top words
        </Heading>
        {item.result.top10Words && item.result.top10Words.length > 0 ? (
          <TableContainer borderWidth="1px" borderRadius="lg">
            <Table size="sm">
              <Thead bg="gray.50">
                <Tr>
                  <Th fontWeight="semibold" color="gray.700">Word</Th>
                  <Th isNumeric fontWeight="semibold" color="gray.700">
                    Count
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {item.result.top10Words.map((entry, index) => (
                  <Tr
                    key={entry.word}
                    bg={index % 2 === 0 ? 'white' : 'gray.50'}
                    _hover={{ bg: 'blue.50' }}
                  >
                    <Td>{entry.word}</Td>
                    <Td isNumeric>{entry.count}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        ) : (
          <Text color="gray.500" fontSize="sm">
            No top words available.
          </Text>
        )}
      </Box>
    </VStack>
  );
};

export default AnalysisResultsPanel;
