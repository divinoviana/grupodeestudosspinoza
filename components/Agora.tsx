import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { UserProfile } from '../types';

interface AgoraPost {
  id: string;
  content: string;
  author_name: string;
  author_id: string | null;
  is_member: boolean;
  created_at: string;
}

interface AgoraProps {
  user: UserProfile | null;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'agora mesmo';
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'ontem';
  return `há ${days} dias`;
}

const QUOTES = [
  '"A ignorância não é um argumento." — Ética, II, 49',
  '"O esforço de cada coisa para perseverar em seu ser não é senão a essência atual dessa coisa." — Ética, III, 7',
  '"O homem livre não pensa em nada menos do que na morte." — Ética, IV, 67',
  '"A mente humana é uma parte do intelecto infinito de Deus." — Ética, II, 11',
  '"A liberdade é uma necessidade compreendida." — Ética, I',
];

const Agora: React.FC<AgoraProps> = ({ user }) => {
  const [posts, setPosts] = useState<AgoraPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [guestName, setGuestName] = useState(() => localStorage.getItem('agora_name') || '');
  const [submitting, setSubmitting] = useState(false);
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    supabase
      .from('agora_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(60)
      .then(({ data }) => {
        if (data) setPosts(data);
        setLoading(false);
      });

    const channel = supabase
      .channel('agora-live')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'agora_posts' },
        (payload) => {
          setPosts(prev => {
            if (prev.some(p => p.id === (payload.new as AgoraPost).id)) return prev;
            return [payload.new as AgoraPost, ...prev];
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = user?.full_name || guestName.trim();
    if (!name || !content.trim()) return;
    setSubmitting(true);

    const { error } = await supabase.from('agora_posts').insert([{
      content: content.trim(),
      author_name: name,
      author_id: user?.id || null,
      is_member: !!user,
    }]);

    if (!error) {
      setContent('');
      if (!user) localStorage.setItem('agora_name', guestName);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
    setSubmitting(false);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const canSubmit = content.trim().length > 0 && (!!user || guestName.trim().length > 0);

  return (
    <section className="max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-12 bg-[#d4af37] rounded-full shrink-0" />
          <div>
            <h2 className="font-serif text-4xl text-slate-800 leading-tight">Ágora</h2>
            <p className="text-slate-500 text-sm mt-1">
              Espaço aberto para reflexões, citações e diálogos — visitantes e membros, juntos.
            </p>
          </div>
        </div>
        <span className="text-slate-400 text-sm bg-slate-100 px-4 py-1.5 rounded-full self-start sm:self-auto">
          {posts.length} {posts.length === 1 ? 'pensamento' : 'pensamentos'}
        </span>
      </div>

      <div className="grid lg:grid-cols-[360px_1fr] gap-8 items-start">

        {/* ── Form (sticky) ── */}
        <div className="lg:sticky lg:top-28 space-y-4">
          <form
            onSubmit={handleSubmit}
            className="bg-[#0f172a] rounded-2xl p-6 shadow-2xl border border-white/5"
          >
            <h3 className="font-serif text-white text-xl mb-5 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
              </svg>
              Compartilhe seu pensamento
            </h3>

            {user ? (
              <div className="flex items-center gap-3 mb-4 bg-white/5 rounded-lg px-3 py-2.5 border border-white/10">
                <div className="w-8 h-8 rounded-full bg-[#d4af37] text-[#0f172a] flex items-center justify-center text-sm font-bold shrink-0">
                  {user.full_name[0].toUpperCase()}
                </div>
                <span className="text-white/80 text-sm font-medium flex-1">{user.full_name}</span>
                <span className="text-[10px] bg-[#d4af37]/20 text-[#d4af37] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Membro
                </span>
              </div>
            ) : (
              <input
                type="text"
                placeholder="Seu nome (visitante)"
                value={guestName}
                onChange={e => setGuestName(e.target.value)}
                className="w-full bg-white/10 text-white placeholder-white/30 rounded-lg px-4 py-3 mb-3 outline-none focus:ring-2 focus:ring-[#d4af37] text-sm border border-white/10"
                maxLength={60}
                required
              />
            )}

            <textarea
              ref={textareaRef}
              placeholder="Escreva sua reflexão, citação, pergunta ou ideia..."
              value={content}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              className="w-full bg-white/10 text-white placeholder-white/30 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#d4af37] resize-none min-h-[130px] text-sm border border-white/10 leading-relaxed"
              required
            />

            <div className="flex items-center justify-between mt-3">
              <span className="text-white/25 text-xs hidden sm:block">Ctrl+Enter para enviar</span>
              <button
                type="submit"
                disabled={submitting || !canSubmit}
                className="ml-auto bg-[#d4af37] text-[#0f172a] px-6 py-2.5 rounded-lg font-bold text-sm hover:brightness-110 transition disabled:opacity-40 flex items-center gap-2"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-[#0f172a] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                  </svg>
                )}
                Publicar
              </button>
            </div>
          </form>

          <p className="text-slate-400 text-xs italic text-center px-4 leading-relaxed">
            {quote}
          </p>
        </div>

        {/* ── Feed ── */}
        <div className="space-y-4 min-h-[300px]">
          {loading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-slate-100 rounded-xl p-5 animate-pulse space-y-2">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-slate-200 rounded w-1/4" />
                      <div className="h-3 bg-slate-200 rounded w-3/4" />
                      <div className="h-3 bg-slate-200 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-28 text-center">
              <span className="text-7xl mb-5">🏛️</span>
              <p className="font-serif text-2xl text-slate-400">A Ágora aguarda o primeiro pensamento.</p>
              <p className="text-sm text-slate-400 mt-2">Seja o primeiro a compartilhar uma reflexão!</p>
            </div>
          ) : (
            posts.map(post => (
              <article
                key={post.id}
                className={`bg-white rounded-xl shadow-sm border-l-4 p-5 hover:shadow-md transition-shadow group ${
                  post.is_member ? 'border-[#d4af37]' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                    post.is_member ? 'bg-[#0f172a] text-[#d4af37]' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {post.author_name[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-800 text-sm">{post.author_name}</span>
                      {post.is_member && (
                        <span className="text-[10px] bg-[#d4af37]/15 text-[#9a7e1f] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          Membro
                        </span>
                      )}
                    </div>
                  </div>
                  <time className="text-slate-400 text-xs shrink-0 mt-0.5" title={new Date(post.created_at).toLocaleString('pt-BR')}>
                    {timeAgo(post.created_at)}
                  </time>
                </div>
                <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-wrap pl-12">
                  {post.content}
                </p>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default Agora;
