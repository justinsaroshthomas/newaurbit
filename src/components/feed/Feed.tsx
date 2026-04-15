'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import PostCard from './PostCard';
import styles from './feed.module.css';
import { createClient } from '@/lib/supabase/client';

interface Post {
  id: string;
  content: string;
  author_id: string;
  created_at: string;
  likes_count: number;
  profiles: {
    username: string;
    full_name: string;
    avatar_url: string;
    is_verified: boolean;
    role: string;
  };
}

export default function Feed({ mood }: { mood: string }) {
  const { user } = useUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [postText, setPostText] = useState('');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchPosts = async () => {
    setLoading(true);
    let query = supabase
      .from('posts')
      .select('*, profiles(username, full_name, avatar_url, is_verified, role)')
      .order('created_at', { ascending: false })
      .limit(50);

    if (mood === 'Global Orbit') {
      // Global Orbit only shows posts from Verified/Staff users
      query = query.filter('profiles.is_verified', 'eq', true);
    } else if (mood !== 'All Spaces') {
      query = query.eq('mood', mood);
    }

    const { data } = await query;
    if (data) setPosts(data as Post[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, [mood]);
    if (!postText.trim() || !user) return;

    // Verify profile exists
    let { data: profile } = await supabase
      .from('profiles')
      .select('id, is_verified, role')
      .eq('id', user.id)
      .single();

    if (!profile) {
      const { data: newProfile } = await supabase.from('profiles').insert({
        id: user.id,
        username: user.username || user.firstName?.toLowerCase() || 'user',
        full_name: user.fullName || 'Aurbit User',
        avatar_url: user.imageUrl,
      }).select().single();
      profile = newProfile;
    }

    const { data: newPost } = await supabase
      .from('posts')
      .insert({ author_id: user.id, content: postText, mood: mood === 'Global Orbit' ? 'All Spaces' : mood })
      .select('*, profiles(username, full_name, avatar_url, is_verified, role)')
      .single();

    if (newPost) {
      setPosts([newPost, ...posts]);
      
      // If CEO/Dev posts, send broadcast notifications (logic-only simulation for prototype)
      if (profile?.role === 'ceo' || profile?.role === 'dev') {
        const { data: allUsers } = await supabase.from('profiles').select('id').neq('id', user.id);
        if (allUsers) {
          const notifications = allUsers.map(u => ({
            user_id: u.id,
            type: 'broadcast',
            content: `Official Update: ${newPost.content.substring(0, 30)}...`,
            sender_id: user.id,
            link: `/#post-${newPost.id}`
          }));
          await supabase.from('notifications').insert(notifications);
        }
      }
    }
    setPostText('');
  };

  const handleLike = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    setPosts(posts.map(p => p.id === postId 
      ? { ...p, likes_count: (p.likes_count || 0) + 1 } 
      : p
    ));
    
    await supabase.from('posts').update({ 
      likes_count: (post.likes_count || 0) + 1 
    }).eq('id', postId);
  };

  return (
    <div className={styles.feedContainer}>
      <div className={`${styles.composerCard} glass-panel`}>
        <div className={styles.composerAvatar}>
          {user?.imageUrl ? (
            <img src={user.imageUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div className={styles.avatarPlaceholder}>{user?.firstName?.[0] || '?'}</div>
          )}
        </div>
        <input 
          type="text" 
          className="input-field" 
          placeholder={mood === 'Global Orbit' ? "Only Verified orbits can post here..." : "Expand your orbit..."}
          value={postText}
          onChange={(e) => setPostText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handlePost()}
          style={{ borderRadius: '24px' }}
        />
        <button className="btn-aurbit" onClick={handlePost} disabled={!postText.trim()}>Post</button>
      </div>

      {loading ? (
        <div className={styles.loadingContainer}>💫 Initializing Orbit...</div>
      ) : posts.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No orbit activity in this space yet.</p>
        </div>
      ) : (
        <div className={styles.postsList}>
          {posts.map(post => (
            <PostCard 
              key={post.id} 
              post={post} 
              onLike={() => handleLike(post.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
