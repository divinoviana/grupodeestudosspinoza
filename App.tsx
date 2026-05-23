
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { UserProfile, Publication, Event, ForumTopic, GalleryItem } from './types';
import { supabase } from './supabaseClient';
import { INITIAL_PUBLICATIONS } from './initialData';

// Pages & Components
import Navbar from './components/Navbar';
import Home from './components/Home';
import Publications from './components/Publications';
import Forum from './components/Forum';
import Events from './components/Events';
import Gallery from './components/Gallery';
import Profile from './components/Profile';
import AdminDashboard from './components/AdminDashboard';
import Auth from './components/Auth';
import WhatsAppChat from './components/WhatsAppChat';
import AIAssistant from './components/AIAssistant';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [publications, setPublications] = useState<Publication[]>(INITIAL_PUBLICATIONS);
  const [events, setEvents] = useState<Event[]>([]);
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) fetchProfile(session.user.id);
      else setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) fetchProfile(session.user.id);
      else setCurrentUser(null);
    });

    fetchInitialData();

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (id: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (data) setCurrentUser(data);
    setLoading(false);
  };

  const fetchInitialData = async () => {
    try {
      const [pubs, evs, tops, gals, profs] = await Promise.all([
        supabase.from('publications').select('*').order('created_at', { ascending: false }),
        supabase.from('events').select('*').order('date', { ascending: true }),
        supabase.from('forum_topics').select('*').order('created_at', { ascending: false }),
        supabase.from('gallery_items').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*')
      ]);

      if (pubs.data && pubs.data.length > 0) {
        setPublications(pubs.data);
      }
      
      if (evs.data) setEvents(evs.data);
      if (tops.data) setTopics(tops.data);
      if (gals.data) setGallery(gals.data);
      
      if (profs.data) {
        setMembers(profs.data);
      }
    } catch (e) {
      console.error("Erro ao carregar dados do Supabase", e);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  const handleUpdateProfile = async (profile: UserProfile) => {
    const { error } = await supabase.from('profiles').upsert(profile);
    if (!error) {
      setCurrentUser(profile);
      fetchInitialData();
    }
  };

  const addTopic = async (topic: ForumTopic) => {
    const { data, error } = await supabase.from('forum_topics').insert([topic]).select();
    if (data) setTopics(prev => [data[0], ...prev]);
  };

  const addPublication = async (pub: Publication) => {
    const { data, error } = await supabase.from('publications').insert([pub]).select();
    if (data) setPublications(prev => [data[0], ...prev]);
  };

  const addEvent = async (ev: Event) => {
    const { data, error } = await supabase.from('events').insert([ev]).select();
    if (data) setEvents(prev => [...prev, data[0]]);
  };

  const deleteEvent = async (id: string) => {
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (!error) setEvents(prev => prev.filter(e => e.id !== id));
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center font-serif text-[#0f172a] bg-[#0f172a]">
      <div className="text-center">
        <div className="w-20 h-20 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <div className="w-12 h-12 bg-[#d4af37] rounded-full flex items-center justify-center text-[#0f172a] font-serif font-bold text-2xl mx-auto mb-6 -mt-16 relative z-10">S</div>
        <p className="text-xl italic text-white">Carregando o pensamento de Spinoza...</p>
        <p className="text-[#d4af37]/60 text-sm mt-2 uppercase tracking-widest">Portal Spinoza</p>
      </div>
    </div>
  );

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar user={currentUser} onLogout={handleLogout} />
        
        <main className="flex-grow pt-20">
          <Routes>
            <Route path="/" element={<Home members={members} />} />
            <Route path="/publicacoes" element={<Publications publications={publications} user={currentUser} onAdd={addPublication} />} />
            <Route path="/forum" element={<Forum topics={topics} user={currentUser} onAddTopic={addTopic} />} />
            <Route path="/eventos" element={<Events events={events} user={currentUser} />} />
            <Route path="/galeria" element={<Gallery items={gallery} />} />
            <Route path="/perfil" element={currentUser ? <Profile user={currentUser} onUpdate={handleUpdateProfile} /> : <Navigate to="/auth" />} />
            <Route path="/admin" element={currentUser?.role === 'admin' ? <AdminDashboard publications={publications} events={events} onAddEvent={addEvent} onDeleteEvent={deleteEvent} /> : <Navigate to="/" />} />
            <Route path="/auth" element={<Auth />} />
          </Routes>
        </main>

        <footer className="bg-[#0f172a] text-white border-t border-[#b4941f]/20">
          <div className="max-w-7xl mx-auto px-4 pt-16 pb-10 grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#d4af37] rounded-full flex items-center justify-center text-[#0f172a] font-serif font-bold text-xl">S</div>
                <div>
                  <p className="font-serif text-xl">Portal Spinoza</p>
                  <p className="text-[10px] text-[#d4af37]/60 uppercase tracking-widest">Grupo de Estudos</p>
                </div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                Dedicado à pesquisa, difusão e debate do pensamento de Baruch Spinoza — filósofo do século XVII.
              </p>
              <div className="flex items-center gap-4 pt-2">
                <a href="https://www.youtube.com/channel/UCTJEBpIkx-ghf5N9TuAsG8g" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-red-500 transition" title="YouTube">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 4-8 4z"/></svg>
                </a>
                <a href="mailto:grupodeestudosspinoza@gmail.com" className="text-slate-400 hover:text-[#d4af37] transition" title="E-mail">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                </a>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold uppercase tracking-[0.2em] text-xs text-[#d4af37]">Navegação</h4>
              <ul className="space-y-2.5 text-slate-400 text-sm">
                <li><Link to="/" className="hover:text-white transition">Início</Link></li>
                <li><Link to="/publicacoes" className="hover:text-white transition">Publicações</Link></li>
                <li><Link to="/forum" className="hover:text-white transition">Fórum</Link></li>
                <li><Link to="/eventos" className="hover:text-white transition">Eventos</Link></li>
                <li><Link to="/galeria" className="hover:text-white transition">Galeria</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold uppercase tracking-[0.2em] text-xs text-[#d4af37]">Contato</h4>
              <ul className="space-y-2.5 text-slate-400 text-sm">
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  <a href="mailto:grupodeestudosspinoza@gmail.com" className="hover:text-white transition break-all">
                    grupodeestudosspinoza@gmail.com
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.319 1.592 5.548 0 10.058-4.51 10.06-10.059 0-2.692-1.047-5.224-2.95-7.129-1.901-1.902-4.434-2.951-7.11-2.951-5.548 0-10.057 4.51-10.059 10.059 0 2.152.593 3.657 1.648 5.483l-.98 3.578 3.673-.964z"/></svg>
                  +55 63 99919-1919
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 py-6 text-center text-slate-500 text-xs">
            &copy; {new Date().getFullYear()} Portal Spinoza · Coordenado por Prof. Me. Divino Ribeiro Viana
          </div>
        </footer>

        <WhatsAppChat />
        <AIAssistant />
      </div>
    </HashRouter>
  );
};

export default App;
