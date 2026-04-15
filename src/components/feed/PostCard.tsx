'use client';

import { Heart, MessageCircle, Trash2, Share2, CheckCircle, Crown, Code, Shield } from 'lucide-react';
import styles from './feed.module.css';

interface Profile {
  username: string;
  full_name: string;
  avatar_url: string;
  is_verified: boolean;
  role: string;
}

interface Post {
  id: string;
  content: string;
  author_id: string;
  created_at: string;
  likes_count: number;
  comments_count?: number;
  mood?: string;
  profiles: Profile;
}

interface PostCardProps {
  post: Post;
  onLike?: () => void;
  onDelete?: () => void;
}

export default function PostCard({ post, onLike, onDelete }: PostCardProps) {
  const profile = post.profiles;
  const displayName = profile?.full_name || profile?.username || 'Unknown';
  const avatarLetter = displayName[0]?.toUpperCase() || '?';
  const timeAgo = getTimeAgo(post.created_at);

  const getRankIcon = () => {
    if (!profile) return null;
    if (profile.role === 'ceo') return <Crown size={14} className="badge-ceo" />;
    if (profile.role === 'dev') return <Code size={14} className="badge-dev" />;
    if (profile.role === 'staff') return <Shield size={14} className="badge-staff" />;
    return profile.is_verified ? <CheckCircle size={14} className="verified-badge" /> : null;
  };

  const getAuraClass = () => {
    if (!profile) return '';
    if (profile.role === 'ceo') return 'aura-ceo';
    if (profile.role === 'dev') return 'aura-dev';
    return '';
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: 'Aurbit Post', text: post.content, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(post.content);
      alert('Post copied to clipboard!');
    }
  };

  return (
    <article className={`glass-card ${styles.postCard} ${profile?.role === 'ceo' ? styles.ceoPost : ''}`}>
      <div className={styles.postHeader}>
        <div className={styles.authorInfo}>
          <div className={`${styles.avatarContainer} ${getAuraClass()}`}>
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className={styles.postAvatar} />
            ) : (
              <div className={styles.postAvatarPlaceholder}>{avatarLetter}</div>
            )}
          </div>
          <div>
            <div className={styles.nameRow}>
              <span className={styles.authorName}>{displayName}</span>
              {getRankIcon()}
            </div>
            <span className={styles.postTime}>{timeAgo}</span>
          </div>
        </div>
        {post.mood && post.mood !== 'All Spaces' && <span className={styles.moodTag}>{post.mood}</span>}
      </div>
      
      <p className={styles.postContent}>{post.content}</p>
      
      <div className={styles.postActions}>
        <button className={styles.actionBtn} onClick={onLike}>
          <Heart size={18} /> <span>{post.likes_count || 0}</span>
        </button>
        <button className={styles.actionBtn}>
          <MessageCircle size={18} /> <span>{post.comments_count || 0}</span>
        </button>
        <button className={styles.actionBtn} onClick={handleShare}>
          <Share2 size={18} /> <span>Share</span>
        </button>
        {onDelete && (
          <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={onDelete}>
            <Trash2 size={18} />
          </button>
        )}
      </div>
    </article>
  );
}

function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
