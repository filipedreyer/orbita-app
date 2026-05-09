# Divergencias de UI

| Divergencia | Severidade | Impacto | Risco | Arquivos afetados | Esforco | Dependencias | Recomendacao |
|---|---|---|---|---|---|---|---|
| Busca temporariamente navega para Memoria | Media | Nao entrega busca global | Usuario interpretar Memoria como busca | `TopBarOlys.tsx` | Medio | Busca global | Marcar como divida e migrar em fase propria |
| Menu e Acesso navegam para Central | Media | Central segue como fallback funcional | Central parecer primaria | `TopBarOlys.tsx` | Medio | Superficies dedicadas | Criar destinos canonicos |
| Fallback textual/monograma da marca | Baixa | Asset oficial ausente | Fallback virar definitivo | `OlysBrand.tsx` | Baixo | Asset oficial | Substituir quando asset chegar |
| Componentes legados preservados | Baixa | Codigo morto temporario | Uso acidental futuro | `BottomTabs.tsx`, `FloatingButtons.tsx` | Baixo | Nenhuma | Depreciar e remover em limpeza segura |

