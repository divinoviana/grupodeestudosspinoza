export const askSpinozaAI = async (prompt: string): Promise<string> => {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    return data.text || 'Desculpe, não consegui processar sua solicitação.';
  } catch (error) {
    console.error('Claude API error:', error);
    return 'Ocorreu um erro ao conectar com a IA. Tente novamente em instantes.';
  }
};
