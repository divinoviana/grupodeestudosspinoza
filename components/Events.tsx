
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

      {/* Google Calendar */}
      <div className="mt-20">
        <div className="mb-6">
          <h2 className="font-serif text-3xl text-slate-800 mb-2">Calendário do Grupo</h2>
          <p className="text-slate-600">Todos os encontros, datas e eventos numa visão completa.</p>
        </div>
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
          {user ? (
            <div className="w-full overflow-x-auto">
              <iframe
                src="https://calendar.google.com/calendar/embed?src=grupodeestudosspinoza%40gmail.com&ctz=America%2FFortaleza&hl=pt_BR&showTitle=0&showNav=1&showDate=1&showPrint=0&showTabs=1&showCalendars=0"
                style={{ border: 0 }}
                width="100%"
                height="600"
                frameBorder={0}
                scrolling="no"
                title="Calendário do Grupo de Estudos Spinoza"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 px-8 text-center gap-4">
              <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <p className="text-slate-500 text-lg font-medium">Calendário disponível apenas para membros</p>
              <p className="text-slate-400 text-sm">Faça login para visualizar a agenda completa do grupo.</p>
            </div>
          )}
        </div>

        <div className="mt-6 p-6 bg-[#0f172a] text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold">Receba notificações dos eventos</p>
            <p className="text-sm opacity-70">Adicione a agenda ao seu Google Calendar e fique por dentro de todos os encontros.</p>
          </div>
          <a
            href="https://calendar.google.com/calendar/r?cid=grupodeestudosspinoza%40gmail.com"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 bg-[#d4af37] text-[#0f172a] px-6 py-3 rounded-full font-bold hover:brightness-110 transition whitespace-nowrap"
          >
            + Adicionar à minha agenda
          </a>
        </div>
      </div>
    </div>
  );
};

export default Events;
