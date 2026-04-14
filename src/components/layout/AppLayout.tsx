import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import TopNav from './TopNav';
import styles from './layout.module.css';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className={styles.layoutContainer}>
      <div className={styles.desktopSidebar}>
        <Sidebar />
      </div>
      
      <main className={styles.mainContent}>
        <TopNav />
        <div className={styles.pageContent}>
          {children}
        </div>
      </main>

      <div className={styles.mobileBottomNav}>
        <BottomNav />
      </div>
    </div>
  );
}
