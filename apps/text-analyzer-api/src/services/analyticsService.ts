import { listOwnerHistoryItems, AnalysisResult, OwnerHistoryItem } from './dynamoDB';

export type AnalyticsItem = {
  fileId: string;
  originalFileName: string;
  status: OwnerHistoryItem['status'];
  createdAt: number;
  updatedAt: number;
  result?: AnalysisResult;
  errorMessage?: string;
};

export const getOwnerAnalytics = async (ownerId: string): Promise<AnalyticsItem[]> => {
  const items = await listOwnerHistoryItems(ownerId);

  return items
    .sort((a, b) => b.createdAt - a.createdAt)
    .map((item) => {
      const base: AnalyticsItem = {
        fileId: item.fileId,
        originalFileName: item.originalFileName,
        status: item.status,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      };

      if (item.status === 'COMPLETED' && item.result) {
        base.result = item.result;
      }

      if (item.status === 'FAILED' && item.errorMessage) {
        base.errorMessage = item.errorMessage;
      }

      return base;
    });
};
