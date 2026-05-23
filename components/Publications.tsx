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
      created_at: new Date().toISOString(),
    };
    onAdd(pub);
    setShowAdd(false);
    setNewPub({ title: '', abstract: '', link: '', category: 'Ética' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#d4af37]/10 text-[#b4941f] px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
            Repositório Acadêmico
          </div>
          <h1 className="font-serif text-4xl md:text-5xl text-slate-800 mb-2">Repositório de Pesquisa</h1>
          <p className="text-slate-500 italic text-sm max-w-lg">
            "A ordem e a conexão das ideias são as mesmas que a ordem e a conexão das coisas." — Spinoza
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filtrar por Pesquisador</label>
            <select
              className="p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] cursor-pointer transition"
              value={selectedAuthor}
              onChange={(e) => setSelectedAuthor(e.target.value)}
            >
              {authors.map(author => <option key={author} value={author}>{author}</option>)}
            </select>
          </div>
          {user && (
            <button
              onClick={() => setShowAdd(!showAdd)}
              className={`mt-auto px-6 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition text-sm ${
                showAdd
                  ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  : 'bg-[#0f172a] text-[#d4af37] hover:bg-slate-800'
              }`}
            >
              {showAdd ? '✕ Cancelar' : '+ Publicar Trabalho'}
            </button>
          )}
        </div>
      </div>

      {/* Add publication form */}
      {showAdd && (
        <form onSubmit={handleSubmit} className="mb-12 bg-white p-8 rounded-2xl border border-[#d4af37]/20 shadow-xl space-y-5">
          <h3 className="font-serif text-2xl text-slate-800 mb-2">Novo Trabalho Acadêmico</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Título da Obra</label>
              <input
                required
                placeholder="Ex: Spinoza e a liberdade..."
                className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] transition bg-slate-50 focus:bg-white"
                value={newPub.title}
                onChange={e => setNewPub({ ...newPub, title: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Categoria</label>
              <select
                className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] transition bg-slate-50 focus:bg-white"
                value={newPub.category}
                onChange={e => setNewPub({ ...newPub, category: e.target.value })}
              >
                <option>Ética</option>
                <option>Ontologia</option>
                <option>Política</option>
                <option>Epistemologia</option>
                <option>Metafísica</option>
                <option>Teologia</option>
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Resumo / Abstract</label>
            <textarea
              required
              placeholder="Descreva brevemente o conteúdo e contribuição do trabalho..."
              className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] transition bg-slate-50 focus:bg-white resize-none"
              rows={4}
              value={newPub.abstract}
              onChange={e => setNewPub({ ...newPub, abstract: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Link da Publicação</label>
            <input
              required
              placeholder="https://exemplo.com/artigo"
              className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] transition bg-slate-50 focus:bg-white"
              value={newPub.link}
              onChange={e => setNewPub({ ...newPub, link: e.target.value })}
            />
          </div>
          <button className="bg-[#d4af37] text-[#0f172a] px-8 py-3 rounded-xl font-bold hover:brightness-110 hover:scale-105 transition-all shadow-lg">
            Submeter Publicação
          </button>
        </form>
      )}

      {/* Publications grouped by author */}
      <div className="grid gap-14">
        {authors.filter(a => a !== 'Todos' && (selectedAuthor === 'Todos' || selectedAuthor === a)).map(author => (
          <section key={author} className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="bg-[#d4af37]/10 border-l-4 border-[#d4af37] px-5 py-2.5 rounded-r-xl">
                <p className="text-[10px] font-bold text-[#b4941f] uppercase tracking-widest">Pesquisador</p>
                <h2 className="font-serif text-xl text-[#0f172a] font-bold">{author}</h2>
              </div>
              <div className="h-px bg-slate-200 flex-grow" />
              <span className="text-xs text-slate-400 font-medium bg-slate-100 px-3 py-1 rounded-full">
                {filteredPublications.filter(p => p.author_name === author).length} trabalhos
              </span>
            </div>

            <div className="grid gap-5">
              {filteredPublications.filter(p => p.author_name === author).map(pub => (
                <div
                  key={pub.id}
                  className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:border-[#d4af37]/20 transition-all duration-300 group"
                >
                  <div className="p-8">
                    <div className="flex items-start justify-between mb-4 gap-4 flex-wrap">
                      <span className="px-3 py-1 bg-[#0f172a] text-[#d4af37] text-[10px] font-bold rounded-full uppercase tracking-widest">
                        {pub.category}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(pub.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </span>
                    </div>

                    <h3 className="font-serif text-2xl text-slate-900 mb-4 group-hover:text-[#0f172a] transition-colors leading-snug">
                      {pub.title}
                    </h3>

                    <p className="text-slate-500 leading-relaxed mb-6 text-sm line-clamp-3">
                      {pub.abstract}
                    </p>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-slate-100 pt-5">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Fonte</span>
                        <a
                          href={pub.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#0f172a] hover:text-blue-700 font-medium text-xs truncate max-w-[280px] underline decoration-[#d4af37] underline-offset-4 transition-colors"
                        >
                          {pub.link}
                        </a>
                      </div>
                      <a
                        href={pub.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-[#d4af37] text-[#0f172a] px-6 py-2.5 rounded-xl font-bold shadow hover:scale-105 hover:brightness-105 transition-all whitespace-nowrap"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                        Acessar Obra
                      </a>
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
            <p className="font-serif text-xl text-slate-400 italic">Nenhuma produção acadêmica encontrada para este filtro.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Publications;
