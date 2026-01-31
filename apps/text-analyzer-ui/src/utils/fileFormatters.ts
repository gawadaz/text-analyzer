export const formatFileSizeKb = (bytes: number): string => `${Math.ceil(bytes / 1024)} KB`;

export const formatDateTime = (timestamp: number): string =>
  new Date(timestamp).toLocaleString();
