# Checkpoint arquitetural - Olys V2.2 Fase 5

## Fases concluidas

1. Fase 1: governanca canonica e congelamento arquitetural.
2. Fase 2: Shell Global canonico.
3. Fase 3: IA contextual via Idea.
4. Fase 4: Capturar, Inbox e Caixola.
5. Fase 5: dominio, vocabulario e entidades.

## Estado atual do projeto

- Branch de checkpoint: `migration/olys-v2-canonical`.
- O app preserva compatibilidade de leitura com dados legados.
- Novos fluxos foram alinhados para nao recriar `Idea/ideia` ou `Inegociavel/inegociavel` como entidades.
- Governanca local esta presente em `AGENTS.md`, `architecture/PRECEDENCE.md` e `governance/*`.
- Shell, Idea, Capturar, Inbox, Caixola e dominio possuem auditorias de fase.

## Principais mudancas

- Estrutura de governanca canonica e contratos arquiteturais versionados.
- Shell Global migrado para TopBar Olys, BottomNav canonica e FloatingActionPair.
- Idea consolidada como porta da IA contextual, fora da TopBar e da BottomNav.
- Capturar migrado para superficie propria com grid canonico; Inbox e Caixola ganharam semantica de triagem/incubacao.
- Dominio centralizado em `src/lib/entity-domain.ts`, com tipos canonicos, tipos depreciados, normalizacao e bloqueio de criacao legada.

## Dividas remanescentes

- Schema Supabase, RLS, ownership e storage ainda nao foram endurecidos.
- Admin ainda precisa autorizacao por role/claim e auditoria propria.
- `ideia` e `inegociavel` ainda existem para leitura legada ate inventario seguro.
- Agenda e Template usam persistencia provisoria.
- Drawers e leituras legadas de IA permanecem encapsulados para evitar quebra.
- Fluxos de Fazer/Planejar ainda carregam linguagem e calculos legados de `inegociavel`.

## Blockers

- Nao ha blocker frontend para checkpoint.
- Migracoes destrutivas de dados seguem bloqueadas ate existir inventario seguro e schema versionado.
- Hardening de seguranca depende de revisao Supabase/storage/RLS/Admin.

## Baselines

| Verificacao | Resultado |
|---|---|
| Build | `npm run build` passou. |
| Smoke | `npm run regression:smoke` passou. |
| Lint global | `npm run lint` falha com 13 erros preexistentes. |
| ESLint focado Fase 5 | Passou nos arquivos alterados/criados da fase. |

## Baseline lint

Erros globais atuais: 13.

Arquivos com erros preexistentes:

- `src/components/feedback/ActionFeedbackProvider.tsx`
- `src/features/admin/AdminPage.tsx`
- `src/features/auth/AuthProvider.tsx`
- `src/features/fazer/encerramento/EncerramentoPageV2.tsx`
- `src/features/fazer/hoje/HojePage.tsx`
- `src/features/fazer/ritual/RitualPageV2.tsx`
- `src/features/fazer/timeline/TimelinePage.tsx`
- `src/features/ia/IAContextBuilder.tsx`
- `src/features/ia/IAReportDrawer.tsx`
- `src/features/onboarding/OnboardingProvider.tsx`
- `src/features/planejar/RevisaoSemanalPage.tsx`
- `src/features/pwa/PwaProvider.tsx`

Nenhum erro novo foi identificado nos arquivos alterados/criados pela Fase 5.

## Riscos conhecidos

- Banco pode aceitar writes externos com tipos legados se constraints nao existirem.
- Storage/anexos ainda podem depender de URL publica/legada.
- Admin e policies nao devem ser considerados hardenizados.
- Leitura legada de `inegociavel` em capacidade/timeline ainda pode influenciar telas de Fazer.

## Proximos passos recomendados

1. Iniciar Fase 6 somente apos push/tag deste checkpoint.
2. Auditar Supabase schema, RLS, ownership, buckets e signed URLs.
3. Formalizar Admin por role/claim.
4. Preparar inventario de dados antes de migrar `ideia` e `inegociavel`.
