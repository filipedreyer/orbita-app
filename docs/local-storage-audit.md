# Auditoria de Persistência Local

Fonte auditada: `C:\Users\filip\órbita\files\orbita-final`

## Uso encontrado no código atual

| Chave | Origem | Classificação | Decisão |
|---|---|---|---|
| `theme-mode` implícita (`KEY`/`THEME_KEY` nos providers de tema) | `src/context/ThemeContext.tsx`, `src/theme/ThemeProvider.tsx` | Preferência de UI | Pode permanecer em persistência local no novo PWA |
| `orbita-onboarding-done` | `src/screens/onboarding/OnboardingScreen.tsx` | Estado de negócio leve de experiência | Migrar para store/supabase no novo app |

## Chaves exigidas pelo adendo para migração

Essas chaves não apareceram no código fonte auditado atual, então trato como legado externo ou comportamento já removido:

| Chave/estado | Classificação | Decisão |
|---|---|---|
| ritual concluído | Estado de negócio | Migrar para Supabase/store se reaparecer |
| ordem do dia | Estado de negócio | Migrar para Supabase/store se reaparecer |
| revisão semanal resultado | Estado de negócio | Migrar para Supabase/store se reaparecer |
| lembretes dispensados | Estado de negócio | Migrar para Supabase/store se reaparecer |
| marcos de hábito vistos | Estado de negócio | Migrar para Supabase/store se reaparecer |
| onboarding concluído | Estado de negócio | Migrar |
| banners administrativos vistos | Preferência de UI | Pode continuar em persistência local |

## Observações

- O projeto atual usa `AsyncStorage`, não `localStorage`, por ser Expo/React Native.
- Não encontrei persistência local de estado de negócio além do onboarding.
- Na Fase 1 do PWA, nenhuma nova chave de persistência local foi criada para estado de negócio.
