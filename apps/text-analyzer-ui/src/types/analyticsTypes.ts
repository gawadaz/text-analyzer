export type AnalysisStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';

export type AnalysisResult = {
  totalWords: number;
  uniqueWords: number;
  avgWordLength: number;
  top10Words?: Array<{ word: string; count: number }>;
};

export type AnalyticsItem = {
  fileId: string;
  originalFileName: string;
  status: AnalysisStatus;
  createdAt: number;
  updatedAt: number;
  result?: AnalysisResult;
  errorMessage?: string;
};
