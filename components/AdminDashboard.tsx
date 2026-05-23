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
    onAddEvent({ id: Date.now().toString(), ...newEvent });
    setNewEvent({ title: '', description: '', date: '', time: '', meeting_link: '' });
  };

  const inputClass = "w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] transition bg-slate-50 focus:bg-white text-sm";

  const unreadCount = contactMessages.filter(m => !m.is_read).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <div className="w-14 h-14 bg-[#0f172a] text-[#d4af37] rounded-2xl flex items-center justify-center text-2xl shadow-lg">⚙️</div>
        <div>
          <h1 className="font-serif text-4xl text-slate-800">Painel Administrativo</h1>
          <p className="text-slate-500 text-sm">Controle de Conteúdo — Grupo de Estudos Spinoza</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 mb-10 overflow-x-auto">
        {([
          { key: 'events', label: 'Agenda de Eventos', badge: null },
          { key: 'publications', label: 'Repositório', badge: null },
          { key: 'messages', label: 'Mensagens', badge: unreadCount },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`relative px-6 py-3 font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'border-b-2 border-[#d4af37] text-[#0f172a]'
                : 'text-slate-400 hover:text-slate-600 border-b-2 border-transparent'
            }`}
          >
            {tab.label}
            {tab.badge != null && tab.badge > 0 && (
              <span className="ml-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Events tab */}
      {activeTab === 'events' && (
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <form onSubmit={handleAddEvent} className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 space-y-4">
              <h3 className="font-bold text-lg text-[#0f172a] mb-2">Novo Encontro</h3>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Título</label>
                <input
                  required
                  placeholder="Título do Debate"
                  className={inputClass}
                  value={newEvent.title}
                  onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Descrição</label>
                <textarea
                  required
                  placeholder="Descrição breve"
                  className={`${inputClass} resize-none`}
                  rows={3}
                  value={newEvent.description}
                  onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Data</label>
                  <input
                    required
                    type="date"
                    className={inputClass}
                    value={newEvent.date}
                    onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hora</label>
                  <input
                    required
                    type="time"
                    className={inputClass}
                    value={newEvent.time}
                    onChange={e => setNewEvent({ ...newEvent, time: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Link da Reunião</label>
                <input
                  required
                  placeholder="https://meet.google.com/..."
                  className={inputClass}
                  value={newEvent.meeting_link}
                  onChange={e => setNewEvent({ ...newEvent, meeting_link: e.target.value })}
                />
              </div>
              <button className="w-full bg-[#0f172a] text-[#d4af37] py-3 rounded-xl font-bold hover:brightness-110 shadow-md transition hover:scale-[1.02]">
                Adicionar à Agenda
              </button>
            </form>
          </div>
          <div className="md:col-span-2 space-y-4">
            <h3 className="font-bold text-slate-400 uppercase text-xs tracking-widest">
              Encontros Cadastrados ({events.length})
            </h3>
            {events.length > 0 ? events.map(ev => (
              <div key={ev.id} className="bg-white p-5 rounded-xl shadow-sm flex justify-between items-center border border-slate-200 hover:border-[#d4af37]/30 transition">
                <div>
                  <p className="font-bold text-slate-800">{ev.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {new Date(ev.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })} às {ev.time}
                  </p>
                </div>
                <button
                  onClick={() => onDeleteEvent(ev.id)}
                  className="text-red-500 text-sm hover:text-red-700 hover:underline transition ml-4 font-medium"
                >
                  Remover
                </button>
              </div>
            )) : (
              <div className="text-center py-16 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                <p className="text-slate-400 italic">Nenhum evento agendado.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Publications tab */}
      {activeTab === 'publications' && (
        <div className="space-y-4">
          <h3 className="font-bold text-slate-400 uppercase text-xs tracking-widest mb-6">
            Produções Cadastradas ({publications.length})
          </h3>
          {publications.map(pub => (
            <div key={pub.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-[#d4af37]/30 transition">
              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-[10px] bg-[#0f172a] text-[#d4af37] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    {pub.category}
                  </span>
                </div>
                <h4 className="font-bold text-[#0f172a] leading-snug">{pub.title}</h4>
                <p className="text-sm text-slate-500 mt-0.5">Por {pub.author_name}</p>
              </div>
              <button className="flex-shrink-0 text-red-500 px-4 py-2 border border-red-100 rounded-lg hover:bg-red-50 text-xs font-bold transition">
                Excluir
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Messages tab */}
      {activeTab === 'messages' && (
        <div className="space-y-6">
          <h3 className="font-bold text-slate-400 uppercase text-xs tracking-widest">
            Mensagens Recebidas ({contactMessages.length})
          </h3>
          <div className="grid gap-4">
            {contactMessages.length > 0 ? contactMessages.map(msg => (
              <div
                key={msg.id}
                className={`p-6 rounded-2xl border transition-all ${
                  msg.is_read
                    ? 'bg-slate-50 border-slate-100'
                    : 'bg-white border-[#d4af37]/30 shadow-md ring-1 ring-[#d4af37]/10'
                }`}
              >
                <div className="flex justify-between items-start mb-4 flex-wrap gap-3">
                  <div>
                    <h4 className="font-bold text-lg text-[#0f172a]">{msg.name}</h4>
                    <a href={`mailto:${msg.email}`} className="text-sm text-blue-600 hover:underline">{msg.email}</a>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    {!msg.is_read && (
                      <span className="bg-[#d4af37] text-[#0f172a] text-[10px] px-2.5 py-1 rounded-full font-bold">NOVA</span>
                    )}
                    <p className="text-[10px] text-slate-400 font-bold uppercase">
                      {new Date(msg.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
                <p className="text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 italic leading-relaxed text-sm">
                  "{msg.message}"
                </p>
                {!msg.is_read && (
                  <button
                    onClick={() => markAsRead(msg.id)}
                    className="mt-4 text-xs bg-[#0f172a] text-[#d4af37] px-5 py-2 rounded-lg font-bold hover:brightness-110 transition"
                  >
                    Marcar como Lida
                  </button>
                )}
              </div>
            )) : (
              <div className="text-center py-24 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <p className="font-serif text-xl text-slate-400 italic">Ainda não recebemos mensagens pelo formulário.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SQL Setup */}
      <div className="mt-16 p-8 bg-slate-900 text-white rounded-3xl shadow-2xl border border-[#d4af37]/10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1.5 h-8 bg-[#d4af37] rounded-full" />
          <h3 className="font-serif text-2xl">Configuração do Banco de Dados</h3>
        </div>
        <p className="text-sm text-slate-400 mb-6 max-w-2xl">
          Execute o script abaixo no Supabase SQL Editor para habilitar a tabela de mensagens de contato.
        </p>
        <pre className="bg-black/50 p-6 rounded-2xl text-[12px] overflow-x-auto text-green-400 font-mono leading-relaxed border border-white/5">
{`-- Tabela de Mensagens de Contato
CREATE TABLE contact_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Qualquer um envia contato"
  ON contact_messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins leem contatos"
  ON contact_messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins atualizam contatos"
  ON contact_messages FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );`}
        </pre>
      </div>
    </div>
  );
};

export default AdminDashboard;
