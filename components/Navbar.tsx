import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserProfile } from '../types';

interface NavbarProps {
  user: UserProfile | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { path: '/', label: 'Início' },
    { path: '/publicacoes', label: 'Publicações' },
    { path: '/forum', label: 'Fórum' },
    { path: '/eventos', label: 'Eventos' },
    { path: '/galeria', label: 'Galeria' },
  ];

  return (
    <nav className={`fixed top-0 w-full bg-[#0f172a] text-white z-50 border-b border-[#b4941f]/30 transition-shadow duration-300 ${scrolled ? 'shadow-2xl' : 'shadow-lg'}`}>
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 bg-[#d4af37] rounded-full flex items-center justify-center text-[#0f172a] font-serif font-bold text-xl shadow-inner group-hover:scale-110 transition-transform">
            S
          </div>
          <div className="hidden sm:block">
            <span className="font-serif text-xl md:text-2xl tracking-tight">Portal Spinoza</span>
            <p className="text-[10px] text-[#d4af37]/60 tracking-widest uppercase leading-none mt-0.5">Grupo de Estudos</p>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center space-x-1">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-4 py-2 rounded-lg text-sm font-medium tracking-wide transition-all hover:text-[#d4af37] hover:bg-white/5 ${
                location.pathname === link.path
                  ? 'text-[#d4af37] bg-white/10'
                  : 'text-gray-300'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* Desktop auth */}
          {user ? (
            <div className="hidden md:flex items-center gap-3">
              <Link to="/perfil" className="flex items-center gap-2 group transition-colors">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs border border-[#d4af37] group-hover:bg-slate-600 transition">
                  {user.username[0].toUpperCase()}
                </div>
                <span className="hidden lg:inline text-sm text-gray-300 group-hover:text-[#d4af37] transition-colors">{user.username}</span>
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="text-xs bg-[#d4af37] text-[#0f172a] px-3 py-1 rounded font-bold uppercase hover:brightness-110 transition">Admin</Link>
              )}
              <button onClick={onLogout} className="text-xs text-gray-500 hover:text-red-400 transition">Sair</button>
            </div>
          ) : (
            <Link to="/auth" className="hidden md:block bg-[#d4af37] text-[#0f172a] px-5 py-2 rounded-full font-bold hover:bg-[#c49f27] transition shadow-md text-sm">
              Acessar
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-white/10 transition"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            <span className={`block w-5 h-0.5 bg-white transition-all duration-300 origin-center ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-5 h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'opacity-0 scale-x-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-white transition-all duration-300 origin-center ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden transition-all duration-300 overflow-hidden ${menuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="bg-[#080f1e] border-t border-[#b4941f]/20 px-4 py-4 space-y-1">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                location.pathname === link.path
                  ? 'bg-[#d4af37]/10 text-[#d4af37]'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}

          <div className="pt-3 mt-3 border-t border-white/10">
            {user ? (
              <div className="space-y-1">
                <Link
                  to="/perfil"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-gray-300 hover:bg-white/5 hover:text-white transition"
                >
                  <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs border border-[#d4af37]">
                    {user.username[0].toUpperCase()}
                  </div>
                  Meu Perfil — {user.username}
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm text-[#d4af37] hover:bg-[#d4af37]/10 transition">
                    Painel Admin
                  </Link>
                )}
                <button
                  onClick={() => { onLogout(); setMenuOpen(false); }}
                  className="w-full text-left px-4 py-3 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition"
                >
                  Sair
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="block mx-4 my-2 bg-[#d4af37] text-[#0f172a] py-3 rounded-full font-bold text-center hover:bg-[#c49f27] transition"
              >
                Acessar o Portal
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
