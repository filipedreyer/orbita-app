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
