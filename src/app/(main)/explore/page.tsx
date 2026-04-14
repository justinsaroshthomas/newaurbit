'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Search, CheckCircle, Users as UsersIcon, UserMinus, Plus } from 'lucide-react';
import styles from './explore.module.css';
import { createClient } from '@/lib/supabase/client';

export default function ExplorePage() {
  const { user } = useUser();
  const [users, setUsers] = useState<any[]>([]);
  const [circles, setCircles] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (user) {
      loadUsers();
      loadCircles();
    }
  }, [user]);

  const loadCircles = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('circles')
      .select('*')
      .eq('owner_id', user.id);
    if (data) setCircles(data);
  };

  const loadUsers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .limit(20);
    if (data) {
      setUsers(data.filter(u => u.id !== user?.id));
    }
    setLoading(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadUsers();
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
      .limit(20);
    if (data) {
      setUsers(data.filter(u => u.id !== user?.id));
    }
    setLoading(false);
  };

  const handleCircleAction = async (targetUserId: string, type: 'inner' | 'outer' | 'none') => {
    if (!user) return;

    if (type === 'none') {
      await supabase
        .from('circles')
        .delete()
        .eq('owner_id', user.id)
        .eq('member_id', targetUserId);
    } else {
      await supabase
        .from('circles')
        .upsert({
          owner_id: user.id,
          member_id: targetUserId,
          circle_type: type
        }, { onConflict: 'owner_id,member_id' });
    }
    loadCircles();
  };

  return (
    <div className={styles.exploreContainer}>
      <header className={styles.header}>
        <h1>Expand Your Orbit</h1>
        <p>Discover people and connect with new spaces.</p>
      </header>

      <div className={styles.searchLayout}>
        <input
          type="text"
          className="input-field"
          placeholder="Search people..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          style={{ borderRadius: '24px', paddingLeft: '16px' }}
        />
        <button className="btn-primary" onClick={handleSearch} style={{ borderRadius: '24px' }}>
          <Search size={18} /> Search
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px', opacity: 0.5 }}>Loading orbit...</div>
      ) : users.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', opacity: 0.5 }}>
          <p style={{ fontSize: '24px', marginBottom: '8px' }}>🌌</p>
          <p>No users found. Invite friends to join Aurbit!</p>
        </div>
      ) : (
        <div className={styles.orbitsGrid}>
          {users.map(u => {
            const circle = circles.find(c => c.member_id === u.id);
            const isInner = circle?.circle_type === 'inner';
            const isOuter = circle?.circle_type === 'outer';

            return (
              <div key={u.id} className={`glass-card ${styles.userCard}`}>
                {u.avatar_url ? (
                  <img src={u.avatar_url} alt="" className={styles.avatar} style={{ objectFit: 'cover' }} />
                ) : (
                  <div className={styles.avatar}>{(u.full_name || u.username || '?')[0]}</div>
                )}
                <div className={styles.userInfo}>
                  <div className={styles.userNameRow}>
                    <div className={styles.userName}>{u.full_name || u.username}</div>
                    {u.is_verified && <CheckCircle size={14} className="verified-badge" />}
                  </div>
                  <div className={styles.userStats}>{u.bio || 'New to the orbit'}</div>
                </div>
                
                <div className={styles.actionGrid}>
                  <button 
                    className={`${styles.circleBtn} ${isInner ? styles.activeInner : ''}`}
                    onClick={() => handleCircleAction(u.id, isInner ? 'none' : 'inner')}
                  >
                    {isInner ? <UserMinus size={16} /> : <UsersIcon size={16} />}
                    <span>{isInner ? 'In Circle' : 'Inner Circle'}</span>
                  </button>
                  <button 
                    className={`${styles.followBtn} ${isOuter ? styles.activeFollow : ''}`}
                    onClick={() => handleCircleAction(u.id, isOuter ? 'none' : 'outer')}
                  >
                    {isOuter ? <CheckCircle size={16} /> : <Plus size={16} />}
                    <span>{isOuter ? 'Following' : 'Follow'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
