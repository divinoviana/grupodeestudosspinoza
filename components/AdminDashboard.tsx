
import React, { useState, useEffect } from 'react';
import { Publication, Event, ContactMessage } from '../types';
import { supabase } from '../supabaseClient';

interface AdminDashboardProps {
  publications: Publication[];
  events: Event[];
  onAddEvent: (ev: Event) => void;
  onDeleteEvent: (id: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ publications, events, onAddEvent, onDeleteEvent }) => {
  const [activeTab, setActiveTab] = useState<'events' | 'publications' | 'messages'>('events');
  const [newEvent, setNewEvent] = useState({ title: '', description: '', date: '', time: '', meeting_link: '' });
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setContactMessages(data);
  };

  const markAsRead = async (id: string) => {
    await supabase.from('contact_messages').update({ is_read: true }).eq('id', id);
    fetchMessages();
  };

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

      <div className="flex gap-4 border-b mb-8 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('events')}
          className={`px-6 py-3 font-bold transition-all whitespace-nowrap ${activeTab === 'events' ? 'border-b-4 border-[#d4af37] text-[#0f172a]' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Agenda de Eventos
        </button>
        <button 
          onClick={() => setActiveTab('publications')}
          className={`px-6 py-3 font-bold transition-all whitespace-nowrap ${activeTab === 'publications' ? 'border-b-4 border-[#d4af37] text-[#0f172a]' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Repositório
        </button>
        <button 
          onClick={() => setActiveTab('messages')}
          className={`px-6 py-3 font-bold transition-all whitespace-nowrap relative ${activeTab === 'messages' ? 'border-b-4 border-[#d4af37] text-[#0f172a]' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Mensagens de Contato
          {contactMessages.some(m => !m.is_read) && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
          )}
        </button>
      </div>

      {activeTab === 'events' && (
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <form onSubmit={handleAddEvent} className="bg-white p-6 rounded-xl shadow-lg border border-slate-100 space-y-4">
              <h3 className="font-bold text-lg mb-4 text-[#0f172a]">Novo Encontro</h3>
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
              <div key={ev.id} className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center border border-slate-200">
                <div>
                  <p className="font-bold text-slate-800">{ev.title}</p>
                  <p className="text-xs text-slate-500">{new Date(ev.date).toLocaleDateString()} às {ev.time}</p>
                </div>
                <button onClick={() => onDeleteEvent(ev.id)} className="text-red-500 text-sm hover:underline">Remover</button>
              </div>
            )) : <p className="text-slate-400 italic">Nenhum evento futuro agendado.</p>}
          </div>
        </div>
      )}

      {activeTab === 'publications' && (
        <div className="space-y-4">
           <h3 className="font-bold text-slate-400 uppercase text-xs tracking-widest mb-4">Gerenciamento de Produções</h3>
           {publications.map(pub => (
             <div key={pub.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
               <div>
                 <h4 className="font-bold text-[#0f172a]">{pub.title}</h4>
                 <p className="text-sm text-slate-500">Por {pub.author_name} | {pub.category}</p>
               </div>
               <button className="text-red-500 px-4 py-2 border border-red-100 rounded hover:bg-red-50 text-xs font-bold">Excluir</button>
             </div>
           ))}
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="space-y-6">
          <h3 className="font-bold text-slate-400 uppercase text-xs tracking-widest">Dúvidas e Contatos de Interessados</h3>
          <div className="grid gap-4">
            {contactMessages.length > 0 ? contactMessages.map(msg => (
              <div key={msg.id} className={`p-6 rounded-xl border transition-all ${msg.is_read ? 'bg-slate-50 border-slate-100' : 'bg-white border-[#d4af37]/30 shadow-md ring-1 ring-[#d4af37]/20'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-lg text-[#0f172a]">{msg.name}</h4>
                    <a href={`mailto:${msg.email}`} className="text-sm text-blue-600 hover:underline">{msg.email}</a>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(msg.created_at).toLocaleString()}</p>
                    {!msg.is_read && <span className="bg-[#d4af37] text-[#0f172a] text-[10px] px-2 py-0.5 rounded-full font-bold ml-2">NOVA</span>}
                  </div>
                </div>
                <p className="text-slate-700 bg-white/50 p-4 rounded-lg border italic">"{msg.message}"</p>
                {!msg.is_read && (
                  <button 
                    onClick={() => markAsRead(msg.id)}
                    className="mt-4 text-xs bg-[#0f172a] text-[#d4af37] px-4 py-2 rounded font-bold hover:brightness-110"
                  >
                    Marcar como Lida
                  </button>
                )}
              </div>
            )) : (
              <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <p className="text-slate-400 italic font-serif">Ainda não recebemos mensagens através do formulário.</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-16 p-8 bg-slate-900 text-white rounded-3xl shadow-2xl border border-[#d4af37]/20">
        <div className="flex items-center gap-3 mb-6">
           <div className="w-2 h-8 bg-[#d4af37]"></div>
           <h3 className="font-serif text-3xl">Configuração do Banco de Dados</h3>
        </div>
        <p className="text-sm opacity-70 mb-6 max-w-2xl">Execute o script abaixo no Supabase SQL Editor para habilitar a tabela de mensagens de contato.</p>
        
        <div className="relative group">
          <pre className="bg-black/50 p-6 rounded-2xl text-[13px] overflow-x-auto text-green-400 font-mono leading-relaxed border border-white/5 shadow-inner">
{`
-- Tabela de Mensagens de Contato
CREATE TABLE contact_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ativar Segurança
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Política: Qualquer um pode inserir (para o formulário de contato funcionar)
CREATE POLICY "Qualquer um envia contato" ON contact_messages FOR INSERT WITH CHECK (true);

-- Política: Apenas admins podem ver as mensagens
CREATE POLICY "Admins leem contatos" ON contact_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Política: Apenas admins podem atualizar (marcar como lida)
CREATE POLICY "Admins atualizam contatos" ON contact_messages FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
