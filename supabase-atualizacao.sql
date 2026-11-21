-- ============================================================
-- PORTAL SPINOZA — Atualização do banco existente
-- Acrescenta o que falta sem apagar dados. Pode ser executado
-- mais de uma vez com segurança.
-- Cole no SQL Editor do projeto e clique em "Run".
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------
-- 1. Proteção: membro comum não pode alterar o próprio papel
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
    IF TG_OP = 'INSERT' THEN
      NEW.role := 'member';
    ELSE
      NEW.role := OLD.role;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_role ON public.profiles;
CREATE TRIGGER protect_profile_role
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_role();

-- ------------------------------------------------------------
-- 2. Galeria: coluna de álbum
-- ------------------------------------------------------------
ALTER TABLE public.gallery_items ADD COLUMN IF NOT EXISTS album TEXT;

-- ------------------------------------------------------------
-- 3. Ágora (mural ao vivo da página inicial)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.agora_posts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content     TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_id   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_member   BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.agora_posts ENABLE ROW LEVEL SECURITY;

-- Remove políticas antigas da Ágora para aplicar as regras atuais
DO $$
DECLARE p RECORD;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies
           WHERE schemaname = 'public' AND tablename = 'agora_posts' LOOP
    EXECUTE format('DROP POLICY %I ON public.agora_posts', p.policyname);
  END LOOP;
END $$;

CREATE POLICY "Ágora visível para todos" ON public.agora_posts
  FOR SELECT USING (true);

-- Visitantes postam como convidados; membros só podem postar em seu próprio nome
CREATE POLICY "Qualquer um posta na Ágora" ON public.agora_posts
  FOR INSERT WITH CHECK (
    char_length(content) BETWEEN 1 AND 2000
    AND char_length(author_name) BETWEEN 1 AND 80
    AND (
      (author_id IS NULL AND is_member = false)
      OR (author_id = auth.uid() AND is_member = true)
    )
  );

CREATE POLICY "Admins removem posts da Ágora" ON public.agora_posts
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Atualizações em tempo real
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'agora_posts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.agora_posts;
  END IF;
END $$;

-- ------------------------------------------------------------
-- 3b. Comentários da Ágora (qualquer pessoa pode comentar)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.agora_comments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id     UUID NOT NULL REFERENCES public.agora_posts(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_id   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_member   BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS agora_comments_post_id_idx ON public.agora_comments(post_id);

ALTER TABLE public.agora_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Comentários visíveis para todos" ON public.agora_comments;
CREATE POLICY "Comentários visíveis para todos" ON public.agora_comments
  FOR SELECT USING (true);

-- Visitantes comentam como convidados; membros só podem comentar em seu próprio nome
DROP POLICY IF EXISTS "Qualquer um comenta na Ágora" ON public.agora_comments;
CREATE POLICY "Qualquer um comenta na Ágora" ON public.agora_comments
  FOR INSERT WITH CHECK (
    char_length(content) BETWEEN 1 AND 2000
    AND char_length(author_name) BETWEEN 1 AND 80
    AND (
      (author_id IS NULL AND is_member = false)
      OR (author_id = auth.uid() AND is_member = true)
    )
  );

DROP POLICY IF EXISTS "Admins removem comentários" ON public.agora_comments;
CREATE POLICY "Admins removem comentários" ON public.agora_comments
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'agora_comments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.agora_comments;
  END IF;
END $$;

-- ------------------------------------------------------------
-- 4. Storage: bucket de fotos da galeria
-- ------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery', 'gallery', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Fotos da galeria públicas" ON storage.objects;
CREATE POLICY "Fotos da galeria públicas" ON storage.objects
  FOR SELECT USING (bucket_id = 'gallery');

DROP POLICY IF EXISTS "Admins enviam fotos" ON storage.objects;
CREATE POLICY "Admins enviam fotos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'gallery'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins apagam fotos" ON storage.objects;
CREATE POLICY "Admins apagam fotos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'gallery'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Fotos de perfil: cada usuário só mexe na própria pasta (avatars/<id do usuário>/...)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 3145728, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Fotos de perfil públicas" ON storage.objects;
CREATE POLICY "Fotos de perfil públicas" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Usuário envia a própria foto" ON storage.objects;
CREATE POLICY "Usuário envia a própria foto" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Usuário apaga a própria foto" ON storage.objects;
CREATE POLICY "Usuário apaga a própria foto" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ------------------------------------------------------------
-- Avisos de novidades (sininho + e-mail)
-- ------------------------------------------------------------
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notifications_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE TABLE IF NOT EXISTS public.notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kind       TEXT NOT NULL CHECK (kind IN ('publicacao', 'forum', 'evento', 'agora')),
  title      TEXT NOT NULL,
  body       TEXT NOT NULL DEFAULT '',
  link       TEXT NOT NULL DEFAULT '/',
  actor_id   TEXT,
  send_email BOOLEAN NOT NULL DEFAULT false,
  emailed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON public.notifications(created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Só membros cadastrados veem os avisos; ninguém insere pelo site (apenas os gatilhos abaixo)
DROP POLICY IF EXISTS "Membros veem avisos" ON public.notifications;
CREATE POLICY "Membros veem avisos" ON public.notifications
  FOR SELECT TO authenticated USING (true);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END $$;

-- Permite que o banco chame o site para disparar os e-mails
CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE OR REPLACE FUNCTION public.create_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  n public.notifications;
BEGIN
  IF TG_TABLE_NAME = 'publications' THEN
    INSERT INTO public.notifications (kind, title, body, link, actor_id, send_email)
    VALUES ('publicacao', 'Nova publicação: ' || NEW.title,
            NEW.author_name || ' — ' || left(NEW.abstract, 220), '/publicacoes', NEW.author_id, true)
    RETURNING * INTO n;
  ELSIF TG_TABLE_NAME = 'forum_topics' THEN
    INSERT INTO public.notifications (kind, title, body, link, actor_id, send_email)
    VALUES ('forum', 'Novo tópico no fórum (' || NEW.category || '): ' || NEW.title,
            NEW.author_name || ' — ' || left(NEW.content, 220), '/forum', NEW.author_id::text, true)
    RETURNING * INTO n;
  ELSIF TG_TABLE_NAME = 'events' THEN
    INSERT INTO public.notifications (kind, title, body, link, actor_id, send_email)
    VALUES ('evento', 'Novo evento: ' || NEW.title,
            to_char(NEW.date, 'DD/MM/YYYY') || ' às ' || NEW.time || ' — ' || left(NEW.description, 200),
            '/eventos', NULL, true)
    RETURNING * INTO n;
  ELSIF TG_TABLE_NAME = 'agora_posts' THEN
    INSERT INTO public.notifications (kind, title, body, link, actor_id, send_email)
    VALUES ('agora', NEW.author_name || ' compartilhou um pensamento na Ágora',
            left(NEW.content, 220), '/', NEW.author_id::text, false)
    RETURNING * INTO n;
  END IF;

  IF n.send_email THEN
    BEGIN
      PERFORM net.http_post(
        url := 'https://www.herem.com.br/api/notify',
        body := jsonb_build_object('id', n.id),
        headers := '{"Content-Type": "application/json"}'::jsonb
      );
    EXCEPTION WHEN OTHERS THEN
      NULL; -- uma falha no envio de e-mail nunca impede a publicação
    END;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_publications ON public.publications;
CREATE TRIGGER notify_publications AFTER INSERT ON public.publications
  FOR EACH ROW EXECUTE FUNCTION public.create_notification();

DROP TRIGGER IF EXISTS notify_forum_topics ON public.forum_topics;
CREATE TRIGGER notify_forum_topics AFTER INSERT ON public.forum_topics
  FOR EACH ROW EXECUTE FUNCTION public.create_notification();

DROP TRIGGER IF EXISTS notify_events ON public.events;
CREATE TRIGGER notify_events AFTER INSERT ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.create_notification();

DROP TRIGGER IF EXISTS notify_agora_posts ON public.agora_posts;
CREATE TRIGGER notify_agora_posts AFTER INSERT ON public.agora_posts
  FOR EACH ROW EXECUTE FUNCTION public.create_notification();

-- ------------------------------------------------------------
-- 5. Conferência: lista as tabelas e quantos registros cada uma tem
-- ------------------------------------------------------------
SELECT 'profiles' AS tabela, COUNT(*) AS registros FROM public.profiles
UNION ALL SELECT 'publications', COUNT(*) FROM public.publications
UNION ALL SELECT 'events', COUNT(*) FROM public.events
UNION ALL SELECT 'forum_topics', COUNT(*) FROM public.forum_topics
UNION ALL SELECT 'gallery_items', COUNT(*) FROM public.gallery_items
UNION ALL SELECT 'contact_messages', COUNT(*) FROM public.contact_messages
UNION ALL SELECT 'agora_posts', COUNT(*) FROM public.agora_posts
UNION ALL SELECT 'agora_comments', COUNT(*) FROM public.agora_comments
UNION ALL SELECT 'notifications', COUNT(*) FROM public.notifications;
