import axios, { AxiosInstance } from 'axios';

const axiosClient: AxiosInstance = axios.create({
	headers: {
		'Content-Type': 'application/json',
	},
	timeout: 30000,
});

const normalizeBaseUrl = (baseUrl?: string): string | undefined => {
	if (typeof baseUrl !== 'string') {
		return undefined;
	}

	const trimmed = baseUrl.trim();
	return trimmed.length > 0 ? trimmed : undefined;
};

export const setAxiosBaseUrl = (baseUrl?: string): void => {
	axiosClient.defaults.baseURL = normalizeBaseUrl(baseUrl);
};

export default axiosClient;
