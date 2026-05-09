# Auditoria Capturar, Inbox e Caixola - Fase 4

## Escopo auditado

- `src/features/capture/*`
- `src/features/memoria/InboxPage.tsx`
- `src/features/memoria/CaixolaPage.tsx`
- `src/features/memoria/components/*`
- `src/store/index.ts`
- `src/services/items.ts`

## Aderente

- Capturar permanece acionado pelo FloatingActionPair.
- Capturar abre superficie propria, nao pagina persistente.
- Capturar usa grid conceitual 3x4.
- Input livre envia para Inbox.
- Grid representa Meta, Projeto, Tarefa, Habito, Rotina, Agenda, Evento, Lembrete, Nota, Lista, Templates e Inbox.
- Grid nao inclui Idea, IA, Admin, Central, Arquivados, Essencial protegido ou Inegociavel.
- Inbox foi mantida como triagem transitoria.
- Conversao da Inbox preserva origem por metadados no item criado.
- Adiamento preserva origem e contexto de revisita.
- Descarte da Inbox possui confirmacao minima.
- Caixola foi posicionada como incubacao/recuperacao.
- Sugestoes em Caixola abrem revisao/confirmacao e nao convertem automaticamente.

## Aceito temporariamente

- Agenda usa o tipo tecnico `evento`, pois nao existe entidade `agenda` no modelo atual.
- Capturas com anexo ainda usam fallback legado `image_url`.
- Origem de Inbox nao tem coluna dedicada; origem e preservada no item convertido.
- Sugestoes de Caixola usam heuristica local em vez de edge function dedicada.
- `QuickCaptureComposer` permanece no codigo legado, mas a superficie canonica usa `QuickCaptureInput`.

## Divida

- Criar schema dedicado para origem e anexos de Inbox.
- Separar Agenda de Evento apenas se a documentacao canonica exigir entidade propria.
- Criar IA real de agrupamento/vinculo/promocao da Caixola com outputs tipados.
- Remover `ideia` e `inegociavel` do modelo de Capturar somente apos inventario de dados.
- Revisar labels acentuados legados em arquivos com encoding antigo.

## Blocker

Nenhum blocker para concluir a Fase 4 sem migrar o modelo completo.

## Proxima correcao

Executar fase de dominio/vocabulario para remover ou migrar tipos legados com inventario de dados.

