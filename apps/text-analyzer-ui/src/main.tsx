import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import * as ReactDOM from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './app/app';
import { loadAppConfig } from './services/appConfig';
import { setAxiosBaseUrl } from './axiosClient';

const rootElement = document.getElementById('root') as HTMLElement;
const root = ReactDOM.createRoot(rootElement);
const queryClient = new QueryClient();

const renderApp = (): void => {
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ChakraProvider>
      </QueryClientProvider>
    </StrictMode>,
  );
};

loadAppConfig()
  .then((config) => {
    setAxiosBaseUrl(config.apiBaseUrl);
  })
  .finally(() => {
    renderApp();
  });
