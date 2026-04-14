'use client';

import React from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { Bell, MessageSquare, UserPlus, Zap, Check } from 'lucide-react';
import styles from './navigation.module.css';

interface NotificationPanelProps {
  onClose: () => void;
}

export default function NotificationPanel({ onClose }: NotificationPanelProps) {
  const { notifications, markAsRead, markAllRead } = useNotifications();

  return (
    <div className={`${styles.notifPanel} glass-panel animate-float`}>
      <header className={styles.notifHeader}>
        <h3>Orbit Notifications</h3>
        <button className={styles.markAllBtn} onClick={markAllRead}>
          Mark all read
        </button>
      </header>
      
      <div className={styles.notifList}>
        {notifications.length === 0 ? (
          <div className={styles.emptyNotifs}>
            <Zap size={32} opacity={0.2} />
            <p>Your orbit is quiet... for now.</p>
          </div>
        ) : (
          notifications.map(n => (
            <div 
              key={n.id} 
              className={`${styles.notifItem} ${!n.is_read ? styles.unread : ''}`}
              onClick={() => markAsRead(n.id)}
            >
              <div className={styles.notifIcon}>
                {n.type === 'message' && <MessageSquare size={16} />}
                {n.type === 'circle_add' && <UserPlus size={16} />}
                {n.type === 'broadcast' && <Zap size={16} color="#4ade80" />}
              </div>
              <div className={styles.notifContent}>
                <p>{n.content}</p>
                <span>{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              {!n.is_read && <div className={styles.unreadDot} />}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
