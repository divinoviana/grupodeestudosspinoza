
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
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        if (data.user && !data.session) {
          setInfo('Cadastro identificado, mas o e-mail ainda não foi confirmado. Por favor, verifique seu e-mail.');
          setLoading(false);
          return;
        }
        
        navigate('/');
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              username: username,
            }
          }
        });
        
        if (error) throw error;

        if (data.user) {
          setInfo('Cadastro realizado! Se você não desativou a confirmação de e-mail no Supabase, verifique sua caixa de entrada para ativar a conta.');
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

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#d4af37]/20">
        <div className="bg-[#0f172a] p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 font-serif text-8xl text-white">S</div>
          <h2 className="text-3xl font-serif text-white mb-2">{isLogin ? 'Bem-vindo de Volta' : 'Junte-se ao Grupo'}</h2>
          <p className="text-[#d4af37] text-sm italic">Portal Spinoza - Grupo de Estudos</p>
        </div>
        
        <form onSubmit={handleAction} className="p-10 space-y-4">
          {error && (
            <div className="p-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 flex items-start gap-2">
              <span className="mt-0.5">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {info && (
            <div className="p-4 bg-blue-50 text-blue-700 text-sm rounded-lg border border-blue-100 flex items-start gap-2">
              <span className="mt-0.5">ℹ️</span>
              <span>{info}</span>
            </div>
          )}
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">E-mail</label>
            <input 
              required
              type="email"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#d4af37] outline-none transition" 
              placeholder="seu@email.com" 
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          {!isLogin && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Nome Completo</label>
                <input 
                  required
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#d4af37] outline-none transition" 
                  placeholder="Ex: João da Silva" 
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Usuário</label>
                <input 
                  required
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#d4af37] outline-none transition" 
                  placeholder="Seu @ de usuário" 
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Senha</label>
            <input 
              required
              type="password" 
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#d4af37] outline-none transition" 
              placeholder="••••••••" 
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button 
            disabled={loading}
            className="w-full bg-[#0f172a] text-[#d4af37] py-4 rounded-xl font-bold text-lg hover:scale-[1.02] active:scale-95 transition shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processando...' : (isLogin ? 'Entrar no Portal' : 'Criar minha Conta')}
          </button>

          <div className="text-center pt-4">
            <button 
              type="button"
              onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setInfo('');
              }}
              className="text-sm text-slate-500 hover:text-[#0f172a] hover:underline"
            >
              {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já possui conta? Faça login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;
