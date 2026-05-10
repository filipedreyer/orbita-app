# Auditoria Fase 7 - Fazer, Planejar e Essencial protegido

## Escopo auditado

- Fazer: Hoje, lista do dia, ordenacao, zonas de atencao, capacidade e leitura de encerramento/timeline.
- Planejar: pagina legada de inegociaveis, onboarding guiado, portfolio e revisao semanal.
- Dominio: helpers de `src/lib/entity-domain.ts` e derivacoes de Fazer/Planejar.

## Aderente

| Item | Evidencia |
|---|---|
| Essencial protegido e flag | `applyProtectedEssentialFlag` aplica metadata sem criar entidade. |
| Elegibilidade centralizada | `canReceiveProtectedEssential` limita a `meta`, `projeto`, `tarefa`, `habito`, `rotina`. |
| Criacao nova de `inegociavel` bloqueada | Capturar, store e Planejar nao criam o tipo legado. |
| Planejar virou superficie de aplicacao | `InegociaveisPage` aplica protecao em itens existentes e lista legado separado. |
| Hoje nao infla urgencia | `cuidado` nao inclui protecao automaticamente e `getAttentionLevel` nao tensiona apenas por legado. |
| Onboarding nao cria legado | Sugestao `inegociavel` vinda da IA e normalizada para `essencial_protegido` e nao cria entidade. |

## Legado permitido

| Ocorrencia | Motivo |
|---|---|
| Rota `/planejar/inegociaveis` | Compatibilidade de navegacao. UI vigente mostra Essencial protegido. |
| `InegociavelMetadata` | Compatibilidade de leitura de registros antigos. |
| Campos `fixedInegociaveis`, `capacityOnlyInegociaveis`, `blockedInegociaveis` | Aliases internos temporarios usados por IA/timeline ate refatoracao posterior. |
| `portfolio.inegociaveis` | Colecao legada separada de `protectedEssentials`. |

## Divida

- Renomear aliases internos de Fazer/IA para `protectedEssentials` sem tocar capacidade/timeline profundamente.
- Migrar registros `inegociavel` para entidades elegiveis com `essential_protected`.
- Remover editor legado de regra de `inegociavel` quando nenhum fluxo depender dele.
- Atualizar edge function de onboarding para deixar de emitir `inegociavel`.

## Blockers

- Sem inventario de dados, nao e seguro migrar ou apagar registros legados.
- Sem migracao remota, schema ainda pode conter registros antigos e writes externos.

## QA

- `npm run build`: passou.
- `npm run regression:smoke`: passou.
- `npm run lint`: falha global com 11 erros legados, abaixo do baseline de 13 erros.
- ESLint direcionado aos arquivos alterados/criados nesta fase: passou sem erros.

## Proxima correcao

Executar inventario/migracao controlada de dados legados antes de remover aliases internos ou rota compatível.
