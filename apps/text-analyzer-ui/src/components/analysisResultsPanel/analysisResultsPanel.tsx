import {
  Badge,
  Box,
  Divider,
  Heading,
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
      <Box borderWidth="1px" borderRadius="lg" p={6}>
        <VStack align="start" spacing={3}>
          <Heading as="h2" size="md">
            Summary
          </Heading>
          <Badge colorScheme={getStatusColorScheme(item.status)}>
            {item.status.split('_').join(' ')}
          </Badge>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} w="full">
            <Stat>
              <StatLabel>Total words</StatLabel>
              <StatNumber>{item.result.totalWords}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Unique words</StatLabel>
              <StatNumber>{item.result.uniqueWords}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Average word length</StatLabel>
              <StatNumber>{item.result.avgWordLength.toFixed(2)}</StatNumber>
            </Stat>
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
                  <Th>Word</Th>
                  <Th isNumeric>Count</Th>
                </Tr>
              </Thead>
              <Tbody>
                {item.result.top10Words.map((entry) => (
                  <Tr key={entry.word}>
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
