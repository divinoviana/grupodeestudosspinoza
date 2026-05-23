import React, { useState, useRef, useEffect } from 'react';
import { askSpinozaAI } from '../geminiService';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleAsk = async () => {
    const trimmed = query.trim();
    if (!trimmed || loading) return;
    setQuery('');
    setMessages(prev => [...prev, { role: 'user', text: trimmed }]);
    setLoading(true);
    const result = await askSpinozaAI(trimmed);
    setMessages(prev => [...prev, { role: 'ai', text: result }]);
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  const suggestedQuestions = [
    'O que é o Conatus?',
    'O que é Deus sive Natura?',
    'O que são os afetos em Spinoza?',
  ];

  return (
    <div className="fixed bottom-24 right-6 z-[100]">
      {isOpen ? (
        <div className="bg-white w-80 sm:w-96 h-[520px] rounded-2xl shadow-2xl border border-[#d4af37]/20 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-[#0f172a] p-4 flex justify-between items-center text-white flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#d4af37] text-[#0f172a] rounded-full flex items-center justify-center font-bold text-sm">AI</div>
              <div>
                <p className="text-sm font-bold text-[#d4af37]">Spinoza AI</p>
                <p className="text-[10px] text-white/50">Assistente Acadêmico</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition text-lg leading-none"
            >
              ×
            </button>
          </div>

          {/* Messages area */}
          <div className="flex-grow p-4 overflow-y-auto bg-slate-50 space-y-3">
            {messages.length === 0 && (
              <div className="text-center mt-8 px-4">
                <div className="w-12 h-12 bg-[#d4af37]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
                </div>
                <p className="text-slate-500 text-sm mb-4">Olá! Sou o assistente de IA do grupo. Pergunte sobre Spinoza!</p>
                <div className="space-y-2">
                  {suggestedQuestions.map(q => (
                    <button
                      key={q}
                      onClick={() => { setQuery(q); }}
                      className="block w-full text-left text-xs bg-white border border-slate-200 text-slate-600 px-3 py-2 rounded-lg hover:border-[#d4af37] hover:text-[#0f172a] transition"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#0f172a] text-white rounded-br-sm'
                      : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm shadow-sm'
                  }`}
                >
                  {msg.role === 'ai' && (
                    <p className="text-[10px] font-bold text-[#d4af37] uppercase tracking-widest mb-1.5">Spinoza AI</p>
                  )}
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-bl-sm shadow-sm">
                  <div className="flex gap-1.5 items-center px-1">
                    <div className="w-2 h-2 bg-[#d4af37] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-[#d4af37] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-[#d4af37] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div className="p-3 border-t bg-white flex-shrink-0">
            <div className="flex gap-2">
              <input
                className="flex-grow p-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] transition bg-slate-50 focus:bg-white"
                placeholder="Ex: O que é o Conatus?"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                onClick={handleAsk}
                disabled={loading || !query.trim()}
                className="bg-[#d4af37] text-[#0f172a] w-10 h-10 rounded-xl font-bold disabled:opacity-40 flex items-center justify-center hover:brightness-110 transition flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#0f172a] border-2 border-[#d4af37] text-[#d4af37] w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 hover:bg-slate-800 transition group"
          title="Assistente IA Spinoza"
        >
          <svg className="w-7 h-7 group-hover:rotate-12 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
          </svg>
        </button>
      )}
    </div>
  );
};

export default AIAssistant;
