# Divergencias de IA

| Divergencia | Severidade | Impacto | Risco | Arquivos afetados | Esforco | Dependencias | Recomendacao |
|---|---|---|---|---|---|---|---|
| Idea abre chat contextual legado | Alta | IA ainda pode parecer chatbot | Semantica incompleta | `FloatingActionPair.tsx`, `features/ia/*` | Alto | Fase IA | Migrar para apoio contextual canonico |
| Relatorios continuam no provider | Media | Funcionalidade preservada mas nao primaria | Reaparecer na TopBar | `IAProvider.tsx`, `IAReportDrawer.tsx` | Medio | Fase IA | Manter fora do shell e revisar |
| Acoes de IA precisam confirmacao clara | Alta | Pode executar demais | Perda de confianca | `features/ia/*` | Alto | Politica IA | Adicionar camada de confirmacao |
| Drawers legados ainda existem encapsulados | Media | Codigo antigo pode ser reutilizado por engano | Regressao para chat/relatorio fora de Idea | `IAChatDrawer.tsx`, `IAReportDrawer.tsx` | Medio | Limpeza pos-Fase 3 | Remover ou isolar depois de estabilizar Idea |
| Edge functions ainda nao emitem contrato `IAOutputDescriptor` | Media | Conversao acontece no frontend | Inconsistencia futura de outputs | `supabase/functions/ia-*` | Medio | Fase de IA backend | Padronizar payloads por tipo canonico |
