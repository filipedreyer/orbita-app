# Contrato - Entidades

## Canonico

Entidades representam objetos persistentes do dominio. `Idea` nao e entidade. Essencial protegido tambem nao deve virar entidade por conveniencia tecnica.

## Regras

- Nao remover tipos legados sem inventario de dados.
- Nao introduzir novas entidades sem documentacao canonica.
- Nao tratar `Idea` como tipo persistente.
- `Direcao` deve prevalecer sobre nomenclatura legada de foco.

## Fora de escopo nesta fase

- Migrar `ideia` ou `inegociavel` no modelo.
- Alterar tabelas ou storage.

## Matriz canonica Fase 5

| Superficie | Persistencia canonica | Regra |
|---|---|---|
| Meta | `meta` | Resultado ou direcao de medio/longo prazo. |
| Projeto | `projeto` | Conjunto de execucao com progresso e vinculos. |
| Tarefa | `tarefa` | Unidade executavel. |
| Habito | `habito` | Comportamento recorrente monitoravel. |
| Rotina | `rotina` | Sequencia recorrente, podendo receber condicao de essencial protegido. |
| Agenda | Provisorio: categoria de `evento` | Superficie de calendario; nao deve ser sinonimo invisivel de Evento sem decisao futura. |
| Evento | `evento` | Item datado em calendario. |
| Lembrete | `lembrete` | Item com data obrigatoria. |
| Nota | `nota` | Registro informacional. |
| Lista | `lista` | Colecao simples de itens. |
| Template | Provisorio: `nota` com metadata futura | Modelo reutilizavel; schema dedicado ainda pendente. |
| Inbox | Camada transitoria | Triagem, nao backlog e nao entidade final. |

## Tipos canonicos persistentes

`meta`, `projeto`, `tarefa`, `habito`, `rotina`, `evento`, `lembrete`, `nota`, `lista`.

Novos fluxos devem usar `canonicalEntityTypes` e `assertNewEntityType` em `src/lib/entity-domain.ts`.

## Tipos depreciados

- `ideia`: legado de dados. Normalizacao temporaria para `nota`. `Idea` canonica e porta de IA contextual, nao entidade.
- `inegociavel`: legado de dados. Normalizacao temporaria para `rotina`. Essencial protegido e condicao/flag aplicada a entidades elegiveis, nao entidade.

Leitura legada permanece permitida ate inventario seguro. Criacao nova, duplicacao e promocao para tipos depreciados ficam bloqueadas.

## Metadata canonica minima

- `essential_protected` / `essencial_protegido`: compatibilidade temporaria para condicao de essencial protegido.
- `inbox_origin`: origem de captura/conversao, preservando rastreabilidade quando item sai da Inbox.
- `attachments`: relacao/metadata provisoria para anexos. `image_url` legado nao e solucao final de storage.

## Agenda, Evento e Lembrete

- Agenda permanece como superficie/categoria provisoria e persiste tecnicamente como `evento` ate decisao de schema.
- Evento e entidade distinta de item executavel.
- Lembrete deve ter data para ser criado em fluxos novos.

## Essencial protegido - Fase 7

- Essencial protegido e condicao/flag, nao entidade.
- Pode ser aplicado apenas a entidades elegiveis: `meta`, `projeto`, `tarefa`, `habito`, `rotina`.
- Nao significa automaticamente urgente.
- Nao significa automaticamente atrasado.
- Nao significa sempre executar hoje.
- O helper canonico fica em `src/lib/entity-domain.ts`: `isProtectedEssential`, `canReceiveProtectedEssential`, `applyProtectedEssentialFlag`, `isLegacyInegociavel`, `normalizeLegacyInegociavel`.
- `inegociavel` permanece apenas como leitura legada ate inventario e migracao segura.
