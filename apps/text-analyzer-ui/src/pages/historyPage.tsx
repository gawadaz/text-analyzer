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
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { AnalyticsHistoryTable } from '../components/analyticsHistoryTable/analyticsHistoryTable';
import { fetchCurrentOwnerAnalytics } from '../services/analyticsService';
import { AnalyticsItem } from '../types/analyticsTypes';

type LoadStatus = 'idle' | 'loading' | 'success' | 'error';

const sortByDate = (items: AnalyticsItem[]): AnalyticsItem[] =>
  [...items].sort((a, b) => b.updatedAt - a.updatedAt);

export function HistoryPage() {
  const [items, setItems] = useState<AnalyticsItem[]>([]);
  const [status, setStatus] = useState<LoadStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      setStatus('loading');
      setErrorMessage('');
      try {
        const response = await fetchCurrentOwnerAnalytics(controller.signal);
        setItems(response);
        setStatus('success');
      } catch (error: unknown) {
        if (controller.signal.aborted) {
          return;
        }
        setStatus('error');
        setErrorMessage(
          error instanceof Error ? error.message : 'Failed to load analytics history.',
        );
      }
    };

    load();

    return () => controller.abort();
  }, []);

  const sortedItems = useMemo(() => sortByDate(items), [items]);

  return (
    <VStack align="stretch" spacing={6}>
      <Box as="section">
        <HStack justify="space-between" align="start" spacing={4} flexWrap="wrap">
          <Box>
            <Heading as="h1" size="lg" mb={2}>
              Analysis history
            </Heading>
            <Text color="gray.600" fontSize="sm">
              Review previous analyses and open detailed results.
            </Text>
          </Box>
          <Button as={RouterLink} to="/" variant="outline" colorScheme="gray">
            Upload new file
          </Button>
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

      {status === 'success' && sortedItems.length === 0 && (
        <Box borderWidth="1px" borderRadius="lg" p={6} bg="gray.50">
          <Heading as="h2" size="md" mb={2}>
            No analyses yet
          </Heading>
          <Text color="gray.600">
            Upload a file to start building your analysis history.
          </Text>
        </Box>
      )}

      {status === 'success' && sortedItems.length > 0 && (
        <AnalyticsHistoryTable items={sortedItems} />
      )}
    </VStack>
  );
}

export default HistoryPage;
