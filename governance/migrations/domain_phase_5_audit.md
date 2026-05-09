# Auditoria Fase 5 - Dominio, vocabulario e entidades

## Escopo auditado

- `EntityType`, `CaptureType`, labels, criacao via Capturar, Inbox, Caixola e IA textual.
- Fluxos de criacao, duplicacao, promocao e conversao de Inbox.
- Leitura de registros legados `ideia` e `inegociavel`.
- Metadata minima para essencial protegido, origem de Inbox e anexos.

## Aderente

| Item | Evidencia |
|---|---|
| Tipos canonicos centralizados | `src/lib/entity-domain.ts` define `canonicalEntityTypes`, matriz canonica e helpers. |
| `Idea` nao e entidade nova | `ideia` foi removido dos fluxos de criacao nova e normalizado para `nota` quando chega de IA legada. |
| `Inegociavel` nao e entidade nova | Criacao nova de `inegociavel` foi bloqueada; duplicacao/promocao para tipo legado tambem bloqueadas. |
| Capturar nao cria tipos proibidos | Grid e formulario usam tipos canonicos e `assertNewEntityType`. |
| Inbox preserva origem | Conversao usa `createInboxOriginMetadata` para registrar origem de captura/conversao. |
| Lembrete com data obrigatoria | `StructuredCaptureForm` bloqueia criacao de lembrete sem data. |

## Aceito temporariamente

| Item | Motivo |
|---|---|
| Leitura de `ideia` e `inegociavel` | Necessaria para nao quebrar dados existentes antes de inventario. |
| Agenda persistindo como `evento` | A arquitetura exige separacao semantica, mas schema ainda nao foi decidido nesta fase. |
| Template persistindo como `nota` | Tipo canonico aparece na superficie de captura, mas schema dedicado fica para fase posterior. |
| IA onboarding ainda conhece `inegociavel` | Criacao foi bloqueada; remocao completa exige ajuste de jornada Planejar/IA. |

## Divida

| Divida | Severidade | Proxima correcao |
|---|---|---|
| Schema Supabase nao versionado para tipos canonicos | Alta | Criar migrations/constraints depois do inventario. |
| Migracao real de registros `ideia` | Alta | Inventariar dados e migrar para `nota` com rastreabilidade. |
| Migracao real de registros `inegociavel` | Alta | Converter para entidade elegivel com flag de essencial protegido. |
| Anexos e `image_url` legado | Alta | Fase de storage/seguranca deve definir relacao segura e signed URLs. |
| Agenda versus Evento | Media | Decidir se Agenda e entidade, categoria ou visao de calendario. |

## Blockers

Nenhum blocker tecnico para a Fase 5 no frontend. O blocker para migracao destrutiva e a ausencia de inventario seguro de dados e schema Supabase versionado no repositorio.

## Proxima correcao

1. Versionar schema e constraints de dominio no backend.
2. Inventariar dados legados antes de remover suporte de leitura.
3. Migrar IA onboarding e superficies de Planejar para essencial protegido como condicao, nao entidade.
