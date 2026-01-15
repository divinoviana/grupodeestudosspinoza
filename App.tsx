
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

  if (loading) return <div className="h-screen flex items-center justify-center font-serif text-[#0f172a] bg-slate-50">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-xl italic">Carregando o pensamento de Spinoza...</p>
    </div>
  </div>;

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

        <footer className="bg-[#0f172a] text-white py-12 mt-12 border-t border-[#b4941f]/30">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <h3 className="font-serif text-2xl mb-4 text-[#d4af37]">Grupo de Estudos Spinoza</h3>
              <p className="text-gray-400">Dedicado à pesquisa e difusão do pensamento de Baruch Spinoza.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 uppercase tracking-widest text-sm text-[#d4af37]">Links Rápidos</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/publicacoes" className="hover:text-white transition">Publicações</Link></li>
                <li><Link to="/eventos" className="hover:text-white transition">Agenda</Link></li>
                <li><a href="https://www.youtube.com/channel/UCTJEBpIkx-ghf5N9TuAsG8g" target="_blank" className="hover:text-white transition">YouTube</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 uppercase tracking-widest text-sm text-[#d4af37]">Contato</h4>
              <p className="text-gray-400">grupodeestudosspinoza@gmail.com</p>
              <p className="text-gray-400">+55 63 99919-1919</p>
            </div>
          </div>
          <div className="mt-12 text-center text-gray-500 text-sm">
            &copy; 2025 Portal Spinoza - Coordenado por Prof. Me. Divino Ribeiro Viana
          </div>
        </footer>

        <WhatsAppChat />
        <AIAssistant />
      </div>
    </HashRouter>
  );
};

export default App;
