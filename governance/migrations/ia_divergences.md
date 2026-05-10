# Divergencias de IA

| Divergencia | Severidade | Impacto | Risco | Arquivos afetados | Esforco | Dependencias | Recomendacao |
|---|---|---|---|---|---|---|---|
| Idea abre superficie contextual canonica | Mitigada | IA nao volta para TopBar/BottomNav | Mocks locais ainda podem parecer finais | `FloatingActionPair.tsx`, `features/ia/*` | Medio | IA backend | Manter Idea como porta unica |
| Relatorios legados removidos | Resolvida | Drawers antigos nao podem reaparecer por import acidental | Nenhum | `IAReportDrawer.tsx` removido | Baixo | Fase 9 | Usar outputs internos da Idea |
| Acoes de IA precisam confirmacao clara | Mitigada | Confirmacao existe para acoes persistentes propostas | Futuros outputs backend podem violar contrato | `features/ia/*` | Medio | Politica IA | Validar em edge functions |
| Drawers legados removidos | Resolvida | Codigo antigo nao fica disponivel para reuso | Nenhum | `IAChatDrawer.tsx`, `IAReportDrawer.tsx` removidos | Baixo | Fase 9 | Nao reintroduzir chat/drawer como primario |
| Edge functions ainda nao emitem contrato `IAOutputDescriptor` | Media | Conversao acontece no frontend | Inconsistencia futura de outputs | `supabase/functions/ia-*` | Medio | Fase de IA backend | Padronizar payloads por tipo canonico |
