# Hooks Inventory

## useConfirm
- Arquivo: `src/components/common/ConfirmModal.tsx`
- Entradas: nenhuma
- Retorno:
  - `confirm(nextConfig)`
  - `ConfirmElement`
- Areas afetadas: confirmacoes genericas de UI
- Dependencias criticas: depende do componente `Button`; controla modal local por estado interno

## useActionFeedback
- Arquivo: `src/components/feedback/ActionFeedbackProvider.tsx`
- Entradas: nenhuma
- Retorno:
  - `showFeedback(message, options?)`
- Areas afetadas: feedback global de acoes em Fazer, Memoria, IA e encerramento
- Dependencias criticas: exige `ActionFeedbackProvider` acima na arvore; usa animacao com Framer Motion

## useAuth
- Arquivo: `src/features/auth/AuthProvider.tsx`
- Entradas: nenhuma
- Retorno:
  - `session`
  - `loading`
- Areas afetadas: autenticacao e gating de rotas
- Dependencias criticas: depende de `AuthProvider`, `onAuthStateChange` e `useAuthStore`

## useIA
- Arquivo: `src/features/ia/useIA.ts`
- Entradas: nenhuma
- Retorno: contexto completo de IA mockada provido pelo `IAProvider`
- Areas afetadas: Fazer, Memoria, Planejar e drawers de IA
- Dependencias criticas: exige `IAProvider`; nao faz chamadas reais de backend

## useOnboarding
- Arquivo: `src/features/onboarding/OnboardingProvider.tsx`
- Entradas: nenhuma
- Retorno:
  - `isPending(area)`
  - `dismissArea(area)`
  - `resetAll()`
- Areas afetadas: onboarding de Fazer, Memoria e Planejar
- Dependencias criticas: exige `OnboardingProvider`; persiste em `localStorage`

## usePwa
- Arquivo: `src/features/pwa/PwaProvider.tsx`
- Entradas: nenhuma
- Retorno:
  - `canInstall`
  - `isInstalled`
  - `isOfflineReady`
  - `isOnline`
  - `installApp()`
- Areas afetadas: Central, Admin e readiness de deploy
- Dependencias criticas: exige `PwaProvider`; depende de eventos do browser (`beforeinstallprompt`, `appinstalled`)

## useHojeDomain
- Arquivo: `src/store/fazer.ts`
- Entradas: nenhuma
- Retorno: dominio derivado de Hoje via `deriveHojeDomain(items, today(), ritualOrder)`
- Areas afetadas: Hoje, Timeline e partes de Fazer que dependem da carga do dia
- Dependencias criticas: consome `useDataStore` (`items`, `ritualOrder`) e dominio Fazer

## useHojeProjection
- Arquivo: `src/store/fazer.ts`
- Entradas: nenhuma
- Retorno: projecao de UI de Hoje via `projectHojeSections(items, today(), ritualOrder)`
- Areas afetadas: `HojePage`
- Dependencias criticas: consome `useDataStore` (`items`, `ritualOrder`) e projecoes Fazer

## useRitualDomain
- Arquivo: `src/store/fazer.ts`
- Entradas: nenhuma
- Retorno: dominio derivado do Ritual via `deriveRitualDomain(items, today(), ritualOrder)`
- Areas afetadas: `RitualPage`
- Dependencias criticas: consome `useDataStore` (`items`, `ritualOrder`) e dominio Fazer

## useEncerramentoDomain
- Arquivo: `src/store/fazer.ts`
- Entradas: nenhuma
- Retorno: dominio derivado do Encerramento via `deriveEncerramentoDomain(items, today())`
- Areas afetadas: `EncerramentoPage`
- Dependencias criticas: consome `useDataStore` (`items`) e dominio Fazer

## usePlanejarDomain
- Arquivo: `src/store/planejar.ts`
- Entradas: nenhuma
- Retorno: dominio derivado de Planejar via `derivePlanejarDomain(items, today())`
- Areas afetadas: paginas e portfolio de Planejar
- Dependencias criticas: consome `useDataStore` (`items`) e dominio Planejar

## usePlanejarProjection
- Arquivo: `src/store/planejar.ts`
- Entradas: nenhuma
- Retorno: projecao de UI de Planejar via `projectPlanejarView(items, today())`
- Areas afetadas: vistas estruturadas de Planejar
- Dependencias criticas: consome `useDataStore` (`items`) e projecoes Planejar

## usePlanejarPortfolio
- Arquivo: `src/store/planejar.ts`
- Entradas: nenhuma
- Retorno: portfolio derivado via `derivePlanejarPortfolio(items, today())`
- Areas afetadas: `PlanearHomePage`, Revisao Semanal e paginas de Planejar
- Dependencias criticas: consome `useDataStore` (`items`) e derivacao de portfolio

## useAuthStore
- Arquivo: `src/store/index.ts`
- Entradas: seletores Zustand no ponto de consumo
- Retorno: estado e acoes de autenticacao
- Areas afetadas: app inteiro
- Dependencias criticas: e a fonte de verdade local para sessao; conversa com `services/auth`

## useDataStore
- Arquivo: `src/store/index.ts`
- Entradas: seletores Zustand no ponto de consumo
- Retorno: estado e acoes de dados (`items`, `inbox`, `subItems`, `ritualOrder` etc.)
- Areas afetadas: Fazer, Memoria, Planejar, captura e entity sheets
- Dependencias criticas: e a fonte de verdade local para dados do usuario; conversa com `services/items` e `services/profile`
