import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import * as ReactDOM from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import App from './app/app';
import { loadAppConfig } from './services/appConfig';
import { setAxiosBaseUrl } from './axiosClient';

const rootElement = document.getElementById('root') as HTMLElement;
const root = ReactDOM.createRoot(rootElement);

const renderApp = (): void => {
  root.render(
    <StrictMode>
      <ChakraProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ChakraProvider>
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
