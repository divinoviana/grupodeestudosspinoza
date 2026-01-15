
import React, { useState } from 'react';
import { Publication, Event } from '../types';

interface AdminDashboardProps {
  publications: Publication[];
  events: Event[];
  onAddEvent: (ev: Event) => void;
  onDeleteEvent: (id: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ publications, events, onAddEvent, onDeleteEvent }) => {
  const [activeTab, setActiveTab] = useState<'events' | 'publications'>('events');
  const [newEvent, setNewEvent] = useState({ title: '', description: '', date: '', time: '', meeting_link: '' });

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    onAddEvent({
      id: Date.now().toString(),
      ...newEvent
    });
    setNewEvent({ title: '', description: '', date: '', time: '', meeting_link: '' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-[#d4af37] rounded-lg flex items-center justify-center text-2xl">⚙️</div>
        <div>
          <h1 className="font-serif text-4xl text-slate-800">Painel Administrativo</h1>
          <p className="text-slate-500 text-sm">Olá, Administrador. Gerencie o conteúdo do Portal Spinoza aqui.</p>
        </div>
      </div>

      <div className="flex gap-4 border-b mb-8">
        <button 
          onClick={() => setActiveTab('events')}
          className={`px-6 py-3 font-bold transition ${activeTab === 'events' ? 'border-b-4 border-[#d4af37] text-[#0f172a]' : 'text-slate-400'}`}
        >
          Gerenciar Eventos
        </button>
        <button 
          onClick={() => setActiveTab('publications')}
          className={`px-6 py-3 font-bold transition ${activeTab === 'publications' ? 'border-b-4 border-[#d4af37] text-[#0f172a]' : 'text-slate-400'}`}
        >
          Gerenciar Publicações
        </button>
      </div>

      {activeTab === 'events' && (
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <form onSubmit={handleAddEvent} className="bg-white p-6 rounded-xl shadow-lg border border-slate-100 space-y-4">
              <h3 className="font-bold text-lg mb-4">Novo Encontro</h3>
              <input required placeholder="Título" className="w-full p-2 border rounded" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
              <textarea required placeholder="Descrição" className="w-full p-2 border rounded" value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} />
              <div className="flex gap-2">
                <input required type="date" className="w-1/2 p-2 border rounded" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
                <input required type="time" className="w-1/2 p-2 border rounded" value={newEvent.time} onChange={e => setNewEvent({...newEvent, time: e.target.value})} />
              </div>
              <input required placeholder="Link do Meet/Zoom" className="w-full p-2 border rounded" value={newEvent.meeting_link} onChange={e => setNewEvent({...newEvent, meeting_link: e.target.value})} />
              <button className="w-full bg-[#0f172a] text-[#d4af37] py-3 rounded font-bold">Adicionar à Agenda</button>
            </form>
          </div>
          <div className="md:col-span-2 space-y-4">
            {events.map(ev => (
              <div key={ev.id} className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center border border-slate-200">
                <div>
                  <p className="font-bold">{ev.title}</p>
                  <p className="text-xs text-slate-500">{new Date(ev.date).toLocaleDateString()} às {ev.time}</p>
                </div>
                <button 
                  onClick={() => onDeleteEvent(ev.id)}
                  className="text-red-500 hover:bg-red-50 p-2 rounded"
                >
                   Remover
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'publications' && (
        <div className="space-y-4">
           {publications.map(pub => (
             <div key={pub.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center">
               <div>
                 <h4 className="font-bold">{pub.title}</h4>
                 <p className="text-sm text-slate-500">Por {pub.author_name} | {pub.category}</p>
               </div>
               <div className="flex gap-2">
                  <button className="text-blue-500 px-3 py-1 rounded border border-blue-200">Editar</button>
                  <button className="text-red-500 px-3 py-1 rounded border border-red-200">Excluir</button>
               </div>
             </div>
           ))}
        </div>
      )}

      <div className="mt-12 p-8 bg-slate-800 text-white rounded-2xl">
        <h3 className="font-serif text-2xl mb-4">Comando SQL para Supabase</h3>
        <p className="text-sm opacity-70 mb-6">Copie o comando abaixo para configurar seu banco de dados no Supabase com RLS ativo.</p>
        <pre className="bg-black/50 p-6 rounded-lg text-xs overflow-x-auto text-green-400">
{`
-- Criar Tabela de Perfis
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  bio TEXT,
  academic_info TEXT,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member'))
);

-- Ativar RLS em Perfis
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Perfis públicos para visualização" ON profiles FOR SELECT USING (true);
CREATE POLICY "Usuários editam próprio perfil" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Criar Tabela de Publicações
CREATE TABLE publications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id),
  abstract TEXT,
  link TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ativar RLS em Publicações
ALTER TABLE publications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura pública" ON publications FOR SELECT USING (true);
CREATE POLICY "Admin pode inserir" ON publications FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Tabela de Eventos, Fóruns e Galeria seguem a mesma lógica...
`}
        </pre>
      </div>
    </div>
  );
};

export default AdminDashboard;
