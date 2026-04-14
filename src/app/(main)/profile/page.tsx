'use client';

import { useState, useEffect } from 'react';
import { useUser, UserButton } from '@clerk/nextjs';
import { Settings, MapPin, Link as LinkIcon, Camera, Save, LogOut, CheckCircle, Zap, Shield } from 'lucide-react';
import styles from './profile.module.css';
import { createClient } from '@/lib/supabase/client';
import { useAppConfig } from '@/context/AppConfigContext';

export default function ProfilePage() {
  const { user } = useUser();
  const { theme, setTheme, lowPowerMode, setLowPowerMode } = useAppConfig();
  const [activeTab, setActiveTab] = useState('Timeline');
  const supabase = createClient();
  const [posts, setPosts] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    website: '',
  });

  // Load profile from Supabase
  useEffect(() => {
    if (!user) return;
    const loadProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (data) {
        setProfileData(data);
        setFormData({
          full_name: data.full_name || user.fullName || '',
          bio: data.bio || '',
          website: data.website || '',
        });
      } else {
        setFormData({
          full_name: user.fullName || '',
          bio: '',
          website: '',
        });
      }
    };
    loadProfile();
  }, [user]);

  // Load user's posts
  useEffect(() => {
    if (!user) return;
    const loadPosts = async () => {
      const { data } = await supabase
        .from('posts')
        .select('*')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false });
      if (data) setPosts(data);
    };
    loadPosts();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      username: user.username || user.firstName?.toLowerCase() || 'user',
      full_name: formData.full_name,
      bio: formData.bio,
      website: formData.website,
      avatar_url: user.imageUrl,
      updated_at: new Date().toISOString(),
    });

    setSaving(false);
    if (!error) {
      setActiveTab('Timeline');
    }
  };

  const handleCoverUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file || !user) return;
      const path = `${user.id}/cover.${file.name.split('.').pop()}`;
      await supabase.storage.from('covers').upload(path, file, { upsert: true });
      const { data: urlData } = supabase.storage.from('covers').getPublicUrl(path);
      await supabase.from('profiles').upsert({ id: user.id, cover_url: urlData.publicUrl });
    };
    input.click();
  };

  return (
    <div className={styles.profileContainer}>
      <div className={styles.heroSection}>
        <div className={styles.coverImage} onClick={handleCoverUpload} style={{ cursor: 'pointer' }}>
          <button className={`glass-panel ${styles.editCoverBtn}`}>
            <Camera size={16} /> Edit Cover
          </button>
        </div>

        <div className={styles.heroContent}>
          <div className={styles.avatarContainer}>
            {user?.imageUrl ? (
              <img src={user.imageUrl} alt="" className={styles.avatar} style={{ objectFit: 'cover' }} />
            ) : (
              <div className={styles.avatar}>{user?.firstName?.[0] || 'A'}</div>
            )}
          </div>

          <div className={styles.userInfoBlock}>
            <div className={styles.nameRow}>
              <h1 className={styles.userName}>{formData.full_name || user?.fullName || 'Aurbit User'}</h1>
              {profileData?.is_verified && (
                <CheckCircle size={20} className="verified-badge" title="Verified Orbit" />
              )}
            </div>
            <p className={styles.bio}>{formData.bio || 'No bio yet'}</p>
            <div className={styles.userTags}>
              {formData.website && (
                <span className={styles.tag}><LinkIcon size={14} /> {formData.website}</span>
              )}
            </div>
          </div>

          <div style={{ marginLeft: 'auto', paddingTop: '16px' }}>
            <UserButton afterSignOutUrl="/login" />
          </div>
        </div>

        <nav className={styles.profileTabs}>
          {['Timeline', 'About', 'Settings'].map(tab => (
            <button
              key={tab}
              className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'Settings' ? <Settings size={18} /> : tab}
            </button>
          ))}
        </nav>
      </div>

      <div className={styles.profileGrid}>
        {activeTab === 'Timeline' && (
          <>
            <div className={styles.leftColumn}>
              <div className={`glass-card ${styles.cardContent}`}>
                <h3 className={styles.cardTitle}>About</h3>
                {formData.bio && (
                  <div className={styles.aboutRow}>
                    <div className={styles.infoIcon}>📝</div>
                    <div className={styles.aboutText}>
                      <span className={styles.aboutLabel}>Bio</span>
                      <span className={styles.aboutValue}>{formData.bio}</span>
                    </div>
                  </div>
                )}
                <div className={styles.aboutRow}>
                  <div className={styles.infoIcon}>📊</div>
                  <div className={styles.aboutText}>
                    <span className={styles.aboutLabel}>Posts</span>
                    <span className={styles.aboutValue}>{posts.length} total</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.rightColumn}>
              {posts.length === 0 ? (
                <div className="glass-card" style={{ padding: '48px', textAlign: 'center', opacity: 0.5 }}>
                  <p>No posts yet. Go to Feed and share something!</p>
                </div>
              ) : (
                posts.map(post => (
                  <article key={post.id} className={`glass-card ${styles.postCard}`}>
                    <p className={styles.postContent}>{post.content}</p>
                    <span style={{ fontSize: '12px', opacity: 0.5 }}>
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </article>
                ))
              )}
            </div>
          </>
        )}

        {activeTab === 'About' && (
          <div style={{ gridColumn: '1 / -1' }}>
            <div className={`glass-card ${styles.cardContent}`}>
              <h3 className={styles.cardTitle}>About {formData.full_name}</h3>
              <p style={{ lineHeight: 1.8 }}>{formData.bio || 'This user has not added a bio yet.'}</p>
              {formData.website && <p>🌐 Website: <a href={`https://${formData.website}`} target="_blank" rel="noopener" style={{ color: 'var(--primary)' }}>{formData.website}</a></p>}
            </div>
          </div>
        )}

        {activeTab === 'Settings' && (
          <div className={styles.settingsPanel}>
            <div className={`glass-card ${styles.cardContent}`}>
              <h3 className={styles.cardTitle}>Edit Profile</h3>

              <div className={styles.formGroup}>
                <label>Display Name</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.full_name}
                  onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Bio</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.bio}
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell the orbit about yourself..."
                />
              </div>

              <div className={styles.formGroup}>
                <label>Website</label>
                <input
                  type="url"
                  className="input-field"
                  value={formData.website}
                  onChange={e => setFormData({ ...formData, website: e.target.value })}
                  placeholder="yoursite.com"
                />
              </div>

              <button className="btn-aurbit" onClick={handleSave} disabled={saving} style={{ marginTop: '16px', width: '100%' }}>
                <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
              </button>

              <div className={styles.settingDivider} />

              <h3 className={styles.cardTitle}>Orbit Experience</h3>
              
              <div className={styles.formGroup}>
                <label>Emoji Theme Pack</label>
                <div className={styles.themeGrid}>
                  {[
                    { id: 'nature', label: 'Nature 🌿', color: '#4ade80' },
                    { id: 'cyber', label: 'Cyber 🌌', color: '#f0abfc' },
                    { id: 'crystal', label: 'Crystal 💎', color: '#bae6fd' }
                  ].map(t => (
                    <button
                      key={t.id}
                      className={`${styles.themeBtn} ${theme === t.id ? styles.activeTheme : ''}`}
                      onClick={() => setTheme(t.id as any)}
                      style={{ borderColor: t.color }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.toggleRow}>
                <div className={styles.toggleText}>
                  <label className="flex items-center gap-2">
                    <Zap size={18} className={lowPowerMode ? 'text-yellow-400' : ''} />
                    Low Power Orbit
                  </label>
                  <p className={styles.toggleHint}>Disable 3D effects for better battery & speed on older devices.</p>
                </div>
                <button
                  className={`${styles.switch} ${lowPowerMode ? styles.switchOn : ''}`}
                  onClick={() => setLowPowerMode(!lowPowerMode)}
                >
                  <div className={styles.switchHandle} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
