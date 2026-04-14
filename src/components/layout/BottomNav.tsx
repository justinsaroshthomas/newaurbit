'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, MessageSquare, Video, User } from 'lucide-react';
import styles from './navigation.module.css';

const NAV_ITEMS = [
  { href: '/', icon: Home },
  { href: '/explore', icon: Compass },
  { href: '/reels', icon: Video },
  { href: '/chat', icon: MessageSquare },
  { href: '/profile', icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.bottomNav}>
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

        return (
          <Link 
            key={item.href} 
            href={item.href}
            className={`${styles.bottomNavItem} ${isActive ? styles.active : ''}`}
          >
            <Icon className={styles.icon} size={28} />
          </Link>
        );
      })}
    </nav>
  );
}
