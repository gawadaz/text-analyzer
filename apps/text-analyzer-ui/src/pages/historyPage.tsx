import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Heading,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Spinner,
  Text,
  Tooltip,
  VStack,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { RefreshCw, Search } from 'lucide-react';
import { AnalyticsHistoryTable } from '../components/analyticsHistoryTable/analyticsHistoryTable';
import { PageTabs } from '../components/pageTabs/pageTabs';
import { fetchCurrentOwnerAnalytics } from '../services/analyticsService';
import { AnalyticsItem } from '../types/analyticsTypes';

type LoadStatus = 'idle' | 'loading' | 'success' | 'error';

const sortByDate = (items: AnalyticsItem[]): AnalyticsItem[] =>
  [...items].sort((a, b) => b.updatedAt - a.updatedAt);

export function HistoryPage() {
  const [items, setItems] = useState<AnalyticsItem[]>([]);
  const [status, setStatus] = useState<LoadStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | AnalyticsItem['status']>('ALL');

  const loadHistory = async (signal: AbortSignal) => {
    setStatus('loading');
    setErrorMessage('');
    try {
      const response = await fetchCurrentOwnerAnalytics(signal);
      setItems(response);
      setStatus('success');
    } catch (error: unknown) {
      if (signal.aborted) {
        return;
      }
      setStatus('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to load analytics history.',
      );
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    loadHistory(controller.signal);

    return () => controller.abort();
  }, []);

  const sortedItems = useMemo(() => sortByDate(items), [items]);
  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return sortedItems.filter((item) => {
      const matchesQuery =
        query.length === 0 || item.originalFileName.toLowerCase().includes(query);
      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [sortedItems, searchQuery, statusFilter]);

  return (
    <VStack align="stretch" spacing={8}>
      <Box as="section">
        <HStack justify="space-between" align="start" spacing={6} flexWrap="wrap">
          <Box>
            <Heading as="h1" size="xl" mb={2}>
              Analysis history
            </Heading>
            <Text color="gray.600" fontSize="sm">
              Review previous analyses and open detailed results.
            </Text>
          </Box>
          <PageTabs active="history" />
        </HStack>
      </Box>

      <Box as="section" maxW="960px" w="full">
        <HStack spacing={{ base: 3, md: 4 }} flexWrap="wrap" align="center">
          <InputGroup maxW={{ base: 'full', md: '320px' }}>
            <InputLeftElement pointerEvents="none" color="gray.400">
              <Search size={16} />
            </InputLeftElement>
            <Input
              placeholder="Search by file name"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              bg="white"
              focusBorderColor="blue.500"
            />
          </InputGroup>
          <Select
            maxW={{ base: 'full', md: '220px' }}
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as 'ALL' | AnalyticsItem['status'])
            }
            bg="white"
            focusBorderColor="blue.500"
          >
            <option value="ALL">All statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </Select>
          <Tooltip label="Refresh history" placement="top">
            <IconButton
              aria-label="Refresh history"
              icon={<RefreshCw size={16} />}
              variant="outline"
              colorScheme="gray"
              bg="white"
              size="md"
              onClick={() => {
                const controller = new AbortController();
                loadHistory(controller.signal);
              }}
              isLoading={status === 'loading'}
            />
          </Tooltip>
        </HStack>
      </Box>

      {status === 'loading' && (
        <HStack spacing={3} aria-live="polite">
          <Spinner size="sm" />
          <Text color="gray.600">Loading history...</Text>
        </HStack>
      )}

      {status === 'error' && (
        <Alert status="error" variant="left-accent" role="alert">
          <AlertIcon />
          <AlertTitle>Unable to load history</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {status === 'success' && items.length === 0 && (
        <Box borderWidth="1px" borderRadius="lg" p={6} bg="gray.50">
          <Heading as="h2" size="md" mb={2}>
            No analyses yet
          </Heading>
          <Text color="gray.600" mb={4}>
            Upload a file to start building your analysis history.
          </Text>
          <Button as={RouterLink} to="/" colorScheme="blue" size="sm">
            Upload a file
          </Button>
        </Box>
      )}

      {status === 'success' && items.length > 0 && filteredItems.length === 0 && (
        <Box borderWidth="1px" borderRadius="lg" p={6} bg="gray.50">
          <Heading as="h2" size="md" mb={2}>
            No matches found
          </Heading>
          <Text color="gray.600">
            Try a different search term or adjust the status filter.
          </Text>
        </Box>
      )}

      {status === 'success' && filteredItems.length > 0 && (
        <AnalyticsHistoryTable items={filteredItems} />
      )}
    </VStack>
  );
}

export default HistoryPage;
