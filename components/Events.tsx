
import React from 'react';
import { Event, UserProfile } from '../types';

interface EventsProps {
  events: Event[];
  user: UserProfile | null;
}

const Events: React.FC<EventsProps> = ({ events, user }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="font-serif text-4xl text-slate-800 mb-4">Agenda de Encontros</h1>
        <p className="text-slate-600">Participe de nossos encontros mensais e debates ao vivo via Zoom ou Google Meet.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map(ev => (
          <div key={ev.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-100 group">
            <div className="h-32 bg-[#0f172a] p-6 relative">
              <div className="absolute top-4 right-4 bg-[#d4af37] text-[#0f172a] px-3 py-1 rounded text-xs font-bold uppercase">Confirmado</div>
              <div className="text-white">
                <p className="text-sm opacity-70 mb-1">{new Date(ev.date).toLocaleDateString('pt-BR', { weekday: 'long' })}</p>
                <p className="text-2xl font-serif">{new Date(ev.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}</p>
              </div>
            </div>
            <div className="p-8 space-y-4">
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                 {ev.time} BRT
              </div>
              <h3 className="text-xl font-bold text-slate-900 leading-tight">{ev.title}</h3>
              <p className="text-slate-600 text-sm line-clamp-3">{ev.description}</p>
              
              <div className="pt-4 border-t">
                {user ? (
                  <a 
                    href={ev.meeting_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full text-center bg-[#d4af37] text-[#0f172a] py-3 rounded-lg font-bold shadow-lg hover:brightness-110 transition"
                  >
                    Entrar no Meet / Zoom
                  </a>
                ) : (
                  <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-500 text-center">
                    Link disponível apenas para membros logados.
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-20 p-8 bg-[#0f172a] text-white rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="max-w-xl">
           <h2 className="font-serif text-3xl mb-4">Integração com o Google Calendar</h2>
           <p className="opacity-80">Receba notificações automáticas de novos encontros diretamente no seu e-mail do grupo: <span className="font-bold">grupodeestudosspinoza@gmail.com</span>.</p>
        </div>
        <button className="bg-white text-[#0f172a] px-8 py-3 rounded-full font-bold hover:scale-105 transition shadow-2xl">Inscrever-se na Agenda</button>
      </div>
    </div>
  );
};

export default Events;
