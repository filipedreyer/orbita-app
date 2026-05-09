# Auditoria Shell Global - Fase 2

## Escopo auditado

- `src/app/OlysShell.tsx`
- `src/components/navigation/TopBarOlys.tsx`
- `src/components/navigation/BottomNavOlys.tsx`
- `src/components/navigation/FloatingActionPair.tsx`
- `src/components/navigation/OlysBrand.tsx`
- `src/app/AppLayout.tsx`
- `src/app/routes.ts`

## Aderente

- TopBar contem menu, marca Olys, Acesso, Inbox e Busca.
- TopBar nao contem IA fixa.
- TopBar nao contem Capturar.
- TopBar nao contem Admin como item primario.
- BottomNav contem somente Fazer, Planejar e Memoria.
- FloatingActionPair contem Idea e Capturar.
- Idea e Capturar sao icon-only visualmente e possuem `aria-label`.
- Acesso, Inbox e Busca sao icon-only visualmente e possuem `aria-label`.
- Inbox usa dot contextual, sem badge numerico global.
- Memoria usa `LibraryBig`, nao sino.
- Acesso usa `UserCircle`, nao cadeado.
- AppLayout delega o shell para `OlysShell`.

## Aceito temporariamente

- Menu aponta para `routes.central` como fallback funcional.
- Acesso aponta para `routes.central` como fallback funcional.
- Busca aponta para `routes.memoria` como fallback funcional.
- OlysBrand usa fallback visual com monograma e texto Olys porque asset oficial ainda nao existe no repo.
- `BottomTabs` e `FloatingButtons` foram preservados para reduzir risco, mas nao sao usados pelo shell atual.

## Divida

- Criar destinos canonicos para Menu e Acesso.
- Criar rota/componente de Busca global real.
- Substituir fallback de marca por asset oficial.
- Migrar Idea para uma superficie de apoio contextual que nao dependa conceitualmente de chat legado.
- Remover ou isolar componentes depreciados em fase de limpeza segura.

## Blocker

Nenhum blocker para concluir a Fase 2 do Shell Global.

## Proxima correcao

Antes da fase completa de IA, definir contrato de destino para Idea: abrir apoio contextual com confirmacao humana e sem promover chat/relatorios a navegacao primaria.

