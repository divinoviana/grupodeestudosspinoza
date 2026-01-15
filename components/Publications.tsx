
import React, { useState, useMemo } from 'react';
import { Publication, UserProfile } from '../types';

interface PublicationsProps {
  publications: Publication[];
  user: UserProfile | null;
  onAdd: (pub: Publication) => void;
}

const Publications: React.FC<PublicationsProps> = ({ publications, user, onAdd }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState<string>('Todos');
  const [newPub, setNewPub] = useState({ title: '', abstract: '', link: '', category: 'Ética' });

  const authors = useMemo(() => {
    const list = Array.from(new Set(publications.map(p => p.author_name)));
    return ['Todos', ...list];
  }, [publications]);

  const filteredPublications = useMemo(() => {
    if (selectedAuthor === 'Todos') return publications;
    return publications.filter(p => p.author_name === selectedAuthor);
  }, [publications, selectedAuthor]);

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
      <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-6">
        <div>
          <h1 className="font-serif text-4xl text-slate-800 mb-2">Repositório de Pesquisa</h1>
          <p className="text-slate-500 italic">"A ordem e a conexão das ideias são as mesmas que a ordem e a conexão das coisas." (Spinoza)</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Filtrar por Pesquisador:</label>
            <select 
              className="p-3 bg-white border border-[#d4af37]/30 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#d4af37] cursor-pointer"
              value={selectedAuthor}
              onChange={(e) => setSelectedAuthor(e.target.value)}
            >
              {authors.map(author => <option key={author} value={author}>{author}</option>)}
            </select>
          </div>
          {user && (
            <button 
              onClick={() => setShowAdd(!showAdd)}
              className="mt-auto bg-[#0f172a] text-[#d4af37] px-6 py-3 rounded-lg font-bold shadow-lg hover:scale-105 transition"
            >
              {showAdd ? 'Cancelar' : 'Publicar Trabalho'}
            </button>
          )}
        </div>
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
            placeholder="Cole aqui o link completo da publicação (HTTP/HTTPS)" 
            className="w-full p-3 border rounded bg-slate-50 focus:bg-white"
            value={newPub.link}
            onChange={e => setNewPub({...newPub, link: e.target.value})}
          />
          <button className="bg-[#d4af37] text-[#0f172a] px-8 py-3 rounded-lg font-bold hover:brightness-110">Submeter Publicação</button>
        </form>
      )}

      <div className="grid gap-12">
        {authors.filter(a => a !== 'Todos' && (selectedAuthor === 'Todos' || selectedAuthor === a)).map(author => (
          <section key={author} className="space-y-6">
            <div className="flex items-center gap-4">
               <h2 className="font-serif text-2xl text-[#0f172a] bg-[#d4af37]/10 px-4 py-2 rounded-lg border-l-4 border-[#d4af37]">
                 Pesquisador: <span className="font-bold">{author}</span>
               </h2>
               <div className="h-[1px] bg-slate-200 flex-grow"></div>
            </div>
            
            <div className="grid gap-6">
              {filteredPublications.filter(p => p.author_name === author).map(pub => (
                <div key={pub.id} className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 group">
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-3 py-1 bg-[#0f172a] text-[#d4af37] text-[10px] font-bold rounded uppercase tracking-widest">
                        {pub.category}
                      </span>
                      <span className="text-xs text-slate-400">ID: #{pub.id.slice(0, 5)}</span>
                    </div>
                    
                    <h3 className="font-serif text-2xl text-slate-900 mb-4 group-hover:text-[#d4af37] transition-colors">
                      {pub.title}
                    </h3>
                    
                    <p className="text-slate-600 leading-relaxed mb-6 text-sm line-clamp-3">
                      {pub.abstract}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-t pt-6">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Link da Produção:</span>
                        <a 
                          href={pub.link} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-[#0f172a] hover:text-blue-700 font-medium text-xs truncate max-w-[250px] underline decoration-[#d4af37] underline-offset-4"
                        >
                          {pub.link}
                        </a>
                      </div>
                      
                      <div className="flex gap-3 w-full sm:w-auto">
                        <a 
                          href={pub.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex-grow sm:flex-grow-0 flex items-center justify-center gap-2 bg-[#d4af37] text-[#0f172a] px-6 py-3 rounded-lg font-bold shadow-md hover:scale-105 transition active:scale-95"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                          Acessar Obra Original
                        </a>
                        <button className="p-3 text-slate-400 hover:text-[#0f172a] hover:bg-slate-50 rounded-lg transition" title="Discutir esta publicação">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {filteredPublications.length === 0 && (
          <div className="text-center py-24 bg-white rounded-2xl border-2 border-dashed border-slate-200">
             <div className="text-6xl mb-4 opacity-20">📖</div>
             <p className="text-slate-400 italic font-serif text-xl">Nenhuma produção acadêmica encontrada para este filtro.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Publications;
