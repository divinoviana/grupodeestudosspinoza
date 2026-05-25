import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GalleryItem, UserProfile } from '../types';
import { supabase } from '../supabaseClient';

interface GalleryProps {
  items: GalleryItem[];
  user: UserProfile | null;
  onAdd: (item: GalleryItem) => void;
  onDelete: (id: string) => void;
}

const Gallery: React.FC<GalleryProps> = ({ items, user, onAdd, onDelete }) => {
  const isAdmin = user?.role === 'admin';

  // Lightbox
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Album filter
  const [activeAlbum, setActiveAlbum] = useState('all');

  // Upload form
  const [showUpload, setShowUpload] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [album, setAlbum] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') setLightboxIndex(i => i !== null ? Math.min(i + 1, filtered.length - 1) : null);
      if (e.key === 'ArrowLeft') setLightboxIndex(i => i !== null ? Math.max(i - 1, 0) : null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  const albums = ['all', ...Array.from(new Set(items.map(i => i.album).filter(Boolean))) as string[]];
  const filtered = activeAlbum === 'all' ? items : items.filter(i => i.album === activeAlbum);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files).filter(f => f.type.startsWith('image/'));
    setSelectedFiles(prev => [...prev, ...arr]);
    arr.forEach(file => {
      const reader = new FileReader();
      reader.onload = e => setPreviews(prev => [...prev, e.target?.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!selectedFiles.length || !album.trim()) return;
    setUploading(true);
    setProgress(0);

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`;

      const { data: storageData, error: storageError } = await supabase.storage
        .from('gallery')
        .upload(path, file, { upsert: true });

      if (storageError) { console.error(storageError); continue; }

      const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(storageData.path);

      const { data: dbData, error: dbError } = await supabase
        .from('gallery_items')
        .insert([{ title: album.trim(), image_url: publicUrl, album: album.trim() }])
        .select()
        .single();

      if (!dbError && dbData) onAdd(dbData);
      setProgress(Math.round(((i + 1) / selectedFiles.length) * 100));
    }

    setSelectedFiles([]);
    setPreviews([]);
    setAlbum('');
    setShowUpload(false);
    setUploading(false);
    setProgress(0);
  };

  const handleDelete = async (id: string, imageUrl: string) => {
    if (!confirm('Remover esta foto da galeria?')) return;
    const path = imageUrl.split('/gallery/')[1];
    if (path) await supabase.storage.from('gallery').remove([path]);
    const { error } = await supabase.from('gallery_items').delete().eq('id', id);
    if (!error) onDelete(id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
        <div>
          <h1 className="font-serif text-4xl text-slate-800 mb-2">Memórias do Grupo</h1>
          <p className="text-slate-500">Registros dos encontros, seminários e colóquios.</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowUpload(v => !v)}
            className="flex items-center gap-2 bg-[#0f172a] text-white px-5 py-3 rounded-xl font-bold hover:bg-slate-700 transition shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
            </svg>
            {showUpload ? 'Cancelar' : 'Adicionar Fotos'}
          </button>
        )}
      </div>

      {/* Upload Panel (admin only) */}
      {isAdmin && showUpload && (
        <div className="mb-10 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="bg-[#0f172a] px-6 py-4 flex items-center gap-3">
            <svg className="w-5 h-5 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
            </svg>
            <h3 className="text-white font-semibold">Novo Álbum / Upload de Fotos</h3>
          </div>
          <div className="p-6 space-y-5">
            {/* Album name */}
            <input
              type="text"
              placeholder="Nome do álbum ou evento (ex: Encontro de Maio 2025)"
              value={album}
              onChange={e => setAlbum(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#d4af37] outline-none"
            />

            {/* Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition ${
                dragOver ? 'border-[#d4af37] bg-[#d4af37]/5' : 'border-slate-200 hover:border-[#d4af37] hover:bg-slate-50'
              }`}
            >
              <svg className="w-10 h-10 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <p className="text-slate-500 font-medium">Arraste fotos aqui ou clique para selecionar</p>
              <p className="text-slate-400 text-xs mt-1">Selecione várias de uma vez — JPG, PNG, WEBP</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={e => addFiles(e.target.files)}
              />
            </div>

            {/* Previews */}
            {previews.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-3">{previews.length} foto(s) selecionada(s)</p>
                <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 gap-2">
                  {previews.map((src, i) => (
                    <div key={i} className="relative group aspect-square rounded-lg overflow-hidden bg-slate-100">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeFile(i)}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                      >
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Progress */}
            {uploading && (
              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Enviando fotos...</span><span>{progress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-[#d4af37] h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={uploading || !selectedFiles.length || !album.trim()}
              className="w-full bg-[#d4af37] text-[#0f172a] py-3 rounded-xl font-bold hover:brightness-110 transition disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {uploading ? (
                <div className="w-5 h-5 border-2 border-[#0f172a] border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                </svg>
              )}
              {uploading ? `Enviando ${progress}%...` : `Publicar ${selectedFiles.length > 0 ? selectedFiles.length + ' foto(s)' : ''}`}
            </button>
          </div>
        </div>
      )}

      {/* Album filter tabs */}
      {albums.length > 1 && (
        <div className="flex gap-2 flex-wrap mb-8">
          {albums.map(a => (
            <button
              key={a}
              onClick={() => setActiveAlbum(a)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                activeAlbum === a
                  ? 'bg-[#0f172a] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {a === 'all' ? `Todos (${items.length})` : `${a} (${items.filter(i => i.album === a).length})`}
            </button>
          ))}
        </div>
      )}

      {/* Masonry grid */}
      {filtered.length > 0 ? (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
          {filtered.map((item, index) => (
            <div key={item.id} className="break-inside-avoid mb-4 group relative rounded-xl overflow-hidden shadow-md cursor-pointer">
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full object-cover transition duration-500 group-hover:scale-105"
                onClick={() => setLightboxIndex(index)}
                loading="lazy"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col justify-end p-4"
                onClick={() => setLightboxIndex(index)}
              >
                <p className="text-white font-semibold text-sm leading-tight">{item.title}</p>
                {item.album && <p className="text-white/60 text-xs mt-0.5">{item.album}</p>}
              </div>
              {isAdmin && (
                <button
                  onClick={e => { e.stopPropagation(); handleDelete(item.id, item.image_url); }}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-600/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition flex items-center justify-center hover:bg-red-700"
                  title="Remover foto"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-28 text-center">
          <svg className="w-16 h-16 text-slate-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          <p className="font-serif text-2xl text-slate-400">Nenhuma foto ainda.</p>
          {isAdmin && <p className="text-slate-400 text-sm mt-2">Clique em "Adicionar Fotos" para começar.</p>}
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Prev */}
          <button
            onClick={e => { e.stopPropagation(); setLightboxIndex(i => i !== null ? Math.max(i - 1, 0) : null); }}
            disabled={lightboxIndex === 0}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition disabled:opacity-20"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>

          {/* Image */}
          <div className="max-w-5xl max-h-[90vh] px-16" onClick={e => e.stopPropagation()}>
            <img
              src={filtered[lightboxIndex].image_url}
              alt={filtered[lightboxIndex].title}
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl mx-auto"
            />
            <div className="text-center mt-4">
              <p className="text-white font-semibold">{filtered[lightboxIndex].title}</p>
              {filtered[lightboxIndex].album && (
                <p className="text-white/50 text-sm">{filtered[lightboxIndex].album}</p>
              )}
              <p className="text-white/30 text-xs mt-1">{lightboxIndex + 1} / {filtered.length}</p>
            </div>
          </div>

          {/* Next */}
          <button
            onClick={e => { e.stopPropagation(); setLightboxIndex(i => i !== null ? Math.min(i + 1, filtered.length - 1) : null); }}
            disabled={lightboxIndex === filtered.length - 1}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition disabled:opacity-20"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>

          {/* Close */}
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default Gallery;
