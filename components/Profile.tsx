import React, { useEffect, useRef, useState } from 'react';
import { UserProfile } from '../types';
import { supabase } from '../supabaseClient';
import Avatar from './Avatar';

interface ProfileProps {
  user: UserProfile;
  onUpdate: (user: UserProfile) => Promise<string | null>;
}

type Tab = 'dados' | 'seguranca';

const MAX_PHOTO_MB = 3;

const inputClass =
  'w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] focus:bg-white transition';

const Notice: React.FC<{ kind: 'ok' | 'erro'; text: string }> = ({ kind, text }) => (
  <p className={`text-sm font-medium rounded-lg px-4 py-2.5 ${
    kind === 'ok' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'
  }`}>
    {text}
  </p>
);

const Profile: React.FC<ProfileProps> = ({ user, onUpdate }) => {
  const [tab, setTab] = useState<Tab>('dados');
  const [formData, setFormData] = useState({ ...user });
  const [saving, setSaving] = useState(false);
  const [dataMsg, setDataMsg] = useState<{ kind: 'ok' | 'erro'; text: string } | null>(null);

  const [uploading, setUploading] = useState(false);
  const [photoMsg, setPhotoMsg] = useState<{ kind: 'ok' | 'erro'; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [changingPw, setChangingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ kind: 'ok' | 'erro'; text: string } | null>(null);

  const [stats, setStats] = useState({ publications: 0, topics: 0, agora: 0 });

  useEffect(() => {
    setFormData({ ...user });
  }, [user]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email || ''));

    const count = (table: string, column: string) =>
      supabase.from(table).select('id', { count: 'exact', head: true }).eq(column, user.id)
        .then(({ count: c }) => c || 0);

    Promise.all([
      count('publications', 'author_id'),
      count('forum_topics', 'author_id'),
      count('agora_posts', 'author_id'),
    ]).then(([publications, topics, agora]) => setStats({ publications, topics, agora }));
  }, [user.id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name.trim() || !formData.username.trim()) {
      setDataMsg({ kind: 'erro', text: 'Nome completo e nome de usuário são obrigatórios.' });
      return;
    }
    setSaving(true);
    setDataMsg(null);
    const error = await onUpdate({
      ...formData,
      full_name: formData.full_name.trim(),
      username: formData.username.trim(),
    });
    setDataMsg(error
      ? { kind: 'erro', text: 'Não foi possível salvar. Tente novamente.' }
      : { kind: 'ok', text: 'Perfil salvo com sucesso!' });
    setSaving(false);
  };

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setPhotoMsg(null);

    if (!file.type.startsWith('image/')) {
      setPhotoMsg({ kind: 'erro', text: 'Escolha um arquivo de imagem (JPG, PNG ou WebP).' });
      return;
    }
    if (file.size > MAX_PHOTO_MB * 1024 * 1024) {
      setPhotoMsg({ kind: 'erro', text: `A foto deve ter no máximo ${MAX_PHOTO_MB} MB.` });
      return;
    }

    setUploading(true);
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from('avatars')
      .upload(path, file, { cacheControl: '3600', contentType: file.type });

    if (upErr) {
      setPhotoMsg({ kind: 'erro', text: 'Falha ao enviar a foto. Tente novamente.' });
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
    const error = await onUpdate({ ...user, avatar_url: publicUrl });

    if (error) {
      await supabase.storage.from('avatars').remove([path]);
      setPhotoMsg({ kind: 'erro', text: 'A foto foi enviada, mas não foi possível salvá-la no perfil.' });
    } else {
      const old = user.avatar_url?.split('/avatars/')[1];
      if (old) await supabase.storage.from('avatars').remove([old]);
      setPhotoMsg({ kind: 'ok', text: 'Foto atualizada!' });
    }
    setUploading(false);
  };

  const handleRemovePhoto = async () => {
    if (!user.avatar_url) return;
    setUploading(true);
    setPhotoMsg(null);
    const old = user.avatar_url.split('/avatars/')[1];
    const error = await onUpdate({ ...user, avatar_url: '' });
    if (!error && old) await supabase.storage.from('avatars').remove([old]);
    setPhotoMsg(error
      ? { kind: 'erro', text: 'Não foi possível remover a foto.' }
      : { kind: 'ok', text: 'Foto removida.' });
    setUploading(false);
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(null);
    if (password.length < 6) {
      setPwMsg({ kind: 'erro', text: 'A nova senha deve ter pelo menos 6 caracteres.' });
      return;
    }
    if (password !== confirm) {
      setPwMsg({ kind: 'erro', text: 'As senhas não coincidem.' });
      return;
    }
    setChangingPw(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      const sameAsOld = /different from the old/i.test(error.message);
      setPwMsg({ kind: 'erro', text: sameAsOld
        ? 'A nova senha precisa ser diferente da atual.'
        : 'Não foi possível alterar a senha. Saia e entre novamente na sua conta e tente de novo.' });
    } else {
      setPassword('');
      setConfirm('');
      setPwMsg({ kind: 'ok', text: 'Senha alterada com sucesso!' });
    }
    setChangingPw(false);
  };

  const tabClass = (t: Tab) =>
    `px-5 py-3 text-sm font-bold border-b-2 transition ${
      tab === t ? 'border-[#d4af37] text-[#0f172a]' : 'border-transparent text-slate-400 hover:text-slate-600'
    }`;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        {/* Capa + foto */}
        <div className="h-40 bg-gradient-to-r from-[#0f172a] to-slate-800 relative">
          <div className="absolute -bottom-14 left-8">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="relative w-28 h-28 rounded-full bg-white p-1 shadow-xl group focus:outline-none focus:ring-4 focus:ring-[#d4af37]/50"
              title="Alterar foto de perfil"
            >
              <div className="w-full h-full rounded-full border-4 border-[#d4af37] overflow-hidden">
                <Avatar name={user.full_name || user.username} url={user.avatar_url} className="w-full h-full text-4xl font-serif" />
              </div>
              <span className="absolute inset-1 rounded-full bg-black/50 text-white text-xs font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                {uploading ? 'Enviando...' : 'Trocar foto'}
              </span>
              {uploading && (
                <span className="absolute inset-1 rounded-full bg-black/40 flex items-center justify-center">
                  <span className="w-7 h-7 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </span>
              )}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          </div>
        </div>

        <div className="pt-16 px-8 pb-2 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-serif text-slate-900">{user.full_name}</h1>
            <p className="text-slate-400 text-sm">@{user.username}{email && ` · ${email}`}</p>
            <p className="text-[#d4af37] font-bold uppercase text-xs tracking-widest mt-1">
              {user.role === 'admin' ? 'Administrador' : 'Membro'}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="text-xs font-bold px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:border-[#d4af37] hover:text-[#0f172a] transition disabled:opacity-50"
            >
              {user.avatar_url ? 'Trocar foto' : 'Adicionar foto'}
            </button>
            {user.avatar_url && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                disabled={uploading}
                className="text-xs font-bold px-4 py-2 rounded-lg border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 transition disabled:opacity-50"
              >
                Remover
              </button>
            )}
          </div>
        </div>
        {photoMsg && <div className="px-8 pt-3"><Notice {...photoMsg} /></div>}

        {/* Abas */}
        <div className="px-8 mt-6 border-b border-slate-100 flex">
          <button type="button" className={tabClass('dados')} onClick={() => setTab('dados')}>Meus dados</button>
          <button type="button" className={tabClass('seguranca')} onClick={() => setTab('seguranca')}>Senha e segurança</button>
        </div>

        {tab === 'dados' ? (
          <form onSubmit={handleSave} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">Nome de Usuário</label>
                <input
                  className={inputClass}
                  value={formData.username}
                  onChange={e => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">Nome Completo</label>
                <input
                  className={inputClass}
                  value={formData.full_name}
                  onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600">Link do Currículo Lattes</label>
              <input
                className={inputClass}
                placeholder="Ex: http://lattes.cnpq.br/..."
                value={formData.lattes_url || ''}
                onChange={e => setFormData({ ...formData, lattes_url: e.target.value })}
              />
              <p className="text-[11px] text-slate-400 italic">Ao adicionar o link, seu currículo aparecerá na página inicial junto com os outros membros do grupo.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600">Biografia</label>
              <textarea
                rows={4}
                className={inputClass}
                placeholder="Fale um pouco sobre seu interesse em Espinosa..."
                value={formData.bio || ''}
                onChange={e => setFormData({ ...formData, bio: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600">Informações Acadêmicas (Instituição, Grau, etc.)</label>
              <textarea
                rows={3}
                className={inputClass}
                placeholder="Ex: Mestrando em Filosofia pela UFT..."
                value={formData.academic_info || ''}
                onChange={e => setFormData({ ...formData, academic_info: e.target.value })}
              />
            </div>

            {dataMsg && <Notice {...dataMsg} />}

            <div className="pt-6 border-t flex justify-end">
              <button
                disabled={saving}
                className="bg-[#0f172a] text-[#d4af37] px-10 py-3 rounded-lg font-bold shadow-lg hover:scale-105 transition active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
              >
                {saving ? 'Salvando...' : 'Salvar Perfil'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handlePassword} className="p-8 space-y-6 max-w-md">
            <div>
              <h2 className="font-serif text-xl text-slate-800">Alterar senha</h2>
              <p className="text-sm text-slate-400 mt-1">Use pelo menos 6 caracteres. Você continuará conectado depois da troca.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600">Nova senha</label>
              <input
                type="password"
                autoComplete="new-password"
                className={inputClass}
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600">Confirme a nova senha</label>
              <input
                type="password"
                autoComplete="new-password"
                className={inputClass}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
              />
            </div>

            {pwMsg && <Notice {...pwMsg} />}

            <button
              disabled={changingPw || !password || !confirm}
              className="bg-[#0f172a] text-[#d4af37] px-8 py-3 rounded-lg font-bold shadow-lg hover:brightness-125 transition disabled:opacity-50"
            >
              {changingPw ? 'Alterando...' : 'Alterar senha'}
            </button>
          </form>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Publicações', value: stats.publications },
          { label: 'Tópicos no Fórum', value: stats.topics },
          { label: 'Pensamentos na Ágora', value: stats.agora },
        ].map(s => (
          <div key={s.label} className="bg-white p-6 rounded-xl shadow border border-slate-100 text-center">
            <p className="text-2xl font-serif text-[#0f172a]">{s.value}</p>
            <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Profile;
