// Uncomment this line to use CSS modules
// import styles from './app.module.css';
import MainLayout from '../pages/layout/mainLayout';
import { HistoryDetailPage } from '../pages/historyDetailPage';
import { HistoryPage } from '../pages/historyPage';
import { UploadPage } from '../pages/uploadPage';

import { Route, Routes } from 'react-router-dom';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route path="" element={<UploadPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="history/:fileId" element={<HistoryDetailPage />} />
      </Route>
    </Routes>
  );
}

export default App;
