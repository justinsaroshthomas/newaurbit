'use client';

import { useState } from 'react';
import { Bell, X } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationPanel from './NotificationPanel';
import styles from './navigation.module.css';

export default function TopNav() {
  const [showNotifs, setShowNotifs] = useState(false);
  const { unreadCount } = useNotifications();

  return (
    <header className={styles.topNav}>
      <div className={styles.topNavLogo}>Aurbit</div>
      <div className={styles.topNavActions}>
        <button 
          className={styles.iconButton} 
          onClick={() => setShowNotifs(!showNotifs)}
        >
          {showNotifs ? <X size={24} /> : <Bell size={24} />}
          {unreadCount > 0 && !showNotifs && (
            <div className={styles.notifBadge}>{unreadCount}</div>
          )}
        </button>
      </div>

      {showNotifs && <NotificationPanel onClose={() => setShowNotifs(false)} />}
    </header>
  );
}
