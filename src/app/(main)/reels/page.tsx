'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { Heart, MessageCircle, Share2, Upload, Music, User } from 'lucide-react';
import styles from './reels.module.css';
import { createClient } from '@/lib/supabase/client';

interface Profile {
  id: string;
  username: string;
  full_name: string;
  bio: string;
  avatar_url: string;
  is_verified: boolean;
}

interface Reel {
  id: string;
  author_id: string;
  video_url: string;
  caption: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  author: Profile;
}

export default function ReelsPage() {
  const { user } = useUser();
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadReels = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('reels')
      .select('*, author:profiles(*)')
      .order('created_at', { ascending: false });
    
    if (data) {
      setReels(data as Reel[]);
    }

    setLoading(false);

  };

  useEffect(() => {
    loadReels();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setLoading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Math.random()}.${fileExt}`;
    const filePath = `reels/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('reels')
      .upload(filePath, file);

    if (uploadError) {
      console.error(uploadError);
      setLoading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('reels').getPublicUrl(filePath);

    await supabase.from('reels').insert({
      author_id: user.id,
      video_url: urlData.publicUrl,
      caption: prompt('Add a caption to your reel:') || ''
    });

    loadReels();
  };

  return (
    <div className={styles.reelsContainer}>
      <header className={styles.reelsHeader}>
        <h1>Aurbit Reels</h1>
        <button className="clay-button" onClick={() => fileInputRef.current?.click()}>
          <Upload size={18} /> Post Reel
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          hidden 
          accept="video/*" 
          onChange={handleUpload} 
        />
      </header>

      <div className={styles.reelsFeed}>
        {reels.map((reel) => (
          <div key={reel.id} className={styles.reelCard}>
            <video 
              src={reel.video_url} 
              className={styles.reelVideo} 
              loop 
              muted 
              playsInline 
              autoPlay
            />
            
            <div className={styles.reelOverlay}>
              <div className={styles.reelActions}>
                <div className={styles.actionItem}>
                  <button className={styles.iconBtn}><Heart size={28} /></button>
                  <span>{reel.likes_count}</span>
                </div>
                <div className={styles.actionItem}>
                  <button className={styles.iconBtn}><MessageCircle size={28} /></button>
                  <span>{reel.comments_count}</span>
                </div>
                <div className={styles.actionItem}>
                  <button className={styles.iconBtn}><Share2 size={28} /></button>
                </div>
              </div>

              <div className={styles.reelFooter}>
                <div className={styles.authorInfo}>
                  <div className={styles.avatar}>
                    {reel.author?.avatar_url ? (
                      <img src={reel.author.avatar_url} alt="" />
                    ) : (
                      <User size={20} />
                    )}
                  </div>
                  <span className={styles.authorName}>@{reel.author?.username || 'aurbit_user'}</span>
                  <button className={styles.followBtn}>Follow</button>
                </div>
                <p className={styles.caption}>{reel.caption}</p>
                <div className={styles.musicTrack}>
                  <Music size={14} />
                  <span>Original Audio - {reel.author?.full_name || 'Aurbit User'}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
