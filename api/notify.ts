import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qqqkcfwxrncniiuihiyd.supabase.co';
const SITE_URL = 'https://www.herem.com.br';
const BATCH_SIZE = 100;

interface Notification {
  id: string;
  kind: string;
  title: string;
  body: string;
  link: string;
  actor_id: string | null;
}

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

function buildEmail(n: Notification) {
  const url = `${SITE_URL}/#${n.link}`;
  const prefs = `${SITE_URL}/#/perfil`;
  const html = `
<div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#1e293b">
  <div style="background:#0f172a;padding:24px 28px;border-radius:12px 12px 0 0">
    <p style="margin:0;color:#d4af37;font-size:13px;letter-spacing:2px;text-transform:uppercase">Grupo de Estudos Spinoza</p>
  </div>
  <div style="background:#ffffff;border:1px solid #e2e8f0;border-top:0;padding:28px;border-radius:0 0 12px 12px">
    <h1 style="font-size:22px;margin:0 0 12px;color:#0f172a">${escapeHtml(n.title)}</h1>
    <p style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#475569;margin:0 0 24px">${escapeHtml(n.body)}</p>
    <a href="${url}" style="display:inline-block;background:#d4af37;color:#0f172a;text-decoration:none;font-family:Arial,sans-serif;font-weight:bold;padding:12px 24px;border-radius:8px">Ver no portal</a>
  </div>
  <p style="font-family:Arial,sans-serif;font-size:12px;color:#94a3b8;text-align:center;margin:20px 0">
    Você recebe este aviso por ser membro do portal.
    <a href="${prefs}" style="color:#94a3b8">Desativar e-mails no seu perfil</a>.
  </p>
</div>`;
  const text = `${n.title}\n\n${n.body}\n\nVer no portal: ${url}\n\nPara não receber mais estes e-mails, desative-os no seu perfil: ${prefs}`;
  return { html, text };
}

type AdminClient = ReturnType<typeof createClient<any>>;

async function recipientEmails(admin: AdminClient, actorId: string | null) {
  const { data: profiles, error } = await admin
    .from('profiles')
    .select('id')
    .eq('email_notifications', true);
  if (error) throw error;
  const wanted = new Set((profiles || []).map(p => p.id as string));
  if (actorId) wanted.delete(actorId);

  const emails: string[] = [];
  for (let page = 1; ; page++) {
    const { data, error: listErr } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (listErr) throw listErr;
    for (const u of data.users) {
      if (u.email && wanted.has(u.id)) emails.push(u.email);
    }
    if (data.users.length < 1000) break;
  }
  return emails;
}

export async function POST(request: Request): Promise<Response> {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  if (!serviceKey || !resendKey) return json({ error: 'E-mail não configurado.' }, 503);

  let id: unknown;
  try {
    ({ id } = await request.json());
  } catch {
    return json({ error: 'Corpo inválido.' }, 400);
  }
  if (typeof id !== 'string') return json({ error: 'id obrigatório.' }, 400);

  const admin: AdminClient = createClient<any>(SUPABASE_URL, serviceKey, { auth: { persistSession: false } });

  // Marca o aviso como enviado antes de enviar, para que cada um saia uma única vez
  const { data: claimed, error: claimErr } = await admin
    .from('notifications')
    .update({ emailed_at: new Date().toISOString() })
    .eq('id', id)
    .eq('send_email', true)
    .is('emailed_at', null)
    .select('id, kind, title, body, link, actor_id')
    .maybeSingle();

  if (claimErr) return json({ error: claimErr.message }, 500);
  if (!claimed) return json({ sent: 0, skipped: true });

  const n = claimed as Notification;
  const emails = await recipientEmails(admin, n.actor_id);
  const { html, text } = buildEmail(n);
  const from = process.env.EMAIL_FROM || 'Grupo de Estudos Spinoza <avisos@herem.com.br>';

  let sent = 0;
  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const batch = emails.slice(i, i + BATCH_SIZE).map(to => ({
      from,
      to: [to],
      subject: n.title,
      html,
      text,
    }));
    const res = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(batch),
    });
    if (!res.ok) {
      console.error('Resend error:', res.status, await res.text());
      continue;
    }
    sent += batch.length;
  }

  return json({ sent });
}
