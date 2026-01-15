
import React, { useState } from 'react';
import { Publication, UserProfile } from '../types';

interface PublicationsProps {
  publications: Publication[];
  user: UserProfile | null;
  onAdd: (pub: Publication) => void;
}

const Publications: React.FC<PublicationsProps> = ({ publications, user, onAdd }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newPub, setNewPub] = useState({ title: '', abstract: '', link: '', category: 'Ética' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const pub: Publication = {
      id: Date.now().toString(),
      title: newPub.title,
      author_id: user.id,
      author_name: user.full_name,
      abstract: newPub.abstract,
      link: newPub.link,
      category: newPub.category,
      created_at: new Date().toISOString()
    };
    onAdd(pub);
    setShowAdd(false);
    setNewPub({ title: '', abstract: '', link: '', category: 'Ética' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12">
        <div>
          <h1 className="font-serif text-4xl text-slate-800 mb-2">Repositório de Pesquisa</h1>
          <p className="text-slate-500">Artigos, dissertações e ensaios sobre a obra de Spinoza.</p>
        </div>
        {user && (
          <button 
            onClick={() => setShowAdd(!showAdd)}
            className="mt-4 md:mt-0 bg-[#0f172a] text-[#d4af37] px-6 py-3 rounded-lg font-bold shadow-lg hover:scale-105 transition"
          >
            {showAdd ? 'Cancelar' : 'Publicar Trabalho'}
          </button>
        )}
      </div>

      {showAdd && (
        <form onSubmit={handleSubmit} className="mb-12 bg-white p-8 rounded-xl border border-[#d4af37]/30 shadow-xl space-y-4">
          <h3 className="font-serif text-2xl mb-4">Novo Trabalho Acadêmico</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              required
              placeholder="Título da Obra" 
              className="p-3 border rounded w-full"
              value={newPub.title}
              onChange={e => setNewPub({...newPub, title: e.target.value})}
            />
            <select 
              className="p-3 border rounded w-full"
              value={newPub.category}
              onChange={e => setNewPub({...newPub, category: e.target.value})}
            >
              <option>Ética</option>
              <option>Ontologia</option>
              <option>Política</option>
              <option>Epistemologia</option>
              <option>Metafísica</option>
              <option>Teologia</option>
            </select>
          </div>
          <textarea 
            required
            placeholder="Resumo / Abstract" 
            className="w-full p-3 border rounded" 
            rows={4}
            value={newPub.abstract}
            onChange={e => setNewPub({...newPub, abstract: e.target.value})}
          ></textarea>
          <input 
            required
            placeholder="Link para a publicação original (Ex: Repositório UFT, Revista Helius)" 
            className="w-full p-3 border rounded"
            value={newPub.link}
            onChange={e => setNewPub({...newPub, link: e.target.value})}
          />
          <button className="bg-[#d4af37] text-[#0f172a] px-8 py-3 rounded-lg font-bold hover:brightness-110">Submeter Publicação</button>
        </form>
      )}

      <div className="grid gap-8">
        {publications.map(pub => (
          <div key={pub.id} className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden hover:shadow-xl transition-shadow group">
            <div className="p-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-slate-100 text-[#0f172a] text-xs font-bold rounded-full border border-[#d4af37]/20 uppercase tracking-wider">
                  {pub.category}
                </span>
                <span className="text-xs text-slate-400">Publicado em {new Date(pub.created_at).toLocaleDateString()}</span>
              </div>
              <h2 className="font-serif text-2xl text-slate-900 mb-3 group-hover:text-[#0f172a] transition-colors">{pub.title}</h2>
              <p className="text-slate-500 text-sm mb-4 italic">Por {pub.author_name}</p>
              <p className="text-slate-600 leading-relaxed line-clamp-3 mb-6">{pub.abstract}</p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 border-t pt-6">
                <a 
                  href={pub.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto text-center px-6 py-2 bg-[#0f172a] text-white rounded hover:bg-slate-800 transition text-sm font-medium"
                >
                  Acessar Publicação Original
                </a>
                <button className="w-full sm:w-auto text-slate-500 hover:text-slate-900 transition text-sm flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                  Discutir trabalho
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Publications;
