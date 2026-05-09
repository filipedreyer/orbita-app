# Divergencias de Dominio

| Divergencia | Severidade | Impacto | Risco | Arquivos afetados | Esforco | Dependencias | Recomendacao |
|---|---|---|---|---|---|---|---|
| `ideia` ainda pode existir como tipo | Alta | Idea canonica nao e entidade | Quebra de dados se removido sem plano | `src/lib/types.ts`, telas de memoria | Alto | Inventario | Planejar migracao controlada |
| `inegociavel` como entidade | Media | Essencial protegido pode estar modelado como entidade | Simplificacao indevida | `src/lib/types.ts`, Planejar/Fazer | Alto | Decisao canonica | Auditar antes de alterar |
| Linguagem Ritual/Diario persiste | Media | Semantica antiga | Confusao de jornada | Rotas e telas Fazer | Medio | Fase Fazer | Migrar labels e aliases |

## Atualizacao Fase 5

| Divergencia | Status | Decisao |
|---|---|---|
| `ideia` como criacao nova | Mitigada | `ideia` permanece apenas para leitura legada; criacao nova usa `nota` quando entrada antiga de IA retorna ideia. |
| `inegociavel` como criacao nova | Mitigada | Criacao nova de legado foi bloqueada; leitura/edicao de registros antigos permanece para nao quebrar dados. |
| Tipos canonicos dispersos | Mitigada | `src/lib/entity-domain.ts` centraliza matriz, tipos canonicos, depreciados e helpers. |
| Essencial protegido como entidade | Parcialmente mitigada | Contrato define condicao/flag; migracao completa de dados ainda depende de inventario. |
| Agenda versus Evento | Aceito temporariamente | Agenda e superficie/categoria; persiste como `evento` ate decisao de schema. |
| Lembrete sem data em fluxo novo | Mitigada | `StructuredCaptureForm` bloqueia criacao de lembrete sem data. |
| Anexos via `image_url` legado | Divida | Documentado como metadata/storage provisoria; correcao real pertence a fase de seguranca/storage. |
