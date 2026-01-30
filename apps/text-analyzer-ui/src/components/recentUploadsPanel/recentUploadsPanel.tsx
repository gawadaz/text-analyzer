import {
  Badge,
  Box,
  Button,
  Divider,
  HStack,
  Link as ChakraLink,
  Spinner,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { AnalyticsItem } from '../../types/analyticsTypes';

type Props = {
  items: AnalyticsItem[];
  isLoading: boolean;
  errorMessage?: string;
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

const getStatusLabel = (status: AnalyticsItem['status']): string =>
  status.split('_').join(' ');

export const RecentUploadsPanel = ({ items, isLoading, errorMessage }: Props) => {
  return (
    <Box borderWidth="1px" borderRadius="lg" bg="white" p={{ base: 4, md: 5 }}>
      <HStack justify="space-between" align="start" spacing={4} mb={4} flexWrap="wrap">
        <Box>
          <Text fontSize="lg" fontWeight="semibold">
            Recently uploaded
          </Text>
          <Text fontSize="sm" color="gray.600">
            Track status and open a file to view full analysis details.
          </Text>
        </Box>
        <Button as={RouterLink} to="/history" size="sm" variant="outline" colorScheme="blue">
          View all history
        </Button>
      </HStack>

      {isLoading ? (
        <HStack spacing={3} role="status" aria-live="polite">
          <Spinner size="sm" />
          <Text fontSize="sm" color="gray.600">
            Loading recent uploads…
          </Text>
        </HStack>
      ) : errorMessage ? (
        <Text fontSize="sm" color="red.600" role="alert">
          {errorMessage}
        </Text>
      ) : items.length === 0 ? (
        <Text fontSize="sm" color="gray.600">
          No recent uploads yet.
        </Text>
      ) : (
        <Stack spacing={4} divider={<Divider borderColor="gray.200" />}>
          {items.map((item) => (
            <HStack key={item.fileId} justify="space-between" align="start" spacing={4}>
              <VStack align="start" spacing={1} flex={1} minW={0}>
                <ChakraLink
                  as={RouterLink}
                  to={`/history/${item.fileId}`}
                  fontWeight="semibold"
                  color="blue.600"
                  noOfLines={1}
                  _hover={{ textDecoration: 'underline', color: 'blue.700' }}
                  _focusVisible={{ boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.6)', borderRadius: 'md' }}
                >
                  {item.originalFileName}
                </ChakraLink>
                <Text fontSize="xs" color="gray.500">
                  Updated {formatTimestamp(item.updatedAt)}
                </Text>
              </VStack>
              <Badge
                colorScheme={getStatusColorScheme(item.status)}
                variant="subtle"
                borderRadius="full"
                px={3}
                py={1}
                textTransform="uppercase"
                letterSpacing="wider"
                fontSize="xs"
              >
                {getStatusLabel(item.status)}
              </Badge>
            </HStack>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default RecentUploadsPanel;
