import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserProfile } from '../types';
import { supabase } from '../supabaseClient';

interface HomeProps {
  members: UserProfile[];
}

const Home: React.FC<HomeProps> = ({ members }) => {
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const divinoProfile = members.find(m => m.full_name.includes("Divino Ribeiro Viana"));
  const divinoLattes = divinoProfile?.lattes_url || "http://lattes.cnpq.br/7639474934278364";
  const membersWithCV = members.filter(m => m.lattes_url);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      const { error } = await supabase.from('contact_messages').insert([{
        name: contactName,
        email: contactEmail,
        message: contactMessage,
        is_read: false
      }]);
      if (error) throw error;
      setIsSent(true);
      setContactName('');
      setContactEmail('');
      setContactMessage('');
      setTimeout(() => setIsSent(false), 5000);
    } catch (err) {
      alert("Erro ao enviar mensagem. Tente novamente mais tarde.");
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const pillars = [
    {
      icon: '📚',
      title: 'Pesquisa Acadêmica',
      desc: 'Produção e partilha de artigos, dissertações e textos sobre a filosofia de Spinoza.',
    },
    {
      icon: '💬',
      title: 'Fórum de Debates',
      desc: 'Espaço aberto para discussão de ideias, textos e interpretações do pensamento spinozano.',
    },
    {
      icon: '🎓',
      title: 'Seminários e Congressos',
      desc: 'Encontros periódicos, simpósios e eventos acadêmicos com transmissão ao vivo.',
    },
    {
      icon: '🎬',
      title: 'Aulas Gravadas',
      desc: 'Registro em vídeo de todas as aulas e encontros, disponíveis no canal do YouTube.',
    },
    {
      icon: '🤖',
      title: 'IA Assistida',
      desc: 'Assistente inteligente especializado em Spinoza para auxílio em pesquisas e revisões.',
    },
    {
      icon: '🌐',
      title: 'Rede de Pesquisadores',
      desc: 'Integração entre pesquisadores de todo o Brasil interessados no pensamento de Spinoza.',
    },
  ];

  return (
    <div className="space-y-0 pb-20">

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#0f172a]">
        <div className="absolute inset-0">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Spinoza.jpg/330px-Spinoza.jpg"
            alt="Baruch Spinoza"
            className="absolute opacity-15 object-cover w-full h-full grayscale scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a]/40 via-[#0f172a]/60 to-[#0f172a]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a] via-transparent to-[#0f172a]" />
        </div>

        <div className="relative z-10 text-center max-w-5xl px-6">
          <p className="text-[#d4af37] text-xs uppercase tracking-[0.4em] mb-6 font-medium">
            Grupo de Estudos — Bento Espinosa
          </p>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white mb-6 leading-[1.1]">
            "Deus sive Natura"
          </h1>
          <div className="w-24 h-0.5 bg-[#d4af37] mx-auto mb-8" />
          <p className="text-xl md:text-2xl text-gray-300 font-light mb-10 italic leading-relaxed max-w-3xl mx-auto">
            Um espaço democrático de investigação filosófica dedicado ao pensamento de Baruch Spinoza — filósofo do século XVII cujas ideias permanecem vivas e necessárias.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/auth"
              className="w-full sm:w-auto px-10 py-4 bg-[#d4af37] text-[#0f172a] font-bold rounded-full text-lg shadow-2xl hover:bg-[#c49f27] hover:scale-105 transition-all duration-200"
            >
              Participar do Grupo
            </Link>
            <Link
              to="/publicacoes"
              className="w-full sm:w-auto px-10 py-4 border border-white/25 text-white font-semibold rounded-full text-lg hover:bg-white/10 hover:border-white/50 transition-all duration-200"
            >
              Ver Publicações
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
          <div className="w-0.5 h-12 bg-[#d4af37] animate-pulse" />
          <span className="text-[10px] text-[#d4af37] uppercase tracking-widest">Descer</span>
        </div>
      </section>

      {/* Spinoza Quote Banner */}
      <section className="bg-gradient-to-r from-[#0f172a] via-slate-900 to-[#0f172a] py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <svg className="w-10 h-10 text-[#d4af37]/40 mx-auto mb-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
          </svg>
          <blockquote className="font-serif text-2xl md:text-3xl text-white leading-relaxed italic">
            A felicidade não é o prêmio da virtude, mas é a própria virtude; e não nos alegramos com ela porque refreamos nossos apetites; ao contrário, porque nos alegramos, podemos refrear nossos apetites.
          </blockquote>
          <p className="mt-6 text-[#d4af37] text-sm uppercase tracking-[0.3em] font-medium">
            — Baruch Spinoza · Ética, Parte V, Prop. XLII
          </p>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-16 items-start">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-[#d4af37]/10 text-[#b4941f] px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
              Sobre o Grupo
            </div>
            <h2 className="font-serif text-4xl md:text-5xl text-slate-800 leading-tight">
              Um Espaço Aberto<br />para Todos
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              O <strong>Grupo de Estudos Spinoza</strong>, coordenado pelo Prof. Me. Divino Ribeiro Viana,
              é um espaço democrático de investigação filosófica. Acreditamos que o pensamento de Spinoza
              é vital para compreendermos a ética, a política e a natureza no século XXI.
            </p>
            <div className="border-l-4 border-[#d4af37] pl-6 py-2">
              <p className="text-lg text-slate-700 font-medium leading-relaxed italic">
                Este grupo é aberto a todos os interessados, independente de área de atuação ou formação acadêmica.
                A filosofia spinozana ensina que a potência de agir e pensar é um esforço comum.
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-4">
              <a
                href={divinoLattes}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-medium hover:underline transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
                Currículo Lattes — Prof. Me. Divino Ribeiro Viana
              </a>
              <a
                href="https://www.youtube.com/channel/UCTJEBpIkx-ghf5N9TuAsG8g"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-red-700 hover:text-red-900 font-medium hover:underline transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 4-8 4z"/></svg>
                Canal do Grupo no YouTube
              </a>
            </div>
          </div>

          <div className="space-y-6">
            {/* Members with CV */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
              <h3 className="font-serif text-2xl text-slate-800 mb-6 flex items-center gap-3">
                <span className="w-1.5 h-8 bg-[#d4af37] rounded-full" />
                Pesquisadores do Grupo
              </h3>
              <div className="grid gap-3">
                {membersWithCV.length > 0 ? membersWithCV.map((member) => (
                  <a
                    key={member.id}
                    href={member.lattes_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between hover:border-[#d4af37] hover:bg-[#d4af37]/5 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#0f172a] text-[#d4af37] flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {member.full_name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{member.full_name}</p>
                        <p className="text-[11px] text-slate-400 uppercase tracking-wider mt-0.5">{member.academic_info || 'Membro do Grupo'}</p>
                      </div>
                    </div>
                    <span className="text-xs text-[#d4af37] font-bold group-hover:underline shrink-0 ml-2">Lattes →</span>
                  </a>
                )) : (
                  <p className="text-sm text-slate-400 italic text-center py-6">
                    Nenhum currículo cadastrado ainda. Membros podem adicionar seu Lattes no perfil.
                  </p>
                )}
              </div>
            </div>

            {/* Active members */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
              <h3 className="font-serif text-2xl text-slate-800 mb-6 flex items-center gap-3">
                <span className="w-1.5 h-8 bg-[#d4af37] rounded-full" />
                Membros Ativos
              </h3>
              <div className="flex flex-wrap gap-2">
                {members.map((member, i) => (
                  <span
                    key={i}
                    className="px-4 py-1.5 bg-slate-50 text-slate-700 rounded-full border border-slate-200 text-sm font-medium hover:bg-[#d4af37]/10 hover:border-[#d4af37]/50 transition cursor-default"
                  >
                    {member.full_name}
                  </span>
                ))}
                <span className="px-4 py-1.5 bg-[#d4af37] text-[#0f172a] rounded-full text-sm font-bold animate-pulse">
                  + Você
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars Section */}
      <section className="bg-[#0f172a] py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[#d4af37]/10 text-[#d4af37] px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
              O que fazemos
            </div>
            <h2 className="font-serif text-4xl md:text-5xl text-white mb-4">Nossos Pilares</h2>
            <div className="w-24 h-0.5 bg-[#d4af37] mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pillars.map((p, i) => (
              <div
                key={i}
                className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:bg-white/10 hover:border-[#d4af37]/30 hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="w-14 h-14 bg-[#d4af37]/10 text-[#d4af37] rounded-xl flex items-center justify-center mb-6 text-2xl group-hover:bg-[#d4af37]/20 transition">
                  {p.icon}
                </div>
                <h3 className="font-serif text-xl text-white mb-3">{p.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* YouTube Section */}
      <section className="bg-slate-100 py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 4-8 4z"/></svg>
                Canal no YouTube
              </div>
              <h2 className="font-serif text-4xl md:text-5xl text-slate-800 leading-tight">
                Aulas e Encontros<br />Gravados
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                Todos os nossos encontros, seminários e aulas são gravados e disponibilizados gratuitamente no canal do YouTube do grupo. Assista quando e onde quiser.
              </p>
              <ul className="space-y-3 text-slate-600">
                <li className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#d4af37] flex items-center justify-center text-[#0f172a] text-xs font-bold flex-shrink-0">✓</span>
                  Aulas introdutórias sobre a Ética de Spinoza
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#d4af37] flex items-center justify-center text-[#0f172a] text-xs font-bold flex-shrink-0">✓</span>
                  Debates e simpósios com convidados especiais
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#d4af37] flex items-center justify-center text-[#0f172a] text-xs font-bold flex-shrink-0">✓</span>
                  Leituras comentadas dos textos spinozanos
                </li>
              </ul>
              <a
                href="https://www.youtube.com/channel/UCTJEBpIkx-ghf5N9TuAsG8g"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-red-600 text-white px-8 py-4 rounded-full font-bold hover:bg-red-700 transition shadow-lg hover:scale-105"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 4-8 4z"/></svg>
                Acessar o Canal
              </a>
            </div>
            <div className="relative">
              <div className="aspect-video bg-[#0f172a] rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex items-center justify-center group cursor-pointer">
                <div className="text-center p-8">
                  <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition shadow-2xl">
                    <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                  <p className="font-serif text-2xl text-white mb-2">Canal do Grupo</p>
                  <p className="text-slate-400 text-sm">Grupo de Estudos Spinoza no YouTube</p>
                  <a
                    href="https://www.youtube.com/channel/UCTJEBpIkx-ghf5N9TuAsG8g"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-6 text-[#d4af37] text-sm font-bold hover:underline"
                  >
                    Abrir no YouTube →
                  </a>
                </div>
              </div>
              {/* decorative */}
              <div className="absolute -bottom-4 -right-4 w-full h-full bg-[#d4af37]/10 rounded-2xl -z-10 border border-[#d4af37]/20" />
            </div>
          </div>
        </div>
      </section>

      {/* How to Participate */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-4xl text-slate-800 mb-4">Como Participar</h2>
          <div className="w-24 h-0.5 bg-[#d4af37] mx-auto mb-12" />
          <div className="grid md:grid-cols-3 gap-8 text-left mb-12">
            {[
              { num: '01', title: 'Crie sua conta', desc: 'Cadastre-se gratuitamente no portal com seu e-mail e dados acadêmicos.' },
              { num: '02', title: 'Participe dos debates', desc: 'Acesse o fórum, publique reflexões e interaja com outros pesquisadores.' },
              { num: '03', title: 'Venha aos encontros', desc: 'Confirme presença nos eventos e receba o link de acesso para as reuniões.' },
            ].map(step => (
              <div key={step.num} className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:border-[#d4af37]/30 hover:shadow-lg transition-all">
                <p className="font-serif text-5xl text-[#d4af37]/30 mb-4 leading-none">{step.num}</p>
                <h3 className="font-serif text-xl text-slate-800 mb-3">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 bg-[#0f172a] text-[#d4af37] px-10 py-4 rounded-full font-bold text-lg shadow-xl hover:scale-105 transition"
          >
            Quero Participar
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
          </Link>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-slate-50 py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl text-slate-800 mb-4">Fale Conosco</h2>
            <p className="text-slate-500">Tem alguma dúvida ou deseja saber mais sobre o grupo? Envie uma mensagem.</p>
            <div className="w-24 h-0.5 bg-[#d4af37] mx-auto mt-6" />
          </div>
          <form onSubmit={handleContactSubmit} className="space-y-4 bg-white p-10 rounded-2xl shadow-xl border border-slate-100">
            {isSent && (
              <div className="p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 flex items-center gap-3 font-semibold">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                Mensagem enviada com sucesso! O Prof. Divino responderá em breve.
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Seu Nome</label>
                <input
                  required
                  type="text"
                  placeholder="Ex: Maria da Silva"
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] outline-none transition bg-slate-50 focus:bg-white"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  disabled={isSending}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Seu E-mail</label>
                <input
                  required
                  type="email"
                  placeholder="seu@email.com"
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] outline-none transition bg-slate-50 focus:bg-white"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  disabled={isSending}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mensagem</label>
              <textarea
                required
                rows={5}
                placeholder="Sua mensagem, dúvida ou interesse em participar do grupo..."
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#d4af37] focus:border-[#d4af37] outline-none transition bg-slate-50 focus:bg-white resize-none"
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                disabled={isSending}
              />
            </div>
            <button
              type="submit"
              disabled={isSending}
              className="w-full bg-[#0f172a] text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2 shadow-xl disabled:opacity-50 text-lg"
            >
              {isSending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
              )}
              Enviar Mensagem
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Home;
