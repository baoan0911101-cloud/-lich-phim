'use client';

import { useState, useEffect, useRef } from 'react';
import Pusher from 'pusher-js';

const AVATARS = ['👤', '🐱', '🐶', '🦊', '🐼', '🐯', '🦁', '🐸', '🐵', '🐧'];
const QUICK_EMOJIS = ['😂', '😭', '🔥', '👏', '❤️', '👍', '🙏', '😱', '🌸'];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [userId, setUserId] = useState('');
  const [profile, setProfile] = useState({ name: '', avatar: '👤' });
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [isPusherReady, setIsPusherReady] = useState(true);
  const [replyTo, setReplyTo] = useState(null);
  const [floatingPos, setFloatingPos] = useState(null);
  const [onlineCount] = useState(51);

  const messagesEndRef = useRef(null);
  const dragRef = useRef({ active: false, moved: false, startX: 0, startY: 0, left: 0, top: 0 });
  const bubbleRef = useRef(null);

  useEffect(() => {
    let id = localStorage.getItem('chat_userId');
    if (!id) {
      id = 'user_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('chat_userId', id);
    }
    setUserId(id);

    try {
      const savedProfile = localStorage.getItem('chat_profile');
      if (savedProfile) setProfile(JSON.parse(savedProfile));
      else setProfile({ name: 'Khách #' + id.slice(-4), avatar: '👤' });

      const savedPosition = localStorage.getItem('chat_widget_position');
      if (savedPosition) setFloatingPos(JSON.parse(savedPosition));
    } catch {
      setProfile({ name: 'Khách #' + id.slice(-4), avatar: '👤' });
    }
  }, []);

  useEffect(() => {
    if (!userId) return;

    fetch('/api/chat')
      .then((r) => r.json())
      .then((d) => setMessages(Array.isArray(d.messages) ? d.messages : []))
      .catch(() => {});

    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
    if (!pusherKey) {
      setIsPusherReady(false);
      return;
    }

    const pusher = new Pusher(pusherKey, { cluster: pusherCluster || 'ap1' });
    const channel = pusher.subscribe('chat-global');
    const onNewMessage = (data) => {
      setMessages((prev) => {
        if (data?.id && prev.some((item) => item.id === data.id)) return prev;
        return [...prev, data];
      });
    };
    channel.bind('new-message', onNewMessage);

    return () => {
      channel.unbind('new-message', onNewMessage);
      pusher.unsubscribe('chat-global');
      pusher.disconnect();
    };
  }, [userId]);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isOpen]);

  useEffect(() => {
    if (!floatingPos) return;
    const keepInView = () => {
      setFloatingPos((pos) => {
        if (!pos) return pos;
        const next = {
          x: Math.max(8, Math.min(pos.x, window.innerWidth - 72)),
          y: Math.max(8, Math.min(pos.y, window.innerHeight - 72)),
        };
        if (next.x !== pos.x || next.y !== pos.y) {
          localStorage.setItem('chat_widget_position', JSON.stringify(next));
          return next;
        }
        return pos;
      });
    };
    window.addEventListener('resize', keepInView);
    return () => window.removeEventListener('resize', keepInView);
  }, [floatingPos]);

  const handlePointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    const rect = bubbleRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragRef.current = {
      active: true,
      moved: false,
      startX: e.clientX,
      startY: e.clientY,
      left: rect.left,
      top: rect.top,
    };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e) => {
    const drag = dragRef.current;
    if (!drag.active) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) drag.moved = true;
    if (!drag.moved) return;

    const x = Math.max(8, Math.min(drag.left + dx, window.innerWidth - 68));
    const y = Math.max(8, Math.min(drag.top + dy, window.innerHeight - 68));
    setFloatingPos({ x, y });
  };

  const handlePointerUp = () => {
    const drag = dragRef.current;
    drag.active = false;
    if (drag.moved) {
      setFloatingPos((pos) => {
        if (pos) localStorage.setItem('chat_widget_position', JSON.stringify(pos));
        return pos;
      });
      // Prevent the click generated after a drag from opening the chat.
      window.setTimeout(() => { dragRef.current.moved = false; }, 0);
    }
  };

  const handleBubbleClick = () => {
    if (dragRef.current.moved) return;
    setIsOpen(true);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const content = newMsg.trim();
    if (!content || !userId) return;

    const replyName = replyTo?.name || null;
    const replyContent = replyTo?.content || null;
    setNewMsg('');
    setReplyTo(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, content, replyToName: replyName, replyToContent: replyContent }),
      });
      if (!response.ok) throw new Error('Không gửi được tin nhắn');
    } catch {
      setNewMsg(content);
    }
  };

  const handleSaveProfile = async (name, avatar) => {
    const cleanName = name.trim().slice(0, 15) || `Khách #${userId.slice(-4)}`;
    const nextProfile = { name: cleanName, avatar };
    setProfile(nextProfile);
    localStorage.setItem('chat_profile', JSON.stringify(nextProfile));
    try {
      await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, ...nextProfile }),
      });
      setShowEditProfile(false);
    } catch {
      setShowEditProfile(false);
    }
  };

  const addEmoji = (emoji) => {
    if (newMsg.length >= 150) return;
    setNewMsg((current) => (current + emoji).slice(0, 150));
  };

  if (!isPusherReady) return null;

  const positionStyle = floatingPos
    ? { left: `${floatingPos.x}px`, top: `${floatingPos.y}px`, right: 'auto', bottom: 'auto' }
    : undefined;

  return (
    <>
      <style jsx global>{`
        @keyframes chat-pop-in {
          from { opacity: 0; transform: translateY(12px) scale(.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes chat-glow {
          0%, 100% { box-shadow: 0 8px 26px rgba(16,185,129,.28), 0 0 0 0 rgba(16,185,129,.18); }
          50% { box-shadow: 0 8px 30px rgba(16,185,129,.4), 0 0 0 8px rgba(16,185,129,0); }
        }
        .chat-widget-panel { animation: chat-pop-in .22s ease-out both; }
        .chat-widget-scroll { scrollbar-width: thin; scrollbar-color: #334155 transparent; }
        .chat-widget-scroll::-webkit-scrollbar { width: 5px; }
        .chat-widget-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 20px; }
        .chat-widget-bubble { animation: chat-glow 3s ease-in-out infinite; touch-action: none; }
        .chat-widget-bubble:active { cursor: grabbing; }
        @media (prefers-reduced-motion: reduce) {
          .chat-widget-panel, .chat-widget-bubble { animation: none !important; transition: none !important; }
        }
      `}</style>

      <div
        className={`fixed z-[90] ${floatingPos ? '' : 'bottom-6 right-5'}`}
        style={positionStyle}
      >
        {!isOpen && (
          <button
            ref={bubbleRef}
            type="button"
            aria-label="Mở khung trò chuyện — giữ và kéo để di chuyển"
            title="Giữ và kéo để di chuyển"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onClick={handleBubbleClick}
            className="chat-widget-bubble group relative flex h-[62px] w-[62px] select-none items-center justify-center rounded-[23px] border border-emerald-200/30 bg-gradient-to-br from-emerald-300 via-emerald-500 to-teal-600 text-white shadow-2xl transition duration-300 hover:scale-105 hover:rounded-full focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300/30"
          >
            <span className="absolute inset-[5px] rounded-[18px] border border-white/20 group-hover:rounded-full transition-all" />
            <svg className="relative h-7 w-7 drop-shadow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20.2 11.5a7.7 7.7 0 0 1-8 7.7 8.8 8.8 0 0 1-3.5-.7L4 20l1.3-4.1a7.5 7.5 0 0 1-1.2-4.1A7.9 7.9 0 0 1 12.2 4a7.8 7.8 0 0 1 8 7.5Z" />
              <path d="M8.5 11.8h.01M12 11.8h.01M15.5 11.8h.01" strokeWidth="2.6" />
            </svg>
            <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full border-[3px] border-slate-950 bg-rose-500" />
            <span className="absolute -bottom-7 whitespace-nowrap rounded-full border border-white/10 bg-slate-950/90 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-emerald-200 opacity-0 shadow-lg transition group-hover:opacity-100">
              Trò chuyện · kéo để di chuyển
            </span>
          </button>
        )}

        {isOpen && (
          <section className="chat-widget-panel flex h-[min(610px,calc(100dvh-32px))] w-[min(370px,calc(100vw-24px))] flex-col overflow-hidden rounded-[26px] border border-white/[0.12] bg-[#080d16]/95 text-white shadow-[0_24px_90px_rgba(0,0,0,.65)] ring-1 ring-black/30 backdrop-blur-2xl">
            <header className="relative overflow-hidden border-b border-white/[0.08] bg-gradient-to-br from-[#152a2a] via-[#101b29] to-[#101522] px-4 pb-3 pt-4">
              <div className="pointer-events-none absolute -right-8 -top-12 h-32 w-32 rounded-full bg-emerald-400/10 blur-3xl" />
              <div className="relative flex items-center gap-3">
                <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-300/25 bg-gradient-to-br from-emerald-300/20 to-teal-500/10 text-xl shadow-inner shadow-emerald-300/10">
                  {profile.avatar}
                  <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-[3px] border-[#122126] bg-emerald-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-sm font-bold tracking-wide text-white">{profile.name || 'Trò chuyện'}</h3>
                    <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-200">Live</span>
                  </div>
                  <button onClick={() => setShowEditProfile(true)} className="mt-0.5 text-[11px] text-emerald-300/80 transition hover:text-emerald-200 hover:underline">
                    Chỉnh sửa hồ sơ
                  </button>
                </div>
                <button onClick={() => setIsOpen(false)} aria-label="Đóng chat" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-400 transition hover:border-white/20 hover:bg-white/10 hover:text-white">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m18 6-12 12M6 6l12 12" /></svg>
                </button>
              </div>
            </header>

            <div className="px-3 py-3">
              <div className="flex items-center justify-between rounded-2xl border border-emerald-400/20 bg-gradient-to-r from-emerald-500/[0.12] via-emerald-400/[0.07] to-teal-500/[0.12] px-3 py-2.5 shadow-inner shadow-emerald-300/[0.03]">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  <span className="text-xs font-semibold text-emerald-200">Toàn Web</span>
                </div>
                <span className="rounded-lg border border-emerald-300/15 bg-black/20 px-2 py-1 text-[10px] font-bold tabular-nums text-emerald-100">{onlineCount} thành viên</span>
              </div>
            </div>

            <div className="chat-widget-scroll flex-1 space-y-4 overflow-y-auto px-3 pb-4 pt-1">
              {messages.length === 0 && (
                <div className="flex h-full min-h-40 flex-col items-center justify-center px-8 text-center">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.07] text-2xl">✦</div>
                  <p className="text-sm font-semibold text-slate-200">Bắt đầu cuộc trò chuyện</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">Gửi lời chào đến mọi người trong cộng đồng nhé.</p>
                </div>
              )}
              {messages.map((msg, i) => {
                const isMe = msg.user_id === userId;
                const userAvatar = isMe ? profile.avatar : (msg.avatar || '👤');
                return (
                  <div key={msg.id || `${msg.user_id || msg.name || 'msg'}-${msg.created_at || i}-${i}`} className={`group flex items-end gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                    <div className={`mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border text-sm shadow-sm ${isMe ? 'border-emerald-300/20 bg-emerald-400/10' : 'border-white/[0.08] bg-gradient-to-br from-slate-700/80 to-slate-800/80'}`}>
                      {userAvatar}
                    </div>
                    <div className={`flex max-w-[78%] flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className="mb-1 flex items-center gap-2 px-1">
                        {!isMe && <span className="max-w-[150px] truncate text-[10px] font-semibold text-slate-400">{msg.name || 'Khách'}</span>}
                        <span className="text-[9px] tabular-nums text-slate-600">
                          {msg.created_at && !Number.isNaN(new Date(msg.created_at).getTime())
                            ? new Date(msg.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                            : ''}
                        </span>
                      </div>
                      <div className={`relative whitespace-pre-wrap break-words rounded-[19px] px-3.5 py-2.5 text-[13px] leading-relaxed shadow-sm ${isMe ? 'rounded-br-md border border-emerald-300/20 bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-emerald-950/30' : 'rounded-bl-md border border-white/[0.07] bg-gradient-to-br from-[#202b3b] to-[#172130] text-slate-100'}`}>
                        {msg.reply_to_name && (
                          <div className={`mb-2 rounded-lg border-l-2 px-2.5 py-1.5 text-[10px] ${isMe ? 'border-emerald-100/70 bg-black/10 text-emerald-50' : 'border-emerald-400 bg-emerald-400/[0.08] text-emerald-200'}`}>
                            <span className="block truncate font-bold">↳ {msg.reply_to_name}</span>
                            <span className="block truncate opacity-75">{msg.reply_to_content}</span>
                          </div>
                        )}
                        {msg.content}
                        <button
                          onClick={() => setReplyTo({ name: msg.name || 'Khách', content: msg.content })}
                          title="Trả lời tin nhắn"
                          aria-label="Trả lời tin nhắn"
                          className={`absolute top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg border border-white/10 bg-[#0b1220] text-slate-300 opacity-0 shadow-lg transition hover:bg-emerald-500 hover:text-white focus:opacity-100 group-hover:opacity-100 ${isMe ? '-left-9' : '-right-9'}`}
                        >
                          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 10 4 15l5 5" /><path d="M4 15h9a7 7 0 0 0 7-7V5" /></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} className="h-1" />
            </div>

            {replyTo && (
              <div className="mx-3 mb-2 flex items-center gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.07] px-3 py-2.5">
                <div className="h-8 w-1 shrink-0 rounded-full bg-emerald-400" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-emerald-300">Đang trả lời {replyTo.name}</p>
                  <p className="mt-0.5 truncate text-[11px] text-slate-400">{replyTo.content}</p>
                </div>
                <button onClick={() => setReplyTo(null)} aria-label="Hủy trả lời" className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white/10 hover:text-white">✕</button>
              </div>
            )}

            <div className="border-t border-white/[0.08] bg-[#0c121e]/95 px-3 pb-3 pt-2.5">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[.16em] text-slate-500">Phản ứng nhanh</span>
                <span className={`text-[10px] tabular-nums ${newMsg.length >= 140 ? 'text-amber-300' : 'text-slate-600'}`}>{newMsg.length}/150</span>
              </div>
              <div className="mb-2.5 flex items-center justify-between gap-1">
                {QUICK_EMOJIS.map((emoji) => (
                  <button key={emoji} type="button" onClick={() => addEmoji(emoji)} className="flex h-8 min-w-0 flex-1 items-center justify-center rounded-lg border border-white/[0.04] bg-white/[0.025] text-base transition hover:-translate-y-0.5 hover:border-emerald-300/20 hover:bg-emerald-300/10 active:scale-90" aria-label={`Thêm ${emoji}`}>{emoji}</button>
                ))}
              </div>
              <form onSubmit={handleSend} className="flex items-center gap-2 rounded-2xl border border-white/[0.10] bg-[#080d16] p-1.5 pl-3 shadow-inner transition focus-within:border-emerald-400/50 focus-within:shadow-[0_0_0_3px_rgba(16,185,129,.08)]">
                <input
                  type="text"
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value.slice(0, 150))}
                  placeholder="Viết lời nhắn..."
                  maxLength={150}
                  aria-label="Nội dung tin nhắn"
                  className="h-9 min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-slate-600"
                />
                <button type="submit" disabled={!newMsg.trim()} className="flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 px-3.5 text-xs font-bold text-white shadow-lg shadow-emerald-950/40 transition hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40">
                  Gửi
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
                </button>
              </form>
              <p className="mt-2 text-center text-[9px] text-slate-600">Enter để gửi · Tối đa 150 ký tự</p>
            </div>
          </section>
        )}
      </div>

      {showEditProfile && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowEditProfile(false); }}>
          <div className="w-full max-w-sm overflow-hidden rounded-[26px] border border-white/10 bg-gradient-to-b from-[#172333] to-[#0b111c] p-5 shadow-[0_30px_100px_rgba(0,0,0,.7)]">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <div className="mb-1 text-[10px] font-bold uppercase tracking-[.2em] text-emerald-300">Tài khoản</div>
                <h2 className="text-lg font-bold text-white">Chỉnh sửa hồ sơ</h2>
                <p className="mt-1 text-xs text-slate-400">Cá nhân hóa cách mọi người nhìn thấy bạn.</p>
              </div>
              <button onClick={() => setShowEditProfile(false)} aria-label="Đóng" className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400 hover:text-white">✕</button>
            </div>
            <label className="mb-2 block text-xs font-semibold text-slate-300" htmlFor="chat-profile-name">Tên hiển thị</label>
            <input
              id="chat-profile-name"
              type="text"
              value={profile.name}
              maxLength={15}
              onChange={(e) => setProfile({ ...profile, name: e.target.value.slice(0, 15) })}
              className="mb-5 h-11 w-full rounded-xl border border-white/10 bg-[#080d16] px-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-400/50 focus:ring-4 focus:ring-emerald-400/[0.08]"
            />
            <p className="mb-2.5 text-xs font-semibold text-slate-300">Chọn avatar</p>
            <div className="mb-6 grid grid-cols-5 gap-2">
              {AVATARS.map((av) => (
                <button key={av} type="button" onClick={() => setProfile({ ...profile, avatar: av })} aria-label={`Chọn avatar ${av}`} className={`flex aspect-square items-center justify-center rounded-2xl border text-2xl transition hover:-translate-y-0.5 ${profile.avatar === av ? 'border-emerald-300/70 bg-emerald-400/15 shadow-[0_0_0_3px_rgba(16,185,129,.08)]' : 'border-white/[0.07] bg-white/[0.035] hover:border-white/20 hover:bg-white/[0.07]'}`}>
                  {av}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowEditProfile(false)} className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.08]">Hủy</button>
              <button onClick={() => handleSaveProfile(profile.name, profile.avatar)} className="flex-1 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 py-2.5 text-sm font-bold text-[#05231d] shadow-lg shadow-emerald-950/40 transition hover:brightness-110 active:scale-[.98]">Lưu hồ sơ</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
