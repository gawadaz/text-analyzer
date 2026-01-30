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
import { Link as RouterLink, useParams } from 'react-router-dom';
import { AnalysisResultsPanel } from '../components/analysisResultsPanel/analysisResultsPanel';
import { fetchCurrentOwnerAnalytics } from '../services/analyticsService';
import { AnalyticsItem } from '../types/analyticsTypes';

type LoadStatus = 'idle' | 'loading' | 'success' | 'error';

const formatTimestamp = (timestamp: number): string =>
  new Date(timestamp).toLocaleString();

export function HistoryDetailPage() {
  const { fileId } = useParams();
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
          error instanceof Error ? error.message : 'Failed to load analysis results.',
        );
      }
    };

    load();

    return () => controller.abort();
  }, []);

  const selectedItem = useMemo(
    () => items.find((item) => item.fileId === fileId),
    [items, fileId],
  );

  return (
    <VStack align="stretch" spacing={6}>
      <HStack justify="space-between" align="center" flexWrap="wrap">
        <Box>
          <Heading as="h1" size="lg" mb={1}>
            Analysis details
          </Heading>
          <Text color="gray.600" fontSize="sm">
            Review the full results for your uploaded file.
          </Text>
        </Box>
        <Button as={RouterLink} to="/history" variant="ghost" colorScheme="gray">
          Back to history
        </Button>
      </HStack>

      {status === 'loading' && (
        <HStack spacing={3} aria-live="polite">
          <Spinner size="sm" />
          <Text color="gray.600">Loading analysis...</Text>
        </HStack>
      )}

      {status === 'error' && (
        <Alert status="error" variant="left-accent" role="alert">
          <AlertIcon />
          <AlertTitle>Unable to load analysis</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {status === 'success' && !selectedItem && (
        <Alert status="warning" variant="left-accent" role="alert">
          <AlertIcon />
          <AlertTitle>Analysis not found</AlertTitle>
          <AlertDescription>
            We could not find results for this file in your history.
          </AlertDescription>
        </Alert>
      )}

      {status === 'success' && selectedItem && (
        <VStack align="stretch" spacing={6}>
          <Box borderWidth="1px" borderRadius="lg" p={{ base: 4, md: 5 }}>
            <VStack align="start" spacing={1}>
              <Text fontSize="sm" color="gray.500">
                File name
              </Text>
              <Heading as="h2" size="md">
                {selectedItem.originalFileName}
              </Heading>
              <Text fontSize="sm" color="gray.600">
                Uploaded {formatTimestamp(selectedItem.createdAt)} · Last updated{' '}
                {formatTimestamp(selectedItem.updatedAt)}
              </Text>
            </VStack>
          </Box>

          <AnalysisResultsPanel item={selectedItem} />
        </VStack>
      )}
    </VStack>
  );
}

export default HistoryDetailPage;
