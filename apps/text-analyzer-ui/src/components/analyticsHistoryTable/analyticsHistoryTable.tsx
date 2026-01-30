import {
  Badge,
  Box,
  HStack,
  IconButton,
  Link as ChakraLink,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Tooltip,
  VStack,
} from '@chakra-ui/react';
import { AlertTriangle, CheckCircle2, Clock, Loader2, Trash2 } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import { AnalyticsItem } from '../../types/analyticsTypes';

type Props = {
  items: AnalyticsItem[];
  onDelete: (item: AnalyticsItem) => void;
  deletingIds: Record<string, boolean>;
};

const formatTimestamp = (timestamp: number): string =>
  new Date(timestamp).toLocaleString();

const formatFileId = (fileId: string): string =>
  fileId.length <= 12 ? fileId : `${fileId.slice(0, 8)}…`;

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

const getStatusLabel = (status: AnalyticsItem['status']): string =>
  status.split('_').join(' ');

const getStatusIcon = (status: AnalyticsItem['status']) => {
  switch (status) {
    case 'COMPLETED':
      return <CheckCircle2 size={14} aria-hidden="true" />;
    case 'FAILED':
      return <AlertTriangle size={14} aria-hidden="true" />;
    case 'IN_PROGRESS':
      return <Loader2 size={14} aria-hidden="true" />;
    case 'PENDING':
    default:
      return <Clock size={14} aria-hidden="true" />;
  }
};

const getTopWordSummary = (item: AnalyticsItem): string => {
  const topWord = item.result?.top10Words?.[0];
  if (!topWord) {
    return 'Top word: —';
  }
  return `Top word: ${topWord.word} (${topWord.count})`;
};

export const AnalyticsHistoryTable = ({ items, onDelete, deletingIds }: Props) => {
  return (
    <TableContainer borderWidth="1px" borderRadius="lg" overflow="hidden">
      <Table variant="simple" size="md">
        <Thead bg="gray.50">
          <Tr>
            <Th>File</Th>
            <Th>Date</Th>
            <Th>Status</Th>
            <Th>Summary</Th>
            <Th textAlign="right">Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {items.map((item, index) => (
            <Tr
              key={item.fileId}
              bg={index % 2 === 0 ? 'white' : 'gray.50'}
              _hover={{ bg: 'blue.50' }}
            >
              <Td py={4}>
                <VStack align="start" spacing={1}>
                  <ChakraLink
                    as={RouterLink}
                    to={`/history/${item.fileId}`}
                    fontWeight="semibold"
                    color="blue.600"
                    _hover={{ textDecoration: 'underline', color: 'blue.700' }}
                    _focusVisible={{ boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.6)', borderRadius: 'md' }}
                  >
                    {item.originalFileName}
                  </ChakraLink>
                  <Text fontSize="xs" color="gray.500">
                    ID: {formatFileId(item.fileId)}
                  </Text>
                </VStack>
              </Td>
              <Td py={4}>
                <Text fontSize="sm" color="gray.700">
                  {formatTimestamp(item.updatedAt)}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  Uploaded {formatTimestamp(item.createdAt)}
                </Text>
              </Td>
              <Td py={4}>
                <HStack spacing={2}>
                  <Badge
                    colorScheme={getStatusColorScheme(item.status)}
                    variant="solid"
                    borderRadius="full"
                    px={3}
                    py={1}
                    minW="108px"
                    textAlign="center"
                    display="inline-flex"
                    justifyContent="center"
                  >
                    <HStack spacing={1}>
                      {getStatusIcon(item.status)}
                      <Text fontSize="xs" fontWeight="semibold">
                        {getStatusLabel(item.status)}
                      </Text>
                    </HStack>
                  </Badge>
                </HStack>
              </Td>
              <Td py={4}>
                <Box>
                  {item.status === 'COMPLETED' && item.result ? (
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" color="gray.700" noOfLines={1}>
                        Total words: {item.result.totalWords}
                      </Text>
                      <Text fontSize="xs" color="gray.500" noOfLines={1}>
                        {getTopWordSummary(item)}
                      </Text>
                    </VStack>
                  ) : item.status === 'FAILED' ? (
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" color="red.600" fontWeight="semibold">
                        Analysis failed
                      </Text>
                      <Text fontSize="xs" color="red.500" noOfLines={1}>
                        {item.errorMessage ?? 'Please try again later.'}
                      </Text>
                    </VStack>
                  ) : (
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" color="gray.600" fontWeight="semibold">
                        {item.status === 'IN_PROGRESS' ? 'Analyzing…' : 'Queued'}
                      </Text>
                      <Text fontSize="xs" color="gray.500" noOfLines={1}>
                        Results pending.
                      </Text>
                    </VStack>
                  )}
                </Box>
              </Td>
              <Td py={4} textAlign="right">
                <Tooltip label="Delete file" placement="top">
                  <IconButton
                    aria-label={`Delete ${item.originalFileName}`}
                    icon={<Trash2 size={16} />}
                    variant="ghost"
                    colorScheme="red"
                    size="sm"
                    onClick={() => onDelete(item)}
                    isLoading={Boolean(deletingIds[item.fileId])}
                  />
                </Tooltip>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};

export default AnalyticsHistoryTable;
