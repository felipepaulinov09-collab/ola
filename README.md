# Felipe Imports

Loja responsiva em React + TypeScript + Vite, com catálogo, busca, categorias, WhatsApp e painel administrativo preparado para Supabase.

## Configuração
1. Node.js 20+: execute npm install e npm run dev.
2. Crie um projeto Supabase e execute supabase/schema.sql no SQL Editor.
3. Crie o usuário administrador em Supabase Authentication.
4. Copie .env.example para .env e configure URL, chave pública anon e número do WhatsApp.
5. Nunca exponha a chave service_role no frontend.

## Lovable
Conecte o repositório GitHub ao Lovable e importe o projeto. Configure as mesmas variáveis de ambiente na publicação.

## Limitações desta primeira entrega
O catálogo inicia com produtos demonstrativos. O painel salva produtos no Supabase depois da configuração. As imagens são informadas por URL nesta versão; upload de arquivos e políticas Storage precisam ser configurados na próxima etapa. Revise as políticas RLS antes de colocar a loja em produção.