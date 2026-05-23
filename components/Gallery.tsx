import React from 'react';
import { GalleryItem } from '../types';

interface GalleryProps {
  items: GalleryItem[];
}

const Gallery: React.FC<GalleryProps> = ({ items }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-14 gap-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#d4af37]/10 text-[#b4941f] px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
            Memória Visual
          </div>
          <h1 className="font-serif text-4xl md:text-5xl text-slate-800 mb-2">Galeria do Grupo</h1>
          <p className="text-slate-500">Registros fotográficos de nossos encontros, seminários e colóquios.</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-xl px-6 py-4 shadow-sm text-right">
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Integrado com</p>
          <p className="font-bold text-[#0f172a]">grupodeestudosspinoza@gmail.com</p>
        </div>
      </div>

      {/* Gallery grid */}
      {items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => (
            <div
              key={item.id}
              className="group relative bg-[#0f172a] rounded-2xl shadow-lg overflow-hidden aspect-[4/3] border border-slate-200 hover:shadow-2xl transition-all duration-300"
            >
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-full object-cover transition duration-500 group-hover:scale-110 group-hover:opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col justify-end p-6">
                <p className="text-white font-serif text-xl mb-1">{item.title}</p>
                <p className="text-white/60 text-xs">
                  {new Date(item.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <div className="text-7xl mb-6 opacity-10">📷</div>
          <p className="font-serif text-2xl text-slate-400 mb-2">A galeria ainda está vazia.</p>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            As fotos dos nossos encontros aparecerão aqui após curadoria.
          </p>
        </div>
      )}

      {/* Upload CTA */}
      <div className="mt-16 bg-gradient-to-br from-slate-50 to-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center hover:border-[#d4af37]/40 transition">
        <div className="w-16 h-16 bg-[#d4af37] text-[#0f172a] rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl shadow-lg">
          +
        </div>
        <h3 className="font-serif text-2xl text-slate-800 mb-3">Contribua com Fotos</h3>
        <p className="text-slate-500 max-w-lg mx-auto mb-8 text-sm leading-relaxed">
          Participou de algum encontro presencial ou virtual? Envie suas capturas de tela ou fotos para o e-mail oficial e elas aparecerão aqui após curadoria.
        </p>
        <a
          href="mailto:grupodeestudosspinoza@gmail.com?subject=Envio de Fotos - Galeria do Grupo"
          className="inline-flex items-center gap-2 bg-[#0f172a] text-white px-8 py-3 rounded-xl font-bold hover:scale-105 hover:bg-slate-800 transition shadow-lg"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          Enviar via E-mail
        </a>
      </div>
    </div>
  );
};

export default Gallery;
