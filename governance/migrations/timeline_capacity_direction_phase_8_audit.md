# Auditoria Fase 8 - Timeline, Capacidade e Direcao

## Escopo auditado

- Timeline: `TimelinePage`, lentes, calendario, capacidade e dependencias.
- Capacidade: derivacao em `features/fazer/domain/canonical.ts` e `derived.ts`.
- Direcao: indicadores de Hoje e leitura de alinhamento com metas, projetos e essencial protegido.
- Hoje: header e bloco informativo de capacidade/direcao.

## Aderente

| Item | Evidencia |
|---|---|
| Timeline como visao unica | `TimelinePage` usa lentes `Calendario`, `Capacidade` e `Dependencias` na mesma rota. |
| Capacidade sem contagem simples | `getCapacityStatus` usa duracao, janela ou esforco explicito. |
| Incerteza comunicada | Estados `unknown`, `incompleto` e `parcial` aparecem como informacao ativa. |
| Lembrete sem duracao nao ocupa carga | `isCapacityRelevantItem` exclui lembrete por padrao. |
| Essencial protegido nao ocupa automaticamente | Flag so orienta Direcao; capacidade exige dado temporal explicito. |
| Direcao nao e Foco | UI de Hoje usa `Direcao`; `focusItems` fica como nome tecnico legado. |
| Dependencia nao e vinculo | `getDependencyImpact` usa `blocked_by`; meta/projeto ficam como orientacao. |

## Aceito temporariamente

| Ocorrencia | Motivo |
|---|---|
| `focusItems` em stores/domains | Nome tecnico legado ainda muito espalhado; troca ampla ficaria fora do escopo. |
| IA sugestoes ainda recebem `balanced/loaded/overloaded` | Adapter `toAISuggestCapacitySignal` preserva compatibilidade sem mudar fonte canonica. |
| `overloadByItems` permanece zerado | Campo legado mantido para compatibilidade ate consumidores antigos serem removidos. |
| Aliases `inegociavel` em capacidade legada | Mantidos por leitura historica, sem migracao real nesta fase. |

## Divida

- Renomear `focusItems` para termo tecnico neutro como `dayExecutionItems`.
- Atualizar IA prompts/readers para aceitar `unknown`, `incompleto` e `parcial` sem adapter.
- Inventariar metadata real de duracao/esforco antes de ampliar precisao de capacidade.
- Remover `overloadByItems` quando Timeline/IA nao dependerem mais do campo.
- Revisar Ritual/Encerramento para remover textos legados de foco em fase propria.

## Blockers

- Nao ha schema remoto validado para duracao/esforco; a fase nao aplicou migration remota.
- Dados historicos podem nao ter metadata suficiente para capacidade computavel.

## QA esperado

- `npm run build`: passou.
- `npm run regression:smoke`: passou.
- `npm run lint`: falha global com 10 erros legados, abaixo do baseline anterior de 11/13.
- ESLint direcionado aos arquivos da fase: passou sem erros.
