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
  
  // 🛡️ Cờ kiểm tra xem Pusher đã được cấu hình chưa
  const [isPusherReady, setIsPusherReady] = useState(true);

  const messagesEndRef = useRef(null);

  // Lấy hoặc tạo User ID
  useEffect(() => {
    let id = localStorage.getItem('chat_userId');
    if (!id) {
      id = 'user_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('chat_userId', id);
    }
    setUserId(id);

    // Lấy profile từ localStorage nếu có
    const savedProfile = localStorage.getItem('chat_profile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    } else {
      setProfile({ name: 'Khách #' + id.slice(-4), avatar: '👤' });
    }
  }, []);

  // Load tin nhắn cũ và kết nối Pusher
  useEffect(() => {
    if (!userId) return;

    // 1. Load lịch sử
    fetch('/api/chat')
      .then(r => r.json())
      .then(d => setMessages(d.messages || []))
      .catch(() => {});

    // 2. Kết nối Pusher (Có kiểm tra an toàn)
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    if (!pusherKey) {
      console.warn("⚠️ Cảnh báo: Chưa cấu hình NEXT_PUBLIC_PUSHER_KEY. Ẩn nút chat để bảo vệ web.");
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

  // Auto scroll xuống cuối
  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !userId) return;

    const content = newMsg;
    setNewMsg('');
    await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, content })
    });
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

  // Nếu Pusher chưa sẵn sàng (thiếu Key) thì không hiển thị gì cả
  if (!isPusherReady) return null;

  return (
    <div className="fixed bottom-24 right-4 z-50">
      {/* NÚT BẤM CHAT */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)} 
          className="w-14 h-14 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-2xl flex items-center justify-center text-2xl btn-tap hover:scale-110 transition-transform"
        >
          💬
        </button>
      )}

      {/* KHUNG CHAT */}
      {isOpen && (
        <div className="w-80 h-[500px] bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden anim-fadeInUp">
          {/* HEADER */}
          <div className="bg-[#1e293b] p-3 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-sm shadow-lg">
                {profile.avatar}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{profile.name}</h3>
                <button onClick={() => setShowEditProfile(true)} className="text-[10px] text-amber-400 hover:underline">
                  Sửa hồ sơ
                </button>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white text-lg">✕</button>
          </div>

          {/* TIN NHẮN */}
          <div className="flex-1 p-3 overflow-y-auto no-scrollbar space-y-3">
            {messages.map((msg, i) => {
              const isMe = msg.user_id === userId;
              return (
                <div key={i} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                  <div className="w-7 h-7 rounded-full bg-[#1e293b] flex items-center justify-center text-sm shrink-0">
                    {msg.avatar}
                  </div>
                  <div className={`max-w-[75%] ${isMe ? 'text-right' : 'text-left'}`}>
                    {!isMe && <span className="text-[10px] text-slate-400 mb-0.5 block">{msg.name}</span>}
                    <div className={`px-3 py-1.5 rounded-xl text-xs inline-block ${isMe ? 'bg-emerald-500 text-white rounded-tr-sm' : 'bg-[#1e293b] text-slate-200 rounded-tl-sm'}`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Ô NHẬP TIN NHẮN */}
          <form onSubmit={handleSend} className="p-2 bg-[#1e293b] flex gap-2">
            <input
              type="text"
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              placeholder="Gửi tin nhắn..."
              className="flex-1 h-9 rounded-lg bg-black/30 px-3 text-xs text-white focus:outline-none"
            />
            <button type="submit" className="w-9 h-9 rounded-lg bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 btn-tap">
              ➤
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
