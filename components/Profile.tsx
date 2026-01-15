
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface ProfileProps {
  user: UserProfile;
  onUpdate: (user: UserProfile) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState({...user});
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        <div className="h-40 bg-gradient-to-r from-[#0f172a] to-slate-800 relative">
          <div className="absolute -bottom-12 left-8">
            <div className="w-24 h-24 rounded-full bg-white p-1 shadow-xl">
               <div className="w-full h-full rounded-full bg-slate-200 flex items-center justify-center text-4xl font-serif text-[#0f172a] border-4 border-[#d4af37]">
                 {user.username[0].toUpperCase()}
               </div>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSave} className="pt-16 p-8 space-y-6">
          <div className="flex justify-between items-center mb-4">
             <div>
               <h1 className="text-3xl font-serif text-slate-900">{user.full_name}</h1>
               <p className="text-[#d4af37] font-bold uppercase text-xs tracking-widest">{user.role}</p>
             </div>
             {saved && <span className="text-green-600 font-bold animate-pulse">✓ Salvo com sucesso!</span>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600">Nome de Usuário</label>
              <input 
                className="w-full p-3 bg-slate-50 border rounded-lg" 
                value={formData.username} 
                onChange={e => setFormData({...formData, username: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600">Nome Completo</label>
              <input 
                className="w-full p-3 bg-slate-50 border rounded-lg" 
                value={formData.full_name}
                onChange={e => setFormData({...formData, full_name: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-600">Biografia</label>
            <textarea 
              rows={4}
              className="w-full p-3 bg-slate-50 border rounded-lg" 
              placeholder="Fale um pouco sobre seu interesse em Spinoza..."
              value={formData.bio}
              onChange={e => setFormData({...formData, bio: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-600">Informações Acadêmicas</label>
            <textarea 
              rows={3}
              className="w-full p-3 bg-slate-50 border rounded-lg" 
              placeholder="Formação, Instituição, Pesquisas..."
              value={formData.academic_info}
              onChange={e => setFormData({...formData, academic_info: e.target.value})}
            />
          </div>

          <div className="pt-6 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-400">Última atualização: {new Date().toLocaleDateString()}</p>
            <button className="bg-[#0f172a] text-[#d4af37] px-10 py-3 rounded-lg font-bold shadow-lg hover:scale-105 transition">Salvar Perfil</button>
          </div>
        </form>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
         <div className="bg-white p-6 rounded-xl shadow border border-slate-100 text-center">
            <p className="text-2xl font-serif text-[#0f172a]">0</p>
            <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">Publicações</p>
         </div>
         <div className="bg-white p-6 rounded-xl shadow border border-slate-100 text-center">
            <p className="text-2xl font-serif text-[#0f172a]">0</p>
            <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">Debates</p>
         </div>
         <div className="bg-white p-6 rounded-xl shadow border border-slate-100 text-center">
            <p className="text-2xl font-serif text-[#0f172a]">1</p>
            <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">Eventos</p>
         </div>
      </div>
    </div>
  );
};

export default Profile;
