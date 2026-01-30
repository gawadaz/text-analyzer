import {
  Badge,
  Box,
  Link as ChakraLink,
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
import { Link as RouterLink } from 'react-router-dom';
import { AnalyticsItem } from '../../types/analyticsTypes';

type Props = {
  items: AnalyticsItem[];
};

const formatTimestamp = (timestamp: number): string =>
  new Date(timestamp).toLocaleString();

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

const getTopWordSummary = (item: AnalyticsItem): string => {
  const topWord = item.result?.top10Words?.[0];
  if (!topWord) {
    return 'Top word: —';
  }
  return `Top word: ${topWord.word} (${topWord.count})`;
};

export const AnalyticsHistoryTable = ({ items }: Props) => {
  return (
    <TableContainer borderWidth="1px" borderRadius="lg">
      <Table variant="simple" size="sm">
        <Thead bg="gray.50">
          <Tr>
            <Th>File</Th>
            <Th>Date</Th>
            <Th>Status</Th>
            <Th>Summary</Th>
          </Tr>
        </Thead>
        <Tbody>
          {items.map((item) => (
            <Tr key={item.fileId}>
              <Td>
                <VStack align="start" spacing={0}>
                  <ChakraLink
                    as={RouterLink}
                    to={`/history/${item.fileId}`}
                    fontWeight="semibold"
                    color="blue.600"
                  >
                    {item.originalFileName}
                  </ChakraLink>
                  <Text fontSize="xs" color="gray.500">
                    ID: {item.fileId}
                  </Text>
                </VStack>
              </Td>
              <Td>
                <Text fontSize="sm" color="gray.700">
                  {formatTimestamp(item.updatedAt)}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  Uploaded {formatTimestamp(item.createdAt)}
                </Text>
              </Td>
              <Td>
                <Badge colorScheme={getStatusColorScheme(item.status)}>
                  {item.status.split('_').join(' ')}
                </Badge>
              </Td>
              <Td>
                <Box>
                  {item.status === 'COMPLETED' && item.result ? (
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" color="gray.700">
                        Total words: {item.result.totalWords}
                      </Text>
                      <Text fontSize="sm" color="gray.700">
                        {getTopWordSummary(item)}
                      </Text>
                    </VStack>
                  ) : item.status === 'FAILED' ? (
                    <Text fontSize="sm" color="red.600">
                      {item.errorMessage ?? 'Analysis failed.'}
                    </Text>
                  ) : (
                    <Text fontSize="sm" color="gray.500">
                      Results pending.
                    </Text>
                  )}
                </Box>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};

export default AnalyticsHistoryTable;
