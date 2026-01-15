
import React from 'react';
import { GalleryItem } from '../types';

interface GalleryProps {
  items: GalleryItem[];
}

const Gallery: React.FC<GalleryProps> = ({ items }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
        <div>
          <h1 className="font-serif text-4xl text-slate-800 mb-2">Memórias do Grupo</h1>
          <p className="text-slate-500">Registros de nossos encontros, seminários e colóquios.</p>
        </div>
        <div className="text-right">
           <p className="text-xs text-slate-400">Integrado com Google Fotos:</p>
           <p className="text-sm font-bold text-[#0f172a]">grupodeestudosspinoza@gmail.com</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(item => (
          <div key={item.id} className="group relative bg-white rounded-xl shadow-lg overflow-hidden border border-slate-100 aspect-[4/3]">
            <img 
              src={item.image_url} 
              alt={item.title} 
              className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col justify-end p-6">
               <p className="text-white font-serif text-xl mb-1">{item.title}</p>
               <p className="text-white/60 text-xs">{new Date(item.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
         <div className="w-16 h-16 bg-[#d4af37] text-[#0f172a] rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">+</div>
         <h3 className="font-serif text-2xl text-slate-800 mb-4">Envie suas Fotos</h3>
         <p className="text-slate-500 max-w-lg mx-auto mb-8">Participou de algum encontro presencial ou virtual? Envie suas capturas de tela ou fotos para o e-mail oficial e elas aparecerão aqui após curadoria.</p>
         <button className="bg-[#0f172a] text-white px-8 py-3 rounded-lg font-bold hover:scale-105 transition">Enviar via E-mail</button>
      </div>
    </div>
  );
};

export default Gallery;
