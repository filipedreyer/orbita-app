# Orbita App

Orbita e um sistema operacional pessoal construido em React, TypeScript, Vite e Supabase.

## Baselines do produto

- Fase 3: Fazer consolidado
- Fase 4: Memoria navegavel + editor TipTap
- Fase 5: Planejar com superficies reais
- Fase 6: IA frontend mockada
- Fase 7: micro interacoes e transicoes
- Fase 8: polish final para deploy

## Ambiente

Copie `.env.example` para `.env.local` e preencha:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Regra de runtime sem `.env.local`

- Sem `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`, o app deve subir em modo degradado.
- Nesse estado, a interface deve renderizar a tela controlada de configuracao e nao deve quebrar durante o bootstrap.
- Nesse estado, o app nao deve tentar criar o client do Supabase nem tocar em servicos que dependem dele antes da validacao de configuracao.
- O ponto unico de controle dessa regra e `src/lib/supabase.ts`: o client so pode existir quando as variaveis estiverem presentes, e o acesso deve passar pelo guard centralizado (`getSupabase()`).
- Qualquer mudanca nesse comportamento deve ser tratada como alteracao estrutural de runtime, nao como ajuste cosmetico.

### Warnings esperados em desenvolvimento

- PWA: o browser pode emitir aviso informando que `beforeinstallprompt.preventDefault()` impediu a exibicao automatica do banner de instalacao.
- Supabase Auth: em ambiente de desenvolvimento com React Strict Mode, o GoTrue pode registrar aviso de recuperacao de lock (`lock ... was not released within 5000ms`).
- Esses avisos nao representam crash de bootstrap nem erro de configuracao do fallback.

## Scripts

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run regression:smoke`

## Deploy

O projeto esta preparado para deploy SPA em Vercel com `vercel.json` de rewrite para `index.html`.

## Exportacao de dados

- JSON completo por usuario autenticado
- CSV por entidade em arquivos individuais nesta release

## PWA

- manifest consistente
- service worker com auto update
- instalacao validada pela camada `PwaProvider`
- suporte offline minimo para shell e assets precacheados
