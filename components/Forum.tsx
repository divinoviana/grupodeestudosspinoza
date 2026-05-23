import React, { useState } from 'react';
import { ForumTopic, UserProfile, ForumCategory } from '../types';

interface ForumProps {
  topics: ForumTopic[];
  user: UserProfile | null;
  onAddTopic: (topic: ForumTopic) => void;
}

const CATEGORIES: ForumCategory[] = ['Ética', 'Ontologia', 'Política', 'Epistemologia', 'Metafísica', 'Teologia'];

const CATEGORY_COLORS: Record<ForumCategory, string> = {
  'Ética': 'bg-emerald-100 text-emerald-800',
  'Ontologia': 'bg-violet-100 text-violet-800',
  'Política': 'bg-blue-100 text-blue-800',
  'Epistemologia': 'bg-amber-100 text-amber-800',
  'Metafísica': 'bg-rose-100 text-rose-800',
  'Teologia': 'bg-slate-100 text-slate-700',
};

const Forum: React.FC<ForumProps> = ({ topics, user, onAddTopic }) => {
  const [selectedCat, setSelectedCat] = useState<ForumCategory | 'Todas'>('Todas');
  const [showForm, setShowForm] = useState(false);
  const [newTopic, setNewTopic] = useState({ title: '', category: 'Ética' as ForumCategory, content: '' });

  const filteredTopics = selectedCat === 'Todas' ? topics : topics.filter(t => t.category === selectedCat);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const topic: ForumTopic = {
      id: Date.now().toString(),
      author_id: user.id,
      author_name: user.full_name,
      category: newTopic.category,
      title: newTopic.title,
      content: newTopic.content,
      created_at: new Date().toISOString(),
    };
    onAddTopic(topic);
    setShowForm(false);
    setNewTopic({ title: '', category: 'Ética', content: '' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 bg-[#d4af37]/10 text-[#b4941f] px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
          Espaço de Debate
        </div>
        <h1 className="font-serif text-4xl md:text-5xl text-slate-800 mb-4">Fórum Filosófico</h1>
        <p className="text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Compartilhe reflexões, levante questões e debata as grandes áreas do pensamento spinozano com os membros do grupo.
        </p>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        <button
          onClick={() => setSelectedCat('Todas')}
          className={`px-5 py-2 rounded-full text-sm font-bold border transition-all ${
            selectedCat === 'Todas'
              ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-lg'
              : 'bg-white text-slate-600 border-slate-200 hover:border-[#0f172a] hover:text-[#0f172a]'
          }`}
        >
          Todas
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className={`px-5 py-2 rounded-full text-sm font-bold border transition-all ${
              selectedCat === cat
                ? 'bg-[#d4af37] text-[#0f172a] border-[#d4af37] shadow-lg'
                : 'bg-white text-slate-600 border-slate-200 hover:border-[#d4af37] hover:text-[#0f172a]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="mb-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-slate-800">
            {selectedCat === 'Todas' ? 'Todos os Tópicos' : selectedCat}
          </h2>
          <span className="bg-slate-100 text-slate-500 text-xs font-bold px-2.5 py-1 rounded-full">
            {filteredTopics.length}
          </span>
        </div>
        {user ? (
          <button
            onClick={() => setShowForm(!showForm)}
            className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all shadow ${
              showForm
                ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                : 'bg-[#0f172a] text-white hover:bg-slate-800'
            }`}
          >
            {showForm ? '✕ Cancelar' : '+ Novo Tópico'}
          </button>
        ) : (
          <p className="text-sm text-slate-400 italic">
            <a href="#/auth" className="text-[#d4af37] font-bold hover:underline">Faça login</a> para participar.
          </p>
        )}
      </div>

      {/* New topic form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-10 bg-white p-8 rounded-2xl shadow-xl border border-[#d4af37]/20 space-y-5"
        >
          <h3 className="font-serif text-2xl text-slate-800">Nova Reflexão</h3>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Título</label>
            <input
              required
              className="w-full p-4 text-xl font-serif border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] outline-none transition bg-slate-50 focus:bg-white"
              placeholder="Título da sua reflexão..."
              value={newTopic.title}
              onChange={e => setNewTopic({ ...newTopic, title: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Categoria</label>
            <select
              className="w-full sm:w-auto p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] outline-none transition bg-slate-50 focus:bg-white font-medium text-slate-700"
              value={newTopic.category}
              onChange={e => setNewTopic({ ...newTopic, category: e.target.value as ForumCategory })}
            >
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Conteúdo</label>
            <textarea
              required
              rows={6}
              className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] outline-none transition bg-slate-50 focus:bg-white resize-none leading-relaxed"
              placeholder="Escreva seu pensamento, dúvida ou comentário sobre o texto de Spinoza..."
              value={newTopic.content}
              onChange={e => setNewTopic({ ...newTopic, content: e.target.value })}
            />
          </div>
          <button
            type="submit"
            className="bg-[#d4af37] text-[#0f172a] px-8 py-3 rounded-xl font-bold shadow-lg hover:brightness-110 hover:scale-105 transition-all"
          >
            Publicar no Fórum
          </button>
        </form>
      )}

      {/* Topics list */}
      <div className="space-y-4">
        {filteredTopics.length > 0 ? filteredTopics.map(topic => (
          <article key={topic.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-[#d4af37]/30 hover:shadow-md transition-all duration-200 group">
            <div className="flex justify-between items-start mb-4 gap-4 flex-wrap">
              <span className={`text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${CATEGORY_COLORS[topic.category]}`}>
                {topic.category}
              </span>
              <span className="text-xs text-slate-400">
                {new Date(topic.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <h3 className="font-serif text-2xl text-slate-900 mb-3 group-hover:text-[#0f172a] leading-snug">{topic.title}</h3>
            <p className="text-slate-500 mb-5 line-clamp-2 leading-relaxed text-sm">{topic.content}</p>
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#0f172a] text-[#d4af37] flex items-center justify-center text-xs font-bold">
                  {topic.author_name[0]}
                </div>
                <span className="text-xs font-medium text-slate-500">{topic.author_name}</span>
              </div>
              <button className="text-sm font-bold text-[#d4af37] hover:underline hover:text-[#b4941f] transition">
                Ver respostas →
              </button>
            </div>
          </article>
        )) : (
          <div className="text-center py-24 bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <div className="text-6xl mb-4 opacity-20">💬</div>
            <p className="font-serif text-xl text-slate-400 mb-2">Nenhum tópico encontrado nesta categoria.</p>
            <p className="text-slate-400 text-sm">Seja o primeiro a iniciar o debate!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Forum;
