import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { UserProfile } from '../types';
import { timeAgo } from '../timeAgo';

interface Notification {
  id: string;
  kind: 'publicacao' | 'forum' | 'evento' | 'agora';
  title: string;
  body: string;
  link: string;
  actor_id: string | null;
  created_at: string;
}

const KIND_ICON: Record<Notification['kind'], string> = {
  publicacao: '📜',
  forum: '💬',
  evento: '📅',
  agora: '🏛️',
};

const NotificationBell: React.FC<{ user: UserProfile }> = ({ user }) => {
  const [items, setItems] = useState<Notification[]>([]);
  const [seenAt, setSeenAt] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.from('profiles').select('notifications_seen_at').eq('id', user.id).single()
      .then(({ data }) => setSeenAt(data?.notifications_seen_at || new Date(0).toISOString()));

    supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(20)
      .then(({ data }) => { if (data) setItems(data as Notification[]); });

    const channel = supabase
      .channel('notifications-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, payload => {
        const n = payload.new as Notification;
        setItems(prev => (prev.some(p => p.id === n.id) ? prev : [n, ...prev].slice(0, 20)));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user.id]);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const isUnread = (n: Notification) =>
    !!seenAt && n.actor_id !== user.id && new Date(n.created_at) > new Date(seenAt);
  const unread = items.filter(isUnread).length;

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && unread > 0) {
      const now = new Date().toISOString();
      supabase.from('profiles').update({ notifications_seen_at: now }).eq('id', user.id).then(() => {});
      // mantém o destaque dos não lidos enquanto a lista está aberta
      setTimeout(() => setSeenAt(now), 4000);
    }
  };

  const go = (n: Notification) => {
    setOpen(false);
    navigate(n.link);
  };

  return (
    <div className="relative" ref={boxRef}>
      <button
        type="button"
        onClick={toggle}
        className="relative w-9 h-9 rounded-full flex items-center justify-center text-gray-300 hover:text-[#d4af37] hover:bg-white/5 transition focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
        aria-label={unread ? `${unread} novidades não lidas` : 'Novidades'}
        title="Novidades"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-[min(22rem,calc(100vw-2rem))] bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <p className="font-serif text-lg text-slate-800">Novidades</p>
            {unread > 0 && <span className="text-xs text-slate-400">{unread} não {unread === 1 ? 'lida' : 'lidas'}</span>}
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
            {items.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-10 px-4">Nenhuma novidade por enquanto.</p>
            ) : (
              items.map(n => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => go(n)}
                  className={`w-full text-left px-4 py-3 flex gap-3 border-b border-slate-50 hover:bg-slate-50 transition ${
                    isUnread(n) ? 'bg-[#d4af37]/10' : ''
                  }`}
                >
                  <span className="text-xl leading-none mt-0.5">{KIND_ICON[n.kind]}</span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-semibold text-slate-800 leading-snug">{n.title}</span>
                    {n.body && <span className="block text-xs text-slate-500 mt-0.5 line-clamp-2">{n.body}</span>}
                    <span className="block text-[11px] text-slate-400 mt-1">{timeAgo(n.created_at)}</span>
                  </span>
                  {isUnread(n) && <span className="w-2 h-2 rounded-full bg-[#d4af37] mt-1.5 shrink-0" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
