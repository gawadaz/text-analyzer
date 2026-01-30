export type AppConfig = {
	apiBaseUrl?: string;
};

const getEnvApiBaseUrl = (): string | undefined => {
	const baseUrl = import.meta.env.VITE_API_BASE_URL;
	if (typeof baseUrl !== 'string') {
		return undefined;
	}

	const trimmed = baseUrl.trim();
	return trimmed.length > 0 ? trimmed : undefined;
};

const normalizeConfig = (config: AppConfig | null | undefined): AppConfig => ({
	apiBaseUrl: config?.apiBaseUrl ?? getEnvApiBaseUrl(),
});

export const loadAppConfig = async (): Promise<AppConfig> => {
	try {
		const response = await fetch('/config.json', { cache: 'no-store' });
		if (!response.ok) {
			return normalizeConfig(undefined);
		}

		const parsed = (await response.json()) as AppConfig;
		return normalizeConfig(parsed);
	} catch {
		return normalizeConfig(undefined);
	}
};
