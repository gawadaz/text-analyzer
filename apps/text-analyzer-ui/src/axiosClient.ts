import axios, { AxiosInstance } from 'axios';

const getBaseUrl = (): string | undefined => {
	const baseUrl = import.meta.env.VITE_API_BASE_URL;
    console.log('API Base URL:', baseUrl);
	return typeof baseUrl === 'string' && baseUrl.trim().length > 0
		? baseUrl.trim()
		: undefined;
};

const axiosClient: AxiosInstance = axios.create({
	baseURL: getBaseUrl(),
	headers: {
		'Content-Type': 'application/json',
	},
	timeout: 30000,
});

export default axiosClient;
