'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import styles from './chat.module.css';
import { 
  Send, Phone, Video, MoreVertical, Mic, PhoneOff, MicOff, 
  VideoOff, Square, X, CheckCircle, Shield, Camera, Image as ImageIcon,
  Maximize2
} from 'lucide-react';
import Orbit3D from '@/components/chat/Orbit3D';
import CameraModal from '@/components/chat/CameraModal';
import { createClient } from '@/lib/supabase/client';
import { encryptContent, decryptContent, getSharedKeyForConversation } from '@/lib/crypto';
import { useAppConfig } from '@/context/AppConfigContext';

export default function ChatPage() {
  const { user } = useUser();
  const { lowPowerMode } = useAppConfig();
  const [isRecording, setIsRecording] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [decryptedMessages, setDecryptedMessages] = useState<Record<string, string>>({});
  const [messageText, setMessageText] = useState('');
  const [contacts, setContacts] = useState<any[]>([]);
  const [activeContact, setActiveContact] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  // Load contacts
  useEffect(() => {
    const loadContacts = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .limit(20);
      if (data) {
        const filtered = data.filter(p => p.id !== user?.id);
        setContacts(filtered);
        if (filtered.length > 0) setActiveContact(filtered[0]);
      }
    };
    if (user) loadContacts();
  }, [user]);

  // Decryption logic
  useEffect(() => {
    const decryptAll = async () => {
      if (!activeContact || !user) return;
      const convoId = [user.id, activeContact.id].sort().join('-');
      const key = await getSharedKeyForConversation(convoId);
      const newDecrypted: Record<string, string> = {};

      for (const msg of messages) {
        if (msg.content.startsWith('{')) {
          newDecrypted[msg.id] = await decryptContent(msg.content, key);
        } else {
          newDecrypted[msg.id] = msg.content;
        }
      }
      setDecryptedMessages(newDecrypted);
    };
    decryptAll();
  }, [messages, activeContact, user]);

  // Subscription
  useEffect(() => {
    if (!user || !activeContact) return;
    const loadMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${activeContact.id}),and(sender_id.eq.${activeContact.id},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });
      if (data) setMessages(data);
    };
    loadMessages();

    const channel = supabase
      .channel(`chat-${activeContact.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const msg = payload.new as any;
        if ((msg.sender_id === user.id && msg.receiver_id === activeContact.id) || (msg.sender_id === activeContact.id && msg.receiver_id === user.id)) {
          setMessages(prev => [...prev, msg]);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, activeContact]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, decryptedMessages]);

  const sendMessage = async (text?: string, mediaUrl?: string) => {
    const contentToSend = text || messageText;
    if ((!contentToSend.trim() && !mediaUrl) || !user || !activeContact) return;

    const convoId = [user.id, activeContact.id].sort().join('-');
    const key = await getSharedKeyForConversation(convoId);
    
    // Logic: If it's a media URL, we still encrypt the URL itself for E2EE privacy
    const payload = mediaUrl ? `MEDIA_URL:${mediaUrl}` : contentToSend;
    const encrypted = await encryptContent(payload, key);

    const { data } = await supabase
      .from('messages')
      .insert({ 
        sender_id: user.id, 
        receiver_id: activeContact.id, 
        content: encrypted, 
        is_voice: false 
      })
      .select()
      .single();

    if (data) setMessages(prev => [...prev, data]);
    setMessageText('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement> | Blob) => {
    const file = e instanceof Blob ? e : e.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    const fileExt = e instanceof Blob ? 'jpg' : file.name.split('.').pop();
    const fileName = `${user.id}-${Math.random()}.${fileExt}`;
    const filePath = `chat/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('chat-media')
      .upload(filePath, file);

    if (uploadError) {
      console.error(uploadError);
      setIsUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('chat-media').getPublicUrl(filePath);
    await sendMessage('', urlData.publicUrl);
    setIsUploading(false);
  };

  const renderMessageContent = (msgId: string) => {
    const content = decryptedMessages[msgId];
    if (!content) return 'Decrypting...';

    if (content.startsWith('MEDIA_URL:')) {
      const url = content.replace('MEDIA_URL:', '');
      return (
        <div className={styles.mediaContainer}>
          <img src={url} alt="Shared media" className={styles.sharedImage} />
          <button className={styles.expandMedia}><Maximize2 size={14} /></button>
        </div>
      );
    }
    return content;
  };

  return (
    <div className={`${styles.chatLayout} no-lag`}>
      {isCameraOpen && (
        <CameraModal 
          onClose={() => setIsCameraOpen(false)} 
          onCapture={handleFileUpload} 
        />
      )}

      {/* ===== PEAK UI CALL OVERLAY ===== */}
      {isInCall && (
        <div className={styles.callOverlay}>
          <div className={styles.callVideoMain}>
            <div className={styles.callVideoPlaceholder}>
              <Orbit3D lowPower={lowPowerMode} className={styles.callOrbit} />
              <div className={styles.callStatus}>
                <Shield size={16} className="text-green-400" />
                <span>E2EE Secure Call with {activeContact?.full_name || 'Orbit'}</span>
              </div>
            </div>
            <div className={`${styles.callVideoMini} clay-card`}>
              {isCamOff ? <VideoOff size={24} color="#fff" /> : (user?.firstName?.[0] || 'Me')}
            </div>
            <button className={styles.callCloseBtn} onClick={() => setIsInCall(false)}>
              <X size={20} />
            </button>
          </div>
          <div className={styles.callControls}>
            <button className={`clay-button ${isMuted ? styles.active : ''}`} onClick={() => setIsMuted(!isMuted)}>
              {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
            </button>
            <button className={`clay-button ${isCamOff ? styles.active : ''}`} onClick={() => setIsCamOff(!isCamOff)}>
              {isCamOff ? <VideoOff size={24} /> : <Video size={24} />}
            </button>
            <button className={`${styles.callBtnEnd} clay-button`} onClick={() => setIsInCall(false)}>
              <PhoneOff size={24} />
            </button>
          </div>
        </div>
      )}

      {/* ===== Chat Sidebar ===== */}
      <aside className={styles.chatSidebar}>
        <div className={styles.sidebarHeader}>
          <h2>Messages</h2>
          <span className={styles.e2eeLabel}><Shield size={12} /> E2E Encrypted</span>
        </div>
        <div className={styles.chatList}>
          {contacts.map(contact => (
            <div
              key={contact.id}
              className={`${styles.chatListItem} ${activeContact?.id === contact.id ? styles.active : ''}`}
              onClick={() => setActiveContact(contact)}
            >
              <div className={styles.avatar}>
                {contact.avatar_url ? <img src={contact.avatar_url} /> : (contact.full_name?.[0] || '?')}
              </div>
              <div className={styles.chatListInfo}>
                <div className={styles.nameRow}>
                  <span className={styles.chatName}>{contact.full_name || contact.username}</span>
                  {contact.is_verified && <CheckCircle size={14} className="verified-badge" />}
                </div>
                <span className={styles.chatPreview}>Tap to secure orbit</span>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* ===== Chat Area ===== */}
      <main className={styles.chatArea}>
        {activeContact ? (
          <>
            <header className={styles.chatHeader}>
              <div className={styles.headerInfo}>
                <div className={styles.avatar}>{(activeContact.full_name || '?')[0]}</div>
                <div className={styles.headerText}>
                  <div className={styles.nameRow}>
                    <h2>{activeContact.full_name || activeContact.username}</h2>
                    {activeContact.is_verified && <CheckCircle size={16} className="verified-badge" />}
                  </div>
                  <span className={styles.onlineStatus}>Active Orbit</span>
                </div>
              </div>
              <div className={styles.headerActions}>
                <button className="clay-button" onClick={() => setIsInCall(true)}><Phone size={18} /></button>
                <button className="clay-button" onClick={() => setIsInCall(true)}><Video size={18} /></button>
              </div>
            </header>

            <div className={styles.messageScroll} ref={scrollRef}>
              {messages.map(msg => (
                <div key={msg.id} className={`${styles.messageWrapper} ${msg.sender_id === user?.id ? styles.messageRight : styles.messageLeft}`}>
                  <div className={`${styles.messageBubble} ${msg.sender_id === user?.id ? styles.bubbleMe : styles.bubbleThem}`}>
                    {renderMessageContent(msg.id)}
                    <span className={styles.messageTime}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              {isUploading && (
                <div className={`${styles.messageWrapper} ${styles.messageRight}`}>
                  <div className={`${styles.messageBubble} ${styles.bubbleMe}`} style={{ opacity: 0.6 }}>
                    Uploading High-Res...
                  </div>
                </div>
              )}
            </div>

            <footer className={styles.chatComposer}>
              <div className={styles.composerActions}>
                <button className="clay-button" onClick={() => setIsCameraOpen(true)}>
                  <Camera size={20} />
                </button>
                <button className="clay-button" onClick={() => fileInputRef.current?.click()}>
                  <ImageIcon size={20} />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  hidden 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                />
              </div>
              <input
                type="text"
                className="input-field"
                placeholder="Secure message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              />
              <button className="btn-aurbit" onClick={() => sendMessage()} disabled={!messageText.trim()}>
                <Send size={20} />
              </button>
            </footer>
          </>
        ) : (
          <div className={styles.emptyChat}>
            <Orbit3D lowPower={lowPowerMode} />
            <p>Select a connection to enter orbit</p>
          </div>
        )}
      </main>
    </div>
  );
}
