import axios from 'axios';
import axiosClient from '../axiosClient';
import { AnalyticsItem } from '../types/analyticsTypes';
import { getOrCreateOwnerId } from './ownerIdService';

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const message =
      (error.response?.data as { error?: { message?: string } } | undefined)?.error
        ?.message ?? 'Failed to fetch analytics history.';
    return message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Failed to fetch analytics history.';
};

export const fetchOwnerAnalytics = async (
  ownerId: string,
  signal?: AbortSignal,
): Promise<AnalyticsItem[]> => {
  try {
    const response = await axiosClient.get<AnalyticsItem[]>(`/api/v1/analytics/${ownerId}`, {
      signal,
      headers: {
        'X-Owner-Id': ownerId,
      },
    });
    if (response.status !== 200) {
      throw new Error(`Failed to fetch analytics history: ${response.statusText}`);
    }
    return response.data ?? [];
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error));
  }
};

export const fetchCurrentOwnerAnalytics = async (
  signal?: AbortSignal,
): Promise<AnalyticsItem[]> => {
  const ownerId = getOrCreateOwnerId();
  return fetchOwnerAnalytics(ownerId, signal);
};

export const deleteAnalytics = async (fileId: string, signal?: AbortSignal): Promise<void> => {
  const ownerId = getOrCreateOwnerId();
  try {
    const response = await axiosClient.delete(`/api/v1/analytics/${fileId}`, {
      signal,
      headers: {
        'X-Owner-Id': ownerId,
      },
    });
    if (response.status !== 200 && response.status !== 204) {
      throw new Error(`Failed to delete analytics history: ${response.statusText}`);
    }
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error));
  }
};
