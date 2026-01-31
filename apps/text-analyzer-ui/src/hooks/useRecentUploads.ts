import { useQuery } from '@tanstack/react-query';
import { fetchCurrentOwnerAnalytics } from '../services/analyticsService';
import { AnalyticsItem } from '../types/analyticsTypes';

type UseRecentUploadsResult = {
  items: AnalyticsItem[];
  isLoading: boolean;
  errorMessage: string;
  refresh: () => Promise<void>;
};

const normalizeErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
};

const fetchRecentUploads = async (): Promise<AnalyticsItem[]> => {
  const results = await fetchCurrentOwnerAnalytics();
  const sortedItems = [...results].sort((first, second) => second.updatedAt - first.updatedAt);
  return sortedItems.slice(0, 3);
};

/**
 * Fetches the latest uploads for the current owner.
 */
export const useRecentUploads = (): UseRecentUploadsResult => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['recent-uploads'],
    queryFn: fetchRecentUploads,
    staleTime: 30_000,
    retry: 1,
  });

  return {
    items: data ?? [],
    isLoading,
    errorMessage: error ? normalizeErrorMessage(error, 'Failed to load recent uploads.') : '',
    refresh: async () => {
      await refetch();
    },
  };
};
