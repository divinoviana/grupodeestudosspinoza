-- ============================================================
-- PORTAL SPINOZA — Grupo de Estudos
-- Script de criação completa do banco de dados (Supabase)
-- Execute este script inteiro no SQL Editor do Supabase:
-- https://supabase.com/dashboard/project/qqqkcfwxrncniiuihiyd/sql
-- ============================================================

-- ============================================================
-- 1. EXTENSÕES
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 2. TABELA: profiles
-- Criada automaticamente via trigger ao registrar usuário
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT NOT NULL,
  full_name   TEXT NOT NULL DEFAULT '',
  bio         TEXT,
  academic_info TEXT,
  role        TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  avatar_url  TEXT,
  lattes_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Qualquer um pode ver perfis
CREATE POLICY "Perfis visíveis para todos" ON public.profiles
  FOR SELECT USING (true);

-- Apenas o próprio usuário pode editar seu perfil
CREATE POLICY "Usuário edita próprio perfil" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Apenas o próprio usuário pode inserir seu perfil
CREATE POLICY "Usuário insere próprio perfil" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================================
-- 3. FUNÇÃO + TRIGGER: criar perfil automaticamente no signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'member'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 4. TABELA: publications
-- ============================================================
CREATE TABLE IF NOT EXISTS public.publications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  author_id   TEXT NOT NULL,
  author_name TEXT NOT NULL,
  abstract    TEXT NOT NULL DEFAULT '',
  link        TEXT NOT NULL DEFAULT '',
  category    TEXT NOT NULL DEFAULT 'Ética',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.publications ENABLE ROW LEVEL SECURITY;

-- Qualquer um pode ler publicações
CREATE POLICY "Publicações visíveis para todos" ON public.publications
  FOR SELECT USING (true);

-- Apenas membros autenticados podem publicar
CREATE POLICY "Membros podem publicar" ON public.publications
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Autor ou admin podem deletar
CREATE POLICY "Autor ou admin deleta publicação" ON public.publications
  FOR DELETE USING (
    author_id = auth.uid()::text
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- 5. TABELA: events
-- ============================================================
CREATE TABLE IF NOT EXISTS public.events (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title        TEXT NOT NULL,
  description  TEXT NOT NULL DEFAULT '',
  date         DATE NOT NULL,
  time         TEXT NOT NULL DEFAULT '19:00',
  meeting_link TEXT NOT NULL DEFAULT '',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Qualquer um pode ver eventos
CREATE POLICY "Eventos visíveis para todos" ON public.events
  FOR SELECT USING (true);

-- Apenas admins podem criar eventos
CREATE POLICY "Admins criam eventos" ON public.events
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Apenas admins podem deletar eventos
CREATE POLICY "Admins deletam eventos" ON public.events
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- 6. TABELA: forum_topics
-- ============================================================
CREATE TABLE IF NOT EXISTS public.forum_topics (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category    TEXT NOT NULL DEFAULT 'Ética'
              CHECK (category IN ('Ética','Ontologia','Política','Epistemologia','Metafísica','Teologia')),
  title       TEXT NOT NULL,
  author_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.forum_topics ENABLE ROW LEVEL SECURITY;

-- Qualquer um pode ler tópicos
CREATE POLICY "Tópicos visíveis para todos" ON public.forum_topics
  FOR SELECT USING (true);

-- Apenas autenticados podem criar tópicos
CREATE POLICY "Membros criam tópicos" ON public.forum_topics
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Autor ou admin podem deletar
CREATE POLICY "Autor ou admin deleta tópico" ON public.forum_topics
  FOR DELETE USING (
    author_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- 7. TABELA: gallery_items
-- ============================================================
CREATE TABLE IF NOT EXISTS public.gallery_items (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title      TEXT NOT NULL,
  image_url  TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;

-- Qualquer um pode ver a galeria
CREATE POLICY "Galeria visível para todos" ON public.gallery_items
  FOR SELECT USING (true);

-- Apenas admins podem adicionar fotos
CREATE POLICY "Admins adicionam à galeria" ON public.gallery_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Apenas admins podem deletar fotos
CREATE POLICY "Admins deletam da galeria" ON public.gallery_items
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- 8. TABELA: contact_messages
-- ============================================================
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  message    TEXT NOT NULL,
  is_read    BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Qualquer um pode enviar mensagem (formulário público)
CREATE POLICY "Qualquer um envia contato" ON public.contact_messages
  FOR INSERT WITH CHECK (true);

-- Apenas admins podem ler mensagens
CREATE POLICY "Admins leem mensagens" ON public.contact_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Apenas admins podem marcar como lida
CREATE POLICY "Admins atualizam mensagens" ON public.contact_messages
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- 9. DADOS INICIAIS: Publicações do Prof. Divino Ribeiro Viana
-- ============================================================
INSERT INTO public.publications (title, author_id, author_name, abstract, link, category, created_at)
VALUES
  (
    'O estatuto da matemática na ontologia e na teoria do conhecimento de Spinoza',
    'divino-viana',
    'Prof. Me. Divino Ribeiro Viana',
    'Artigo publicado na Revista Helius que investiga o papel fundamental das matemáticas na estrutura ontológica de Spinoza.',
    'https://helius.uvanet.br/index.php/helius/article/view/260/257',
    'Ontologia',
    '2021-06-15'
  ),
  (
    'A emenda do intelecto: uma perspectiva pedagógica a partir de Spinoza',
    'divino-viana',
    'Prof. Me. Divino Ribeiro Viana',
    'Dissertação defendida na UFT que analisa o Tratado da Reforma do Intelecto sob uma ótica educacional e pedagógica.',
    'https://bdtd.ibict.br/vufind/Record/UFT_b685b3a7ea14e7ba7b8ccf8870930289',
    'Epistemologia',
    '2022-01-20'
  ),
  (
    'Spinoza e a Educação: Horizontes Latino-americanos',
    'divino-viana',
    'Prof. Me. Divino Ribeiro Viana',
    'Contribuição para a revista OLEL explorando a recepção do pensamento spinozano na educação da América Latina.',
    'https://ojs.observatoriolatinoamericano.com/ojs/index.php/olel/article/view/1558',
    'Política',
    '2023-03-10'
  ),
  (
    'A Experiência do Pensar na Problemata',
    'divino-viana',
    'Prof. Me. Divino Ribeiro Viana',
    'Artigo sobre a prática filosófica e a produção de subjetividade no pensamento de Spinoza.',
    'https://periodicos.bbn.ufpb.br/index.php/problemata/article/view/12925?articlesBySimilarityPage=40',
    'Metafísica',
    '2023-07-05'
  ),
  (
    'XVI Colóquio Spinoza: Filosofia e Liberdade (Volume 2)',
    'divino-viana',
    'Prof. Me. Divino Ribeiro Viana',
    'Publicação nos anais do XVI Colóquio Spinoza da PUC-Rio sobre o tema da liberdade na Ética.',
    'https://spinoza.jur.puc-rio.br/wp-content/uploads/2022/02/XVI-COLOQUIO-SPINOZA-2019-FILOSOFIA-E-LIBERDADE-VOLUME-2.pdf',
    'Ética',
    '2019-09-12'
  ),
  (
    'BNCC e Ensino de Filosofia: Uma Leitura Spinozana',
    'divino-viana',
    'Prof. Me. Divino Ribeiro Viana',
    'Artigo na Kalagatos sobre os impactos das novas diretrizes curriculares e a resistência via filosofia.',
    'https://revistas.uece.br/index.php/kalagatos/article/view/7246/6221',
    'Política',
    '2021-12-15'
  ),
  (
    'A Potência de Agir e a Tristeza na Problemata',
    'divino-viana',
    'Prof. Me. Divino Ribeiro Viana',
    'Estudo sobre os afetos e a superação das paixões tristes na filosofia de Spinoza.',
    'https://periodicos.ufpb.br/index.php/problemata/article/view/61162',
    'Ética',
    '2022-08-10'
  ),
  (
    'E-book: Perspectivas para 2025 na Filosofia Brasileira',
    'divino-viana',
    'Prof. Me. Divino Ribeiro Viana',
    'Capítulo dedicado ao futuro da pesquisa spinozana no Brasil e sua interface com a teologia política.',
    'https://www.rfbeditora.com/ebook-2025/179c234d-c0e7-4aa2-bf7b-ebcfc4841bf1',
    'Teologia',
    '2024-02-01'
  ),
  (
    'Seven Publisher: Debates em Ciências Humanas',
    'divino-viana',
    'Prof. Me. Divino Ribeiro Viana',
    'Investigação epistemológica sobre o método geométrico aplicado às ciências humanas.',
    'https://sevenpubl.com.br/editora/article/view/5874',
    'Epistemologia',
    '2023-06-20'
  ),
  (
    'UFT: Projetos de Pesquisa e Extensão em Filosofia',
    'divino-viana',
    'Prof. Me. Divino Ribeiro Viana',
    'Relatório e publicação sobre as atividades do grupo de estudos spinozanos na região amazônica.',
    'https://sistemas.uft.edu.br/periodicos/index.php/editora/issue/view/464',
    'Política',
    '2021-10-30'
  ),
  (
    'Repositório Institucional UFT: Teses e Dissertações',
    'divino-viana',
    'Prof. Me. Divino Ribeiro Viana',
    'Indexação completa da produção intelectual acadêmica depositada na Universidade Federal do Tocantins.',
    'https://repositorio.uft.edu.br/handle/11612/4469',
    'Metafísica',
    '2022-12-05'
  )
ON CONFLICT DO NOTHING;

-- ============================================================
-- 10. PROMOVER PRIMEIRO ADMIN
-- Após criar sua conta, execute este comando substituindo
-- pelo seu e-mail para tornar-se administrador:
--
-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'SEU_EMAIL_AQUI');
-- ============================================================

-- ============================================================
-- FIM DO SCRIPT
-- ============================================================
