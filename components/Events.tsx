import React from 'react';
import { Event, UserProfile } from '../types';
import { Link } from 'react-router-dom';

interface EventsProps {
  events: Event[];
  user: UserProfile | null;
}

const Events: React.FC<EventsProps> = ({ events, user }) => {
  const upcoming = events.filter(ev => new Date(ev.date) >= new Date());
  const past = events.filter(ev => new Date(ev.date) < new Date());

  const EventCard = ({ ev }: { ev: Event }) => {
    const date = new Date(ev.date);
    const isPast = date < new Date();
    return (
      <div className={`bg-white rounded-2xl shadow-md overflow-hidden border transition-all duration-300 hover:shadow-xl group ${isPast ? 'border-slate-100 opacity-75' : 'border-slate-100 hover:border-[#d4af37]/30'}`}>
        <div className={`h-36 p-6 relative flex flex-col justify-between ${isPast ? 'bg-slate-600' : 'bg-[#0f172a]'}`}>
          {!isPast && (
            <span className="absolute top-4 right-4 bg-[#d4af37] text-[#0f172a] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
              Confirmado
            </span>
          )}
          {isPast && (
            <span className="absolute top-4 right-4 bg-white/20 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
              Encerrado
            </span>
          )}
          <div className="text-white">
            <p className="text-xs text-white/60 uppercase tracking-widest mb-1">
              {date.toLocaleDateString('pt-BR', { weekday: 'long' })}
            </p>
            <p className="font-serif text-2xl">
              {date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-white/60 text-xs">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            {ev.time} (Horário de Brasília)
          </div>
        </div>
        <div className="p-7 space-y-4">
          <h3 className="text-xl font-bold text-slate-900 leading-snug group-hover:text-[#0f172a]">{ev.title}</h3>
          <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">{ev.description}</p>
          <div className="pt-4 border-t border-slate-100">
            {user ? (
              !isPast ? (
                <a
                  href={ev.meeting_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-[#d4af37] text-[#0f172a] py-3 rounded-xl font-bold shadow hover:brightness-110 hover:scale-[1.02] transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                  Entrar na Reunião
                </a>
              ) : (
                <a
                  href={ev.meeting_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-slate-100 text-slate-600 py-3 rounded-xl font-medium hover:bg-slate-200 transition text-sm"
                >
                  Ver Gravação (se disponível)
                </a>
              )
            ) : (
              <div className="flex items-center justify-center gap-2 p-3 bg-slate-50 rounded-xl text-xs text-slate-500 text-center border border-dashed border-slate-200">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                Link disponível apenas para membros.{' '}
                <Link to="/auth" className="font-bold text-[#d4af37] hover:underline">Entrar</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-14">
        <div className="inline-flex items-center gap-2 bg-[#d4af37]/10 text-[#b4941f] px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
          Agenda
        </div>
        <h1 className="font-serif text-4xl md:text-5xl text-slate-800 mb-3">Encontros e Eventos</h1>
        <p className="text-slate-500 max-w-2xl leading-relaxed">
          Participe de nossos encontros mensais, debates ao vivo, simpósios e congressos via Zoom ou Google Meet.
        </p>
      </div>

      {/* Upcoming events */}
      {upcoming.length > 0 ? (
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <h2 className="font-serif text-2xl text-slate-800">Próximos Eventos</h2>
            <span className="bg-[#d4af37] text-[#0f172a] text-xs font-bold px-2.5 py-1 rounded-full">
              {upcoming.length}
            </span>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcoming.map(ev => <EventCard key={ev.id} ev={ev} />)}
          </div>
        </div>
      ) : (
        <div className="mb-16 text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
          <div className="text-6xl mb-4 opacity-20">📅</div>
          <p className="font-serif text-xl text-slate-400 mb-2">Nenhum evento agendado no momento.</p>
          <p className="text-slate-400 text-sm">Fique de olho! Novos encontros são anunciados regularmente.</p>
        </div>
      )}

      {/* Past events */}
      {past.length > 0 && (
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <h2 className="font-serif text-2xl text-slate-500">Eventos Anteriores</h2>
            <span className="bg-slate-100 text-slate-500 text-xs font-bold px-2.5 py-1 rounded-full">
              {past.length}
            </span>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {past.map(ev => <EventCard key={ev.id} ev={ev} />)}
          </div>
        </div>
      )}

      {/* Calendar integration banner */}
      <div className="p-10 bg-gradient-to-br from-[#0f172a] to-slate-800 text-white rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8 border border-[#d4af37]/10 shadow-2xl">
        <div className="max-w-xl text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-[#d4af37]/10 text-[#d4af37] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            Google Calendar
          </div>
          <h2 className="font-serif text-3xl mb-3">Receba Notificações</h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Fique por dentro de todos os novos encontros. Envie um e-mail para{' '}
            <span className="text-[#d4af37] font-bold">grupodeestudosspinoza@gmail.com</span>{' '}
            solicitando ser adicionado à agenda do grupo.
          </p>
        </div>
        <a
          href="mailto:grupodeestudosspinoza@gmail.com?subject=Inscrição na Agenda - Grupo de Estudos Spinoza"
          className="flex-shrink-0 bg-[#d4af37] text-[#0f172a] px-8 py-4 rounded-full font-bold hover:scale-105 hover:brightness-110 transition-all shadow-2xl"
        >
          Inscrever-me na Agenda
        </a>
      </div>
    </div>
  );
};

export default Events;
