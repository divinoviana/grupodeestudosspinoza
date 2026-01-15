
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
        <div className="w-12 h-12 bg-[#d4af37] rounded-lg flex items-center justify-center text-2xl shadow-lg">⚙️</div>
        <div>
          <h1 className="font-serif text-4xl text-slate-800">Painel Administrativo</h1>
          <p className="text-slate-500 text-sm">Controle de Conteúdo | Grupo de Estudos Spinoza</p>
        </div>
      </div>

      <div className="flex gap-4 border-b mb-8">
        <button 
          onClick={() => setActiveTab('events')}
          className={`px-6 py-3 font-bold transition-all ${activeTab === 'events' ? 'border-b-4 border-[#d4af37] text-[#0f172a]' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Agenda de Eventos
        </button>
        <button 
          onClick={() => setActiveTab('publications')}
          className={`px-6 py-3 font-bold transition-all ${activeTab === 'publications' ? 'border-b-4 border-[#d4af37] text-[#0f172a]' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Repositório de Publicações
        </button>
      </div>

      {activeTab === 'events' && (
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <form onSubmit={handleAddEvent} className="bg-white p-6 rounded-xl shadow-lg border border-slate-100 space-y-4">
              <h3 className="font-bold text-lg mb-4 text-[#0f172a]">Novo Encontro (Meet/Zoom)</h3>
              <input required placeholder="Título do Debate" className="w-full p-2 border rounded" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
              <textarea required placeholder="Descrição Breve" className="w-full p-2 border rounded" value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} />
              <div className="flex gap-2">
                <input required type="date" className="w-1/2 p-2 border rounded" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
                <input required type="time" className="w-1/2 p-2 border rounded" value={newEvent.time} onChange={e => setNewEvent({...newEvent, time: e.target.value})} />
              </div>
              <input required placeholder="Link do Meet/Zoom" className="w-full p-2 border rounded" value={newEvent.meeting_link} onChange={e => setNewEvent({...newEvent, meeting_link: e.target.value})} />
              <button className="w-full bg-[#0f172a] text-[#d4af37] py-3 rounded-lg font-bold hover:brightness-110 shadow-md">Adicionar à Agenda</button>
            </form>
          </div>
          <div className="md:col-span-2 space-y-4">
            <h3 className="font-bold text-slate-400 uppercase text-xs tracking-widest">Encontros Cadastrados</h3>
            {events.length > 0 ? events.map(ev => (
              <div key={ev.id} className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center border border-slate-200 hover:border-[#d4af37]/50 transition">
                <div>
                  <p className="font-bold text-slate-800">{ev.title}</p>
                  <p className="text-xs text-slate-500">{new Date(ev.date).toLocaleDateString()} às {ev.time}</p>
                </div>
                <button 
                  onClick={() => onDeleteEvent(ev.id)}
                  className="text-red-500 hover:bg-red-50 px-3 py-1 rounded-md text-sm border border-red-100"
                >
                   Remover
                </button>
              </div>
            )) : <p className="text-slate-400 italic">Nenhum evento futuro agendado.</p>}
          </div>
        </div>
      )}

      {activeTab === 'publications' && (
        <div className="space-y-4">
           <h3 className="font-bold text-slate-400 uppercase text-xs tracking-widest mb-4">Gerenciamento de Produções Acadêmicas</h3>
           {publications.map(pub => (
             <div key={pub.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
               <div>
                 <h4 className="font-bold text-[#0f172a]">{pub.title}</h4>
                 <p className="text-sm text-slate-500">Por {pub.author_name} | Categoria: <span className="font-semibold">{pub.category}</span></p>
                 <a href={pub.link} target="_blank" className="text-xs text-blue-600 hover:underline">{pub.link}</a>
               </div>
               <div className="flex gap-2">
                  <button className="text-blue-500 px-4 py-2 rounded-lg border border-blue-200 hover:bg-blue-50 text-sm font-bold transition">Editar</button>
                  <button className="text-red-500 px-4 py-2 rounded-lg border border-red-200 hover:bg-red-50 text-sm font-bold transition">Excluir</button>
               </div>
             </div>
           ))}
        </div>
      )}

      <div className="mt-16 p-8 bg-slate-900 text-white rounded-3xl shadow-2xl border border-[#d4af37]/20">
        <div className="flex items-center gap-3 mb-6">
           <div className="w-2 h-8 bg-[#d4af37]"></div>
           <h3 className="font-serif text-3xl">Configuração Final do Banco de Dados</h3>
        </div>
        <p className="text-sm opacity-70 mb-6 max-w-2xl">Prof. Divino, para que o site funcione 100% com o seu banco no Supabase, execute o comando abaixo no "SQL Editor" do seu painel Supabase. Ele cria todas as colunas necessárias para os seus links e ativa a segurança.</p>
        
        <div className="relative group">
          <pre className="bg-black/50 p-6 rounded-2xl text-[13px] overflow-x-auto text-green-400 font-mono leading-relaxed border border-white/5 shadow-inner">
{`
-- 1. Tabela de Perfis de Membros (Atualizada com lattes_url)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  bio TEXT,
  academic_info TEXT,
  lattes_url TEXT,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member'))
);

-- 2. Tabela de Publicações Acadêmicas
CREATE TABLE publications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id),
  author_name TEXT NOT NULL,
  abstract TEXT,
  link TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de Eventos / Encontros
CREATE TABLE events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  meeting_link TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela do Fórum (Tópicos)
CREATE TABLE forum_topics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id),
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Ativar Segurança de Linha (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_topics ENABLE ROW LEVEL SECURITY;

-- 6. Políticas de Acesso Público (Qualquer um pode ler)
CREATE POLICY "Acesso público leitura" ON profiles FOR SELECT USING (true);
CREATE POLICY "Acesso público leitura" ON publications FOR SELECT USING (true);
CREATE POLICY "Acesso público leitura" ON events FOR SELECT USING (true);
CREATE POLICY "Acesso público leitura" ON forum_topics FOR SELECT USING (true);

-- 7. Somente Administradores podem Criar Eventos e Publicações Oficiais
CREATE POLICY "Admins inserem publicações" ON publications FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 8. Política para usuários atualizarem seus próprios perfis
CREATE POLICY "Usuários atualizam próprio perfil" ON profiles FOR UPDATE USING (auth.uid() = id);
`}
          </pre>
          <div className="absolute top-4 right-4 text-[10px] bg-[#d4af37] text-[#0f172a] px-2 py-1 rounded font-bold uppercase">Script SQL Oficial Atualizado</div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
