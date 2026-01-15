
import React, { useState } from 'react';
import { askSpinozaAI } from '../geminiService';

const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!query.trim()) return;
    setLoading(true);
    const result = await askSpinozaAI(query);
    setResponse(result);
    setLoading(false);
  };

  return (
    <div className="fixed bottom-24 right-6 z-[100]">
      {isOpen ? (
        <div className="bg-white w-80 sm:w-96 h-[500px] rounded-2xl shadow-2xl border border-[#d4af37]/30 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-[#0f172a] p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#d4af37] text-[#0f172a] rounded-full flex items-center justify-center font-bold">G</div>
              <div>
                 <p className="text-xs font-bold uppercase tracking-widest text-[#d4af37]">Spinoza AI</p>
                 <p className="text-[10px] opacity-60">Gemini 3 Flash Powered</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-[#d4af37]">&times;</button>
          </div>
          
          <div className="flex-grow p-4 overflow-y-auto bg-slate-50 space-y-4 text-sm">
            {response ? (
              <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                <p className="font-bold text-[#0f172a] mb-2 uppercase text-[10px]">Resposta Acadêmica:</p>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{response}</p>
              </div>
            ) : (
              <div className="text-center text-slate-400 mt-20">
                <p>Olá! Sou o assistente de IA do grupo. Em que posso ajudar na sua pesquisa hoje?</p>
              </div>
            )}
            {loading && (
              <div className="flex items-center justify-center py-4">
                <div className="w-6 h-6 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          <div className="p-4 border-t bg-white">
            <div className="flex gap-2">
              <input 
                className="flex-grow p-2 border rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#d4af37]"
                placeholder="Ex: Qual o conceito de Conatus?"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleAsk()}
              />
              <button 
                onClick={handleAsk}
                disabled={loading}
                className="bg-[#d4af37] text-[#0f172a] px-3 py-2 rounded-lg font-bold disabled:opacity-50"
              >
                &rarr;
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-[#d4af37] text-[#0f172a] w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-2xl hover:scale-110 transition group"
        >
          <svg className="w-8 h-8 group-hover:rotate-12 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
        </button>
      )}
    </div>
  );
};

export default AIAssistant;
