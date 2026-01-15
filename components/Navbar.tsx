
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserProfile } from '../types';

interface NavbarProps {
  user: UserProfile | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const location = useLocation();

  const navLinks = [
    { path: '/', label: 'Início' },
    { path: '/publicacoes', label: 'Publicações' },
    { path: '/forum', label: 'Fórum' },
    { path: '/eventos', label: 'Eventos' },
    { path: '/galeria', label: 'Galeria' },
  ];

  return (
    <nav className="fixed top-0 w-full bg-[#0f172a] text-white z-50 border-b border-[#b4941f]/30 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 bg-[#d4af37] rounded-full flex items-center justify-center text-[#0f172a] font-serif font-bold text-xl shadow-inner group-hover:scale-110 transition-transform">
            S
          </div>
          <span className="font-serif text-xl md:text-2xl tracking-tight hidden sm:inline">Portal Spinoza</span>
        </Link>

        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map(link => (
            <Link 
              key={link.path}
              to={link.path}
              className={`text-sm font-medium tracking-wide transition-colors hover:text-[#d4af37] ${location.pathname === link.path ? 'text-[#d4af37]' : 'text-gray-300'}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-4">
              <Link to="/perfil" className="text-sm hover:text-[#d4af37] flex items-center gap-2">
                <span className="hidden sm:inline">Olá, {user.username}</span>
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs border border-[#d4af37]">
                  {user.username[0].toUpperCase()}
                </div>
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="text-xs bg-[#d4af37] text-[#0f172a] px-3 py-1 rounded font-bold uppercase">Admin</Link>
              )}
              <button onClick={onLogout} className="text-xs text-gray-400 hover:text-white underline">Sair</button>
            </div>
          ) : (
            <Link to="/auth" className="bg-[#d4af37] text-[#0f172a] px-6 py-2 rounded-full font-bold hover:bg-[#c49f27] transition shadow-md">
              Acessar
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
