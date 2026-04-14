'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, MessageSquare, Video, User, LogOut, Crown, Code, Shield } from 'lucide-react';
import { useUser, SignOutButton } from '@clerk/nextjs';
import AurbitLogo from './AurbitLogo';
import styles from './navigation.module.css';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const NAV_ITEMS = [
  { href: '/', label: 'Feed', icon: Home },
  { href: '/explore', label: 'Explore', icon: Compass },
  { href: '/chat', label: 'Chat', icon: MessageSquare },
  { href: '/reels', label: 'Reels', icon: Video },
  { href: '/profile', label: 'Profile', icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const [profile, setProfile] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (data) setProfile(data);
      };
      fetchProfile();
    }
  }, [user]);

  const getRankIcon = () => {
    if (!profile) return null;
    if (profile.role === 'ceo') return <Crown size={16} className="badge-ceo" />;
    if (profile.role === 'dev') return <Code size={16} className="badge-dev" />;
    if (profile.role === 'staff') return <Shield size={16} className="badge-staff" />;
    return null;
  };

  const getAuraClass = () => {
    if (!profile) return '';
    if (profile.role === 'ceo') return 'aura-ceo';
    if (profile.role === 'dev') return 'aura-dev';
    return '';
  };

  return (
    <nav className={`${styles.sidebar} no-lag`}>
      <div className={styles.logoContainer}>
        <AurbitLogo size={40} />
        <h1 className={styles.logoText}>Aurbit</h1>
      </div>

      <div className={styles.navLinks}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <Icon className={styles.icon} size={24} />
              <span className={styles.label}>{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className={styles.sidebarFooter}>
        <div className={styles.userSection}>
          <div className={`${styles.avatarContainer} ${getAuraClass()}`}>
            {user?.imageUrl ? (
              <img src={user.imageUrl} alt="" className={styles.avatarMini} />
            ) : (
              <div className={styles.avatarMini}>{user?.firstName?.[0] || 'A'}</div>
            )}
          </div>
          <div className={styles.userInfo}>
            <div className={styles.userNameRow}>
              <span className={styles.userName}>
                {user?.username || user?.firstName || 'Orbit User'}
              </span>
              {getRankIcon()}
            </div>
            <span className={styles.userHandle}>@{user?.username || 'aurbit'}</span>
          </div>
        </div>
        
        <SignOutButton signOutOptions={{ sessionId: user?.id }}>
          <Link href="/login" className="w-full">
            <button className={`${styles.logoutBtn} clay-button`}>
              <LogOut size={18} />
              <span className={styles.label}>Logout</span>
            </button>
          </Link>
        </SignOutButton>

      </div>
    </nav>
  );
}
