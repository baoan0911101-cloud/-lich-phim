'use client';
import { useState, useEffect, useRef } from 'react';
import Pusher from 'pusher-js';

const AVATARS = ['👤', '🐱', '🐶', '🦊', '🐼', '🐯', '🦁', '🐸', '🐵', '🐧'];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [userId, setUserId] = useState('');
  const [profile, setProfile] = useState({ name: '', avatar: '👤' });
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [isPusherReady, setIsPusherReady] = useState(true);

  // State cho Reply
  const [replyTo, setReplyTo] = useState(null);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    let id = localStorage.getItem('chat_userId');
    if (!id) {
      id = 'user_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('chat_userId', id);
    }
    setUserId(id);

    const savedProfile = localStorage.getItem('chat_profile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    } else {
      setProfile({ name: 'Khách #' + id.slice(-4), avatar: '👤' });
    }
  }, []);

  useEffect(() => {
    if (!userId) return;

    fetch('/api/chat')
      .then(r => r.json())
      .then(d => setMessages(d.messages || []))
      .catch(() => {});

    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    if (!pusherKey) {
      setIsPusherReady(false);
      return;
    }

    const pusher = new Pusher(pusherKey, {
      cluster: pusherCluster || 'ap1',
    });
    const channel = pusher.subscribe('chat-global');
    
    channel.bind('new-message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => pusher.unsubscribe('chat-global');
  }, [userId]);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !userId) return;

    const content = newMsg;
    setNewMsg('');
    setReplyTo(null); // Xoá trạng thái reply sau khi gửi
    
    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, content })
      });
    } catch (err) {}
  };

  const handleSaveProfile = async (name, avatar) => {
    setProfile({ name, avatar });
    localStorage.setItem('chat_profile', JSON.stringify({ name, avatar }));
    await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: userId, name, avatar })
    });
    setShowEditProfile(false);
  };

  if (!isPusherReady) return null;

  return (
    <div className="fixed bottom-24 right-4 z-50">
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)} 
          className="w-14 h-14 rounded-full bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)] flex items-center justify-center text-2xl hover:scale-110 transition-transform"
        >
          💬
        </button>
      )}

      {isOpen && (
        <div className="w-[340px] h-[550px] bg-[#0a0f18] border border-white/5 rounded-2xl shadow-2xl flex flex-col overflow-hidden anim-fadeInUp">
          
          {/* HEADER */}
          <div className="bg-[#111827] p-3 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-lg shadow-sm">
                  {profile.avatar}
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#111827] rounded-full"></span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white leading-tight flex items-center gap-1">
                  {profile.name}
                </h3>
                <button onClick={() => setShowEditProfile(true)} className="text-[10px] text-emerald-400 hover:underline">
                  Sửa hồ sơ
                </button>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white text-lg transition-colors">✕</button>
          </div>

          {/* THÔNG BÁO TOÀN WEB */}
          <div className="px-3 py-2 bg-[#0a0f18]">
            <div className="w-full py-1.5 rounded-lg bg-emerald-900/30 border border-emerald-500/30 flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[11px] font-medium text-emerald-400">Toàn Web (51)</span>
            </div>
          </div>

          {/* TIN NHẮN */}
          <div className="flex-1 px-3 overflow-y-auto no-scrollbar space-y-4">
            {messages.map((msg, i) => {
              const isMe = msg.user_id === userId;
              const userAvatar = isMe ? profile.avatar : (msg.avatar || '👤');
              
              return (
                <div key={i} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 border ${
                    isMe ? 'bg-emerald-500/20 border-emerald-500/50' : 'bg-[#1e293b] border-white/10'
                  }`}>
                    {userAvatar}
                  </div>
                  
                  {/* Nội dung */}
                  <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                    {/* Tên + Giờ */}
                    <div className="flex items-center gap-2 mb-1 px-1">
                      {!isMe && <span className="text-[10px] text-slate-400 font-medium">{msg.name}</span>}
                      <span className="text-[9px] text-slate-500">
                        {new Date(msg.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Bong bóng chat */}
                    <div 
                      className={`px-3 py-2 text-[13px] leading-relaxed break-words whitespace-pre-wrap relative group ${
                        isMe 
                          ? 'bg-emerald-500 text-white rounded-2xl rounded-tr-sm shadow-[0_2px_10px_rgba(16,185,129,0.2)]' 
                          : 'bg-[#1e293b] text-slate-200 rounded-2xl rounded-tl-sm'
                      }`}
                    >
                      {msg.content}
                      
                      {/* Nút trả lời (hiện khi hover) */}
                      <button 
                        onClick={() => setReplyTo({ name: msg.name, content: msg.content })}
                        className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-white ${
                          isMe ? '-left-8' : '-right-8'
                        }`}
                        title="Trả lời"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 17H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4"/><polyline points="9 11 12 14 22 4"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} className="h-2" />
          </div>

          {/* THANH REPLY (Khi đang trả lời) */}
          {replyTo && (
            <div className="px-3 py-2 bg-[#111827] border-t border-white/5 flex items-center justify-between">
              <div className="flex-1 min-w-0 border-l-2 border-emerald-500 pl-2">
                <p className="text-[10px] text-emerald-400 font-bold truncate">Đang trả lời {replyTo.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{replyTo.content}</p>
              </div>
              <button onClick={() => setReplyTo(null)} className="text-slate-500 hover:text-white p-1 ml-2">✕</button>
            </div>
          )}

          {/* Ô NHẬP TIN NHẮN */}
          <form onSubmit={handleSend} className="p-3 bg-[#111827] border-t border-white/5 flex gap-2 items-center">
            <input
              type="text"
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              placeholder="Gửi lời dạo (tối đa 150 ký tự)..."
              maxLength={150}
              className="flex-1 h-10 rounded-xl bg-[#0a0f18] border border-white/10 px-4 text-xs text-white focus:outline-none focus:border-emerald-500/50 transition-colors placeholder:text-slate-500"
            />
            <button type="submit" className="h-10 px-4 rounded-xl bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 hover:bg-emerald-600 transition-colors shadow-[0_2px_10px_rgba(16,185,129,0.3)]">
              <span>Gửi</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </form>
        </div>
      )}

      {/* MODAL SỬA PROFILE */}
      {showEditProfile && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] rounded-2xl w-full max-w-sm p-5 border border-white/10 shadow-2xl anim-scaleIn">
            <h2 className="text-lg font-bold text-white mb-4">Chỉnh sửa hồ sơ</h2>
            <input
              type="text"
              defaultValue={profile.name}
              maxLength={15}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full h-10 rounded-xl bg-[#1e293b] px-3 text-sm text-white mb-4 focus:outline-none focus:border-emerald-500 border border-transparent transition-colors"
            />
            <p className="text-xs text-slate-400 mb-2">Chọn Avatar:</p>
            <div className="grid grid-cols-5 gap-2 mb-5">
              {AVATARS.map((av) => (
                <button
                  key={av}
                  onClick={() => setProfile({ ...profile, avatar: av })}
                  className={`aspect-square rounded-xl flex items-center justify-center text-xl ${profile.avatar === av ? 'bg-emerald-500/20 border-2 border-emerald-500' : 'bg-[#1e293b] border border-transparent'}`}
                >
                  {av}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowEditProfile(false)} className="flex-1 py-2 rounded-xl text-slate-400 font-bold text-sm bg-[#1e293b]">Hủy</button>
              <button onClick={() => handleSaveProfile(profile.name, profile.avatar)} className="flex-1 py-2 rounded-xl text-white font-bold text-sm bg-emerald-500 hover:bg-emerald-600">Lưu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
