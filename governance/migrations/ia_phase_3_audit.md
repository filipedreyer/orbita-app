# Auditoria IA Contextual - Fase 3

## Escopo auditado

- `src/features/ia/IAProvider.tsx`
- `src/features/ia/IdeaSurface.tsx`
- `src/features/ia/ContextualIAEntry.tsx`
- `src/features/ia/IAOutputRenderer.tsx`
- `src/features/ia/IAConfirmationSheet.tsx`
- `src/features/ia/IAReportPanel.tsx`
- `src/features/ia/IAEntryPoints.tsx`
- `src/features/ia/IATextAnalyzer.tsx`
- `src/features/ia/IASuggestCards.tsx`
- `src/components/navigation/FloatingActionPair.tsx`
- edge functions `supabase/functions/ia-*`

## Aderente

- Idea e acionada pelo `FloatingActionPair`.
- IA nao voltou para TopBar.
- IA nao entrou na BottomNav.
- Idea nao foi transformada em entidade, rota primaria ou modelo persistente.
- Chat e modo interno da `IdeaSurface`, nao definicao da IA.
- Relatorios sao modo interno da `IdeaSurface`.
- Outputs foram classificados como `leitura`, `sugestao`, `relatorio` e `acao_proposta`.
- `createFromAnalysis` nao cria item sem `IAConfirmationSheet`.
- `IASuggestCards` exige confirmacao antes de chamar `onApply`.
- `triggerAction` abre confirmacao e apenas marca revisao; nao persiste dados automaticamente.

## Aceito temporariamente

- Drawers legados `IAChatDrawer` e `IAReportDrawer` permanecem no codigo para reduzir risco, mas foram encapsulados/depreciados e nao sao renderizados por `IAProvider`.
- `IAReportPanel` reaproveita a logica de relatorios existente sem migrar edge functions.
- `IAEntryPoints` ainda aparece em telas internas, mas abre Idea ou relatorios dentro da Idea.
- Acoes de paginas que nao sao originadas por IA direta, como conclusao manual de item, continuam fora desta barreira.

## Divida

- Unificar nomes internos de IA para remover `ChatDrawer` e `ReportDrawer` legados.
- Criar trilha de auditoria persistente para confirmacoes de IA quando houver backend adequado.
- Revisar prompts e edge functions para emitir outputs ja tipados no contrato novo.
- Substituir `window.confirm` residual na Timeline por componente de confirmacao consistente em fase de polimento.
- Remover `ideia` como tipo de sugestao de analise somente apos inventario de entidades.

## Blocker

Nenhum blocker para concluir a Fase 3. A regra de confirmacao humana explicita esta aplicada aos pontos de IA que podiam preparar ou persistir alteracoes.

## Proxima correcao

Planejar limpeza de componentes legados de IA e padronizar outputs das edge functions para `IAOutputDescriptor`.

