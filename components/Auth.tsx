import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const translateError = (msg: string) => {
    if (msg.includes('Invalid login credentials')) return 'E-mail ou senha incorretos. Verifique os dados e tente novamente.';
    if (msg.includes('Email not confirmed')) return 'Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada ou spam.';
    if (msg.includes('User already registered')) return 'Este e-mail já está cadastrado no portal.';
    if (msg.includes('security purposes')) return 'Limite de segurança atingido. Aguarde 60 segundos antes de tentar novamente.';
    if (msg.includes('Password should be at least 6 characters')) return 'A senha deve ter pelo menos 6 caracteres.';
    return msg;
  };

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user && !data.session) {
          setInfo('E-mail ainda não confirmado. Verifique sua caixa de entrada.');
          setLoading(false);
          return;
        }
        navigate('/');
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName, username } }
        });
        if (error) throw error;
        if (data.user) {
          setInfo('Cadastro realizado! Verifique seu e-mail para ativar a conta.');
          setIsLogin(true);
          setPassword('');
        }
      }
    } catch (err: any) {
      setError(translateError(err.message || 'Ocorreu um erro inesperado.'));
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] outline-none transition bg-slate-50 focus:bg-white";

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 bg-slate-50 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="bg-[#0f172a] p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="font-serif text-[200px] text-white leading-none select-none absolute -top-10 -right-8">S</div>
          </div>
          <div className="w-16 h-16 bg-[#d4af37] rounded-full flex items-center justify-center text-[#0f172a] font-serif font-bold text-3xl mx-auto mb-4 shadow-xl">
            S
          </div>
          <h2 className="text-3xl font-serif text-white mb-1">
            {isLogin ? 'Bem-vindo de Volta' : 'Junte-se ao Grupo'}
          </h2>
          <p className="text-[#d4af37]/80 text-sm italic">Portal Spinoza — Grupo de Estudos</p>
        </div>

        <form onSubmit={handleAction} className="p-10 space-y-4">
          {error && (
            <div className="p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 flex items-start gap-2.5">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
              <span>{error}</span>
            </div>
          )}

          {info && (
            <div className="p-4 bg-blue-50 text-blue-700 text-sm rounded-xl border border-blue-100 flex items-start gap-2.5">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/></svg>
              <span>{info}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">E-mail</label>
            <input
              required
              type="email"
              className={inputClass}
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          {!isLogin && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nome Completo</label>
                <input
                  required
                  className={inputClass}
                  placeholder="Ex: João da Silva"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Usuário</label>
                <input
                  required
                  className={inputClass}
                  placeholder="Seu @ de usuário"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Senha</label>
            <input
              required
              type="password"
              className={inputClass}
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button
            disabled={loading}
            className="w-full bg-[#0f172a] text-[#d4af37] py-4 rounded-xl font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
                Processando...
              </span>
            ) : isLogin ? 'Entrar no Portal' : 'Criar minha Conta'}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(''); setInfo(''); }}
              className="text-sm text-slate-500 hover:text-[#0f172a] hover:underline transition-colors"
            >
              {isLogin ? 'Não tem uma conta? Cadastre-se gratuitamente' : 'Já possui conta? Faça login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;
