
import React, { useState } from 'react';
import { ForumTopic, UserProfile, ForumCategory } from '../types';

interface ForumProps {
  topics: ForumTopic[];
  user: UserProfile | null;
  onAddTopic: (topic: ForumTopic) => void;
}

const CATEGORIES: ForumCategory[] = ['Ética', 'Ontologia', 'Política', 'Epistemologia', 'Metafísica', 'Teologia'];

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
      created_at: new Date().toISOString()
    };
    onAddTopic(topic);
    setShowForm(false);
    setNewTopic({ title: '', category: 'Ética', content: '' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="font-serif text-4xl text-slate-800 mb-4">Espaço de Debate</h1>
        <p className="text-slate-500 max-w-2xl mx-auto">
          Um fórum simplificado para trocas de conhecimentos sobre as grandes áreas do pensamento spinozano.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mb-12">
        <button 
          onClick={() => setSelectedCat('Todas')}
          className={`px-6 py-2 rounded-full text-sm font-bold border transition ${selectedCat === 'Todas' ? 'bg-[#0f172a] text-white border-[#0f172a]' : 'bg-white text-slate-600 border-slate-200 hover:border-[#d4af37]'}`}
        >
          Todas
        </button>
        {CATEGORIES.map(cat => (
          <button 
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className={`px-6 py-2 rounded-full text-sm font-bold border transition ${selectedCat === cat ? 'bg-[#d4af37] text-[#0f172a] border-[#d4af37]' : 'bg-white text-slate-600 border-slate-200 hover:border-[#d4af37]'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="mb-8 flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Tópicos em {selectedCat}</h2>
        {user ? (
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-[#0f172a] text-white px-5 py-2 rounded shadow hover:bg-slate-800 transition"
          >
            {showForm ? 'Fechar' : 'Novo Tópico'}
          </button>
        ) : (
          <p className="text-sm text-slate-400">Faça login para participar dos debates.</p>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-12 bg-white p-8 rounded-xl shadow-lg space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <input 
            required
            className="w-full p-4 text-xl font-serif border-b focus:border-[#d4af37] outline-none" 
            placeholder="Título da sua reflexão..."
            value={newTopic.title}
            onChange={e => setNewTopic({...newTopic, title: e.target.value})}
          />
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-slate-500">Categoria:</span>
            <select 
              className="p-2 border rounded"
              value={newTopic.category}
              onChange={e => setNewTopic({...newTopic, category: e.target.value as ForumCategory})}
            >
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <textarea 
            required
            rows={6}
            className="w-full p-4 border rounded focus:ring-2 focus:ring-[#d4af37] outline-none" 
            placeholder="Escreva seu pensamento, dúvida ou comentário sobre o texto de Spinoza..."
            value={newTopic.content}
            onChange={e => setNewTopic({...newTopic, content: e.target.value})}
          ></textarea>
          <button type="submit" className="bg-[#d4af37] text-[#0f172a] px-8 py-3 rounded-lg font-bold shadow hover:scale-105 transition">Publicar no Fórum</button>
        </form>
      )}

      <div className="space-y-4">
        {filteredTopics.length > 0 ? filteredTopics.map(topic => (
          <div key={topic.id} className="bg-white p-6 rounded-lg shadow-sm border border-slate-100 hover:border-[#d4af37]/30 transition group">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-slate-100 text-slate-500 rounded">
                {topic.category}
              </span>
              <span className="text-xs text-slate-400">{new Date(topic.created_at).toLocaleDateString()}</span>
            </div>
            <h3 className="font-serif text-2xl text-slate-900 mb-2 group-hover:text-[#0f172a] transition-colors">{topic.title}</h3>
            <p className="text-slate-600 mb-4 line-clamp-2">{topic.content}</p>
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px]">{topic.author_name[0]}</div>
                <span className="text-xs font-medium text-slate-500">{topic.author_name}</span>
              </div>
              <button className="text-sm font-bold text-[#d4af37] hover:underline">Ver respostas &rarr;</button>
            </div>
          </div>
        )) : (
          <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-slate-200">
             <p className="text-slate-400">Nenhum tópico encontrado nesta categoria. Seja o primeiro a iniciar o debate!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Forum;
