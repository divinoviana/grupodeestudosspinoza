
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserProfile } from '../types';
import Agora from './Agora';

const CHANNEL_ID = 'UCTJEBpIkx-ghf5N9TuAsG8g';

interface YTVideo {
  title: string;
  videoId: string;
  pubDate: string;
  thumbnail: string;
  link: string;
}

interface HomeProps {
  members: UserProfile[];
  user: UserProfile | null;
}

const Home: React.FC<HomeProps> = ({ members, user }) => {
  const [videos, setVideos] = useState<YTVideo[]>([]);
  const [videosLoading, setVideosLoading] = useState(true);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
    if (!apiKey) { setVideosLoading(false); return; }

    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&maxResults=6&order=date&type=video&key=${apiKey}`;

    fetch(url)
      .then(r => r.json())
      .then(data => {
        if (data.items) {
          const parsed: YTVideo[] = data.items.map((item: any) => {
            const videoId = item.id.videoId;
            return {
              title: item.snippet.title,
              videoId,
              pubDate: item.snippet.publishedAt,
              thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
              link: `https://www.youtube.com/watch?v=${videoId}`,
            };
          });
          setVideos(parsed);
        }
      })
      .catch(() => {})
      .finally(() => setVideosLoading(false));
  }, []);

  const divinoProfile = members.find(m => m.full_name.includes("Divino Ribeiro Viana"));
  const divinoLattes = divinoProfile?.lattes_url || "http://lattes.cnpq.br/7639474934278364";
  const membersWithCV = members.filter(m => m.lattes_url);

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative h-[52vh] flex items-center justify-center overflow-hidden bg-[#0f172a]">
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Spinoza.jpg/330px-Spinoza.jpg" 
          alt="Bento Espinosa"
          className="absolute opacity-20 object-cover w-full h-full grayscale"
        />
        <div className="relative z-10 text-center max-w-4xl px-4">
          <h1 className="font-serif text-5xl md:text-7xl text-white mb-6 leading-tight">
            "Deus sive Natura"
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 font-light mb-8 italic">
            Acompanhe o pensamento de Bento Espinosa em um ambiente de diálogo acadêmico e livre.
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

          <div className="mt-12 bg-slate-50 p-8 rounded-2xl border border-slate-100 shadow-inner">
            <h3 className="font-serif text-2xl text-slate-800 mb-6 flex items-center gap-3">
              <span className="w-2 h-8 bg-[#d4af37] rounded"></span>
              Pesquisadores do Grupo
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
        </div>
      </section>

      {/* Ágora */}
      <Agora user={user} />

      {/* YouTube Videos Section */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="font-serif text-4xl text-slate-800 mb-2">Aulas e Encontros no YouTube</h2>
            <p className="text-slate-500">Últimos vídeos publicados pelo grupo</p>
          </div>
          <a
            href={`https://www.youtube.com/channel/${CHANNEL_ID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-full font-bold hover:bg-red-700 transition text-sm"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 4-8 4z"/>
            </svg>
            Ver canal
          </a>
        </div>

        {videosLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-slate-100 rounded-2xl overflow-hidden animate-pulse">
                <div className="bg-slate-200 aspect-video w-full" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : videos.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map(v => (
              <a
                key={v.videoId}
                href={v.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white rounded-2xl overflow-hidden shadow-md border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition duration-300"
              >
                <div className="relative aspect-video overflow-hidden bg-slate-900">
                  <img
                    src={v.thumbnail}
                    alt={v.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/40">
                    <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center shadow-2xl">
                      <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="font-semibold text-slate-800 leading-snug line-clamp-2 group-hover:text-[#d4af37] transition">
                    {v.title}
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    {new Date(v.pubDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200">
            <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 4-8 4z"/>
            </svg>
            <p className="text-slate-600 font-medium mb-2">Chave de API do YouTube não configurada</p>
            <a
              href={`https://www.youtube.com/channel/${CHANNEL_ID}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-600 hover:underline text-sm font-semibold"
            >
              Ver vídeos diretamente no canal →
            </a>
          </div>
        )}

        <div className="mt-8 text-center sm:hidden">
          <a
            href={`https://www.youtube.com/channel/${CHANNEL_ID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-full font-bold hover:bg-red-700 transition"
          >
            Ver canal completo no YouTube
          </a>
        </div>
      </section>

    </div>
  );
};

export default Home;
