// Uncomment this line to use CSS modules
// import styles from './app.module.css';
import MainLayout from '../pages/layout/mainLayout';
import { UploadPage } from '../pages/uploadPage/uploadPage';

import { Route, Routes } from 'react-router-dom';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route path="" element={<UploadPage />} />
      </Route>
    </Routes>
  );
}

export default App;
