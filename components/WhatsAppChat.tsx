
import React from 'react';

const WhatsAppChat: React.FC = () => {
  const whatsappNumber = "+5563999191919";
  const message = "Olá Prof. Divino Viana, gostaria de saber mais sobre o Grupo de Estudos Spinoza.";
  const url = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;

  return (
    <a 
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 bg-[#25D366] text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-3xl hover:scale-110 transition z-[100]"
      title="Falar no WhatsApp"
    >
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.319 1.592 5.548 0 10.058-4.51 10.06-10.059 0-2.692-1.047-5.224-2.95-7.129-1.901-1.902-4.434-2.951-7.11-2.951-5.548 0-10.057 4.51-10.059 10.059 0 2.152.593 3.657 1.648 5.483l-.98 3.578 3.673-.964z"/></svg>
    </a>
  );
};

export default WhatsAppChat;
