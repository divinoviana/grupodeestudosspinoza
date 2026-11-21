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

-- ------------------------------------------------------------
-- 5. Conferência: lista as tabelas e quantos registros cada uma tem
-- ------------------------------------------------------------
SELECT 'profiles' AS tabela, COUNT(*) AS registros FROM public.profiles
UNION ALL SELECT 'publications', COUNT(*) FROM public.publications
UNION ALL SELECT 'events', COUNT(*) FROM public.events
UNION ALL SELECT 'forum_topics', COUNT(*) FROM public.forum_topics
UNION ALL SELECT 'gallery_items', COUNT(*) FROM public.gallery_items
UNION ALL SELECT 'contact_messages', COUNT(*) FROM public.contact_messages
UNION ALL SELECT 'agora_posts', COUNT(*) FROM public.agora_posts;
