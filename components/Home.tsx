
import React from 'react';
import { Link } from 'react-router-dom';
import { UserProfile } from '../types';

interface HomeProps {
  members: UserProfile[];
}

const Home: React.FC<HomeProps> = ({ members }) => {
  // Encontrar o Prof. Divino ou usar dados padrão se não logado/carregado
  const divinoProfile = members.find(m => m.full_name.includes("Divino Ribeiro Viana"));
  const divinoLattes = divinoProfile?.lattes_url || "http://lattes.cnpq.br/7639474934278364";

  // Membros com currículo cadastrado
  const membersWithCV = members.filter(m => m.lattes_url);

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden bg-[#0f172a]">
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Spinoza.jpg/330px-Spinoza.jpg" 
          alt="Baruch Spinoza"
          className="absolute opacity-20 object-cover w-full h-full grayscale"
        />
        <div className="relative z-10 text-center max-w-4xl px-4">
          <h1 className="font-serif text-5xl md:text-7xl text-white mb-6 leading-tight">
            "Deus sive Natura"
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 font-light mb-8 italic">
            Acompanhe o pensamento de Baruch Spinoza em um ambiente de diálogo acadêmico e livre.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth" className="w-full sm:w-auto px-8 py-4 bg-[#d4af37] text-[#0f172a] font-bold rounded-lg text-lg shadow-xl hover:scale-105 transition">
              Participar do Grupo
            </Link>
            <Link to="/publicacoes" className="w-full sm:w-auto px-8 py-4 border border-white/30 text-white font-bold rounded-lg text-lg hover:bg-white/10 transition">
              Ver Publicações
            </Link>
          </div>
        </div>
      </section>

      {/* Intro Info */}
      <section className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-start">
        <div className="space-y-6">
          <h2 className="font-serif text-4xl text-slate-800">Um Espaço Aberto para Todos</h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            O <strong>Grupo de Estudos Spinoza</strong>, liderado pelo Prof. Me. Divino Ribeiro Viana, é um espaço democrático de investigação filosófica. 
            Acreditamos que o pensamento de Spinoza é vital para compreendermos a ética, a política e a natureza no século XXI.
          </p>
          <p className="text-lg text-slate-600 leading-relaxed font-semibold border-l-4 border-[#d4af37] pl-4">
            Este grupo é aberto a todos os interessados(as), independente de sua área de atuação ou formação acadêmica. 
            A filosofia spinozana nos ensina que a potência de agir e pensar é um esforço comum.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row sm:items-center gap-6">
            <a href={divinoLattes} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline flex items-center gap-2 font-medium">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
              Currículo - Prof. Me. Divino Ribeiro Viana
            </a>
            <a href="https://www.youtube.com/channel/UCTJEBpIkx-ghf5N9TuAsG8g" target="_blank" rel="noopener noreferrer" className="text-red-700 hover:underline flex items-center gap-2 font-medium">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 4-8 4z"/></svg>
              Entre no canal do Grupo no YouTube
            </a>
          </div>

          {/* Currículos dos Membros */}
          <div className="mt-12 bg-slate-50 p-8 rounded-2xl border border-slate-100 shadow-inner">
            <h3 className="font-serif text-2xl text-slate-800 mb-6 flex items-center gap-3">
              <span className="w-2 h-8 bg-[#d4af37] rounded"></span>
              Currículos Lattes dos Pesquisadores
            </h3>
            <div className="grid gap-4">
              {membersWithCV.length > 0 ? membersWithCV.map((member) => (
                <a 
                  key={member.id} 
                  href={member.lattes_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white p-4 rounded-lg border border-slate-200 flex items-center justify-between hover:border-[#d4af37] hover:shadow-md transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#0f172a] text-[#d4af37] flex items-center justify-center text-xs font-bold">
                      {member.full_name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 group-hover:text-[#0f172a]">{member.full_name}</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest">{member.academic_info || 'Membro do Grupo'}</p>
                    </div>
                  </div>
                  <span className="text-xs text-[#d4af37] font-bold group-hover:underline">Ver Lattes &rarr;</span>
                </a>
              )) : (
                <p className="text-sm text-slate-400 italic text-center py-4">Nenhum currículo de membro cadastrado ainda.</p>
              )}
            </div>
            <p className="mt-6 text-xs text-slate-500 italic">
              * Membros podem adicionar seu link Lattes na página de Perfil para aparecer nesta lista.
            </p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 sticky top-24">
          <h3 className="font-serif text-2xl text-slate-800 mb-6 flex items-center gap-3">
            <span className="w-2 h-8 bg-[#d4af37] rounded"></span>
            Membros Ativos
          </h3>
          <div className="flex flex-wrap gap-3">
            {members.map((member, i) => (
              <span key={i} className="px-4 py-2 bg-slate-50 text-slate-700 rounded-full border border-slate-200 text-sm font-medium hover:bg-[#d4af37]/10 transition cursor-default">
                {member.full_name}
              </span>
            ))}
            <span className="px-4 py-2 bg-[#d4af37] text-[#0f172a] rounded-full text-sm font-bold animate-pulse">
              + Você
            </span>
          </div>
          <p className="mt-6 text-sm text-slate-500 italic">
            O cadastro é gratuito e dá acesso a fóruns, publicações exclusivas e certificados de participação.
          </p>
        </div>
      </section>

      {/* Pillars Section */}
      <section className="bg-slate-100 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl text-slate-800 mb-4">Nossos Pilares</h2>
            <div className="w-24 h-1 bg-[#d4af37] mx-auto"></div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-10 rounded-xl shadow-lg hover:-translate-y-2 transition duration-300">
              <div className="w-16 h-16 bg-[#0f172a] text-[#d4af37] rounded-lg flex items-center justify-center mb-6 text-3xl">📚</div>
              <h3 className="font-serif text-2xl mb-4">Pesquisa</h3>
              <p className="text-slate-600">Produção acadêmica rigorosa, artigos e dissertações compartilhadas para fomentar o saber.</p>
            </div>
            <div className="bg-white p-10 rounded-xl shadow-lg hover:-translate-y-2 transition duration-300">
              <div className="w-16 h-16 bg-[#0f172a] text-[#d4af37] rounded-lg flex items-center justify-center mb-6 text-3xl">🤝</div>
              <h3 className="font-serif text-2xl mb-4">Debate</h3>
              <p className="text-slate-600">Encontros síncronos e fóruns temáticos organizados para o intercâmbio de ideias.</p>
            </div>
            <div className="bg-white p-10 rounded-xl shadow-lg hover:-translate-y-2 transition duration-300">
              <div className="w-16 h-16 bg-[#0f172a] text-[#d4af37] rounded-lg flex items-center justify-center mb-6 text-3xl">🤖</div>
              <h3 className="font-serif text-2xl mb-4">IA Assistida</h3>
              <p className="text-slate-600">Uso do Gemini 3 para auxílio em revisões bibliográficas e conceitos fundamentais.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Contact Section */}
      <section className="max-w-3xl mx-auto px-4 text-center">
        <h2 className="font-serif text-3xl mb-8">Fale Conosco</h2>
        <form className="space-y-4 bg-white p-8 rounded-xl shadow-lg border border-slate-200">
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <input type="text" placeholder="Seu Nome" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#d4af37] outline-none" />
             <input type="email" placeholder="Seu E-mail" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#d4af37] outline-none" />
           </div>
           <textarea rows={4} placeholder="Sua mensagem ou dúvida sobre os estudos" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#d4af37] outline-none"></textarea>
           <button type="submit" className="w-full bg-[#0f172a] text-white py-4 rounded-lg font-bold hover:bg-slate-800 transition">Enviar para grupodeestudosspinoza@gmail.com</button>
        </form>
      </section>
    </div>
  );
};

export default Home;
