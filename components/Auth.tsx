
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
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setError('Credenciais inválidas: ' + error.message);
      else navigate('/');
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            username: username,
          }
        }
      });
      if (error) setError('Erro ao cadastrar: ' + error.message);
      else {
        alert('Cadastro realizado! Verifique seu e-mail (se configurado) ou tente logar.');
        setIsLogin(true);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#d4af37]/20">
        <div className="bg-[#0f172a] p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 font-serif text-8xl">S</div>
          <h2 className="text-3xl font-serif text-white mb-2">{isLogin ? 'Bem-vindo de Volta' : 'Junte-se ao Grupo'}</h2>
          <p className="text-[#d4af37] text-sm italic">Portal Spinoza - Grupo de Estudos</p>
        </div>
        
        <form onSubmit={handleAction} className="p-10 space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-600 text-xs rounded border border-red-100">{error}</div>}
          
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
            className="w-full bg-[#0f172a] text-[#d4af37] py-4 rounded-xl font-bold text-lg hover:scale-[1.02] transition shadow-xl disabled:opacity-50"
          >
            {loading ? 'Processando...' : (isLogin ? 'Entrar no Portal' : 'Criar minha Conta')}
          </button>

          <div className="text-center pt-4">
            <button 
              type="button"
              onClick={() => setIsLogin(!isLogin)}
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
