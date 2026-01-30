import { Upload } from 'lucide-react';
import styles from './mainLayout.module.css';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  return (
    <div className={styles.page}>
      <header className={styles.topBar}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}>
            <Upload size={18} />
          </div>
          <span className={styles.brandText}>Text Analyzer</span>
        </div>
      </header>

      <main className={styles.container}>
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;