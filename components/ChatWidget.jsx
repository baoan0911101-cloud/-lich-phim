'use client';

import { useState, useEffect, useRef } from 'react';
import Pusher from 'pusher-js';

const AVATARS = ['👤', '🐱', '🐶', '🦊', '🐼', '🐯', '🦁', '🐸', '🐵', '🐧'];
const QUICK_REACTIONS = ['😂', '😭', '🔥', '👏', '❤️', '👍', '🙏', '😱', '🌸'];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [userId, setUserId] = useState('');
  const [profile, setProfile] = useState({ name: '', avatar: '👤' });
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [isPusherReady, setIsPusherReady] = useState(true);
  const [replyTo, setReplyTo] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    let id = localStorage.getItem('chat_userId');
    if (!id) {
      id = 'user_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('chat_userId', id);
    }
    setUserId(id);

    const savedProfile = localStorage.getItem('chat_profile');
    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile));
      } catch {
        setProfile({ name: 'Khách #' + id.slice(-4), avatar: '👤' });
      }
    } else {
      setProfile({ name: 'Khách #' + id.slice(-4), avatar: '👤' });
    }
  }, []);

  useEffect(() => {
    if (!userId) return;

    fetch('/api/chat')
      .then((r) => r.json())
      .then((d) => setMessages(d.messages || []))
      .catch(() => {});

    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    if (!pusherKey) {
      setIsPusherReady(false);
      return;
    }

    const pusher = new Pusher(pusherKey, { cluster: pusherCluster || 'ap1' });
    const channel = pusher.subscribe('chat-global');
    channel.bind('new-message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe('chat-global');
      pusher.disconnect();
    };
  }, [userId]);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !userId) return;

    const content = newMsg.trim();
    setNewMsg('');
    setReplyTo(null);

    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, content }),
      });
    } catch (err) {
      // Giữ nguyên cách gửi tin nhắn hiện tại; lỗi mạng không làm vỡ giao diện.
    }
  };

  const handleSaveProfile = async (name, avatar) => {
    const nextProfile = { name: name.trim() || `Khách #${userId.slice(-4)}`, avatar };
    setProfile(nextProfile);
    localStorage.setItem('chat_profile', JSON.stringify(nextProfile));
    try {
      await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, ...nextProfile }),
      });
    } catch (err) {}
    setShowEditProfile(false);
  };

  const insertReaction = (emoji) => {
    setNewMsg((current) => (current + emoji).slice(0, 150));
    inputRef.current?.focus();
  };

  if (!isPusherReady) return null;

  return (
    <div className="fixed bottom-6 right-4 sm:bottom-8 sm:right-6 z-50 font-sans">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Mở phòng chat"
          className="group relative flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-300/30 bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 text-2xl text-white shadow-[0_12px_35px_rgba(16,185,129,.35)] transition duration-300 hover:-translate-y-1 hover:scale-105"
        >
          <span className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 transition group-hover:opacity-100" />
          <span className="relative">💬</span>
          <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border-2 border-[#080d12] bg-emerald-300" />
        </button>
      )}

      {isOpen && (
        <section className="chat-panel flex h-[min(620px,calc(100dvh-32px))] w-[min(390px,calc(100vw-24px))] flex-col overflow-hidden rounded-[26px] border border-white/[0.11] bg-[#080b10] text-white shadow-[0_24px_90px_rgba(0,0,0,.65)] ring-1 ring-black/30 animate-[chatEnter_.28s_cubic-bezier(.2,.8,.2,1)]">
          <style jsx>{`
            @keyframes chatEnter {
              from { opacity: 0; transform: translateY(14px) scale(.98); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
            .chat-scroll { scrollbar-width: thin; scrollbar-color: #27343a transparent; }
            .chat-scroll::-webkit-scrollbar { width: 5px; }
            .chat-scroll::-webkit-scrollbar-thumb { background: #27343a; border-radius: 99px; }
          `}</style>

          {/* Header */}
          <header className="relative flex items-center justify-between border-b border-white/[0.07] bg-gradient-to-b from-[#171b22] to-[#11151b] px-4 py-3.5">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />
            <div className="flex min-w-0 items-center gap-3">
              <button
                onClick={() => setShowEditProfile(true)}
                title="Chỉnh sửa hồ sơ"
                className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-violet-300/30 bg-gradient-to-br from-violet-500/30 to-indigo-500/20 text-xl shadow-inner transition hover:scale-105"
              >
                {profile.avatar}
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#171b22] bg-emerald-400" />
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="max-w-[170px] truncate text-[13px] font-bold tracking-wide text-slate-100">{profile.name}</h3>
                  <span className="rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[9px] font-medium text-slate-500">#{userId.slice(-4)}</span>
                </div>
                <button onClick={() => setShowEditProfile(true)} className="mt-0.5 text-[10px] text-slate-500 transition hover:text-emerald-300">
                  ✎ Sửa hồ sơ
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/[0.08] px-2.5 py-1.5 text-[10px] font-bold tabular-nums text-emerald-300">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                {messages.length}
              </div>
              <button aria-label="Đóng chat" onClick={() => setIsOpen(false)} className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white/[0.07] hover:text-white">✕</button>
            </div>
          </header>

          {/* Global room */}
          <div className="px-3.5 pb-3 pt-3">
            <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-400/30 bg-gradient-to-r from-emerald-950/80 via-emerald-900/50 to-teal-950/70 px-3 py-2.5 shadow-[inset_0_1px_rgba(255,255,255,.03)]">
              <span className="text-xs">🌐</span>
              <span className="text-[11px] font-bold tracking-wide text-emerald-300">Toàn Web</span>
              <span className="rounded-md bg-emerald-400/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-200">{messages.length}</span>
            </div>
          </div>

          {/* Messages */}
          <div className="chat-scroll flex-1 space-y-4 overflow-y-auto px-3.5 pb-4">
            {messages.length === 0 && (
              <div className="flex h-full min-h-36 flex-col items-center justify-center text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.03] text-2xl">👋</div>
                <p className="text-xs font-semibold text-slate-300">Bắt đầu cuộc trò chuyện</p>
                <p className="mt-1 text-[11px] text-slate-600">Gửi lời chào đến mọi người nhé!</p>
              </div>
            )}
            {messages.map((msg, i) => {
              const isMe = msg.user_id === userId;
              const userAvatar = isMe ? profile.avatar : (msg.avatar || '👤');
              return (
                <div key={msg.id || `${msg.user_id || 'user'}-${msg.created_at || i}-${i}`} className={`group flex items-end gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                  <div className={`mb-5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm shadow-sm ${isMe ? 'border-emerald-300/25 bg-emerald-400/10' : 'border-white/[0.08] bg-[#1a2029]'}`}>
                    {userAvatar}
                  </div>
                  <div className={`flex max-w-[78%] min-w-0 flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className="mb-1.5 flex items-center gap-2 px-1">
                      {!isMe && <span className="max-w-[140px] truncate text-[10px] font-semibold text-slate-400">{msg.name || 'Khách'}</span>}
                      <span className="text-[9px] tabular-nums text-slate-600">
                        {msg.created_at ? new Date(msg.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <div className={`relative whitespace-pre-wrap break-words rounded-[18px] px-3.5 py-2.5 text-[12px] leading-[1.65] shadow-sm transition-colors ${
                      isMe
                        ? 'rounded-br-md border border-emerald-300/20 bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-950/30'
                        : 'rounded-bl-md border border-white/[0.06] bg-[#1b2028] text-slate-200 hover:bg-[#202630]'
                    }`}>
                      {msg.content}
                      <button
                        onClick={() => setReplyTo({ name: msg.name || (isMe ? profile.name : 'Khách'), content: msg.content })}
                        title="Trả lời tin nhắn"
                        aria-label="Trả lời tin nhắn"
                        className={`absolute top-1/2 -translate-y-1/2 rounded-lg border border-white/10 bg-[#11161d] p-1.5 text-slate-400 opacity-0 shadow-lg transition hover:text-emerald-300 group-hover:opacity-100 focus:opacity-100 ${isMe ? '-left-9' : '-right-9'}`}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 17H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4"/><polyline points="9 11 12 14 22 4"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} className="h-1" />
          </div>

          {/* Quick reactions */}
          <div className="border-t border-white/[0.06] bg-[#0e1218] px-3.5 py-2">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[9px] font-bold uppercase tracking-[.12em] text-slate-600">Phản ứng nhanh</span>
              <span className="text-[9px] text-slate-700">Chạm để thêm</span>
            </div>
            <div className="flex items-center justify-between gap-1">
              {QUICK_REACTIONS.map((emoji) => (
                <button key={emoji} type="button" onClick={() => insertReaction(emoji)} aria-label={`Thêm ${emoji}`} className="flex h-7 min-w-0 flex-1 items-center justify-center rounded-lg text-base transition hover:-translate-y-0.5 hover:bg-white/[0.07] active:scale-90">
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Reply preview */}
          {replyTo && (
            <div className="mx-3.5 mt-2 flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] px-3 py-2">
              <div className="h-8 w-0.5 shrink-0 rounded-full bg-emerald-400" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[10px] font-bold text-emerald-300">Đang trả lời {replyTo.name}</p>
                <p className="truncate text-[11px] text-slate-500">{replyTo.content}</p>
              </div>
              <button onClick={() => setReplyTo(null)} aria-label="Hủy trả lời" className="rounded-md p-1 text-slate-500 transition hover:bg-white/[0.06] hover:text-white">✕</button>
            </div>
          )}

          {/* Composer */}
          <form onSubmit={handleSend} className="border-t border-white/[0.06] bg-[#11151b] p-3.5">
            <div className="flex items-end gap-2 rounded-2xl border border-white/[0.09] bg-[#090d12] p-1.5 transition focus-within:border-emerald-400/40 focus-within:shadow-[0_0_0_3px_rgba(52,211,153,.06)]">
              <input
                ref={inputRef}
                type="text"
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value.slice(0, 150))}
                placeholder="Gửi lời dạo..."
                maxLength={150}
                aria-label="Nội dung tin nhắn"
                className="h-9 min-w-0 flex-1 bg-transparent px-2 text-xs text-slate-100 outline-none placeholder:text-slate-600"
              />
              <button type="submit" disabled={!newMsg.trim()} className="flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-3.5 text-[11px] font-bold text-white shadow-[0_3px_12px_rgba(16,185,129,.18)] transition hover:brightness-110 active:scale-[.97] disabled:cursor-not-allowed disabled:opacity-40">
                Gửi
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
              </button>
            </div>
            <div className="flex items-center justify-between px-1 pt-2">
              <span className="text-[9px] text-slate-600">Enter để gửi tin nhắn</span>
              <span className={`text-[9px] tabular-nums ${newMsg.length >= 140 ? 'text-amber-400' : 'text-slate-600'}`}>{newMsg.length}/150</span>
            </div>
          </form>
        </section>
      )}

      {/* Profile modal */}
      {showEditProfile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md" onClick={() => setShowEditProfile(false)}>
          <div className="w-full max-w-sm rounded-[26px] border border-white/10 bg-[#11161e] p-5 shadow-[0_25px_100px_rgba(0,0,0,.7)] animate-[chatEnter_.2s_ease-out]" onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-300/20 bg-violet-400/10 text-2xl">{profile.avatar}</div>
              <div>
                <h2 className="text-base font-bold text-white">Hồ sơ của bạn</h2>
                <p className="mt-0.5 text-[11px] text-slate-500">Cá nhân hóa tên và ảnh đại diện</p>
              </div>
              <button onClick={() => setShowEditProfile(false)} className="ml-auto rounded-lg p-1.5 text-slate-500 hover:bg-white/[0.06] hover:text-white">✕</button>
            </div>
            <label className="mb-2 block text-[11px] font-semibold text-slate-400">Tên hiển thị</label>
            <input
              type="text"
              value={profile.name}
              maxLength={15}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="mb-5 h-11 w-full rounded-xl border border-white/[0.08] bg-[#090d12] px-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-400/50"
            />
            <p className="mb-2 text-[11px] font-semibold text-slate-400">Chọn avatar</p>
            <div className="mb-6 grid grid-cols-5 gap-2">
              {AVATARS.map((av) => (
                <button key={av} type="button" onClick={() => setProfile({ ...profile, avatar: av })} className={`aspect-square rounded-xl border text-xl transition hover:-translate-y-0.5 ${profile.avatar === av ? 'border-emerald-400/70 bg-emerald-400/10 shadow-[0_0_0_2px_rgba(52,211,153,.08)]' : 'border-white/[0.06] bg-white/[0.03] hover:border-white/20'}`}>
                  {av}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowEditProfile(false)} className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] py-2.5 text-xs font-bold text-slate-300 transition hover:bg-white/[0.08]">Hủy</button>
              <button onClick={() => handleSaveProfile(profile.name, profile.avatar)} className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-950/30 transition hover:brightness-110">Lưu thay đổi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
