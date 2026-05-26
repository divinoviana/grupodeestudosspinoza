import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { prompt } = await req.json();

    if (!prompt?.trim()) {
      return new Response(JSON.stringify({ error: 'Prompt vazio.' }), { status: 400 });
    }

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: `Você é um assistente acadêmico especialista no pensamento de Bento Espinosa para o Grupo de Estudos Spinoza do Prof. Me. Divino Ribeiro Viana, da Universidade Federal do Tocantins.
Seu papel é ajudar pesquisadores e interessados com:
- Explicações de conceitos da Ética (conatus, substância, atributos, modos, afetos, etc.)
- Indicações de leitura e bibliografia secundária
- Conexões entre Espinosa e outros filósofos
- Questões de ética, ontologia, política, epistemologia e teologia espinosanas
Responda sempre em português, de forma clara, rigorosa e acadêmica, mas acessível.`,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Anthropic API error:', error);
    return new Response(JSON.stringify({ error: 'Erro ao conectar com a IA.' }), { status: 500 });
  }
}
