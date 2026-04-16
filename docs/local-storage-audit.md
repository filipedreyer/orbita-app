# Auditoria de Persistência Local

Fonte auditada: `C:\Users\filip\órbita\files\orbita-final`

## Critério de classificação

- `estado de negócio`: deve sair da persistência local e ir para Supabase/store sincronizado.
- `preferência de UI`: pode continuar local.
- `cache temporário`: pode continuar local com descarte seguro.
- `obsoleto`: deve ser removido e não recriado.

## Chaves encontradas no código atual

| Chave | Origem | Classificação | Destino explícito |
|---|---|---|---|
| `orbita-onboarding-done` | `src/screens/onboarding/OnboardingScreen.tsx` | Estado de negócio | Migrar para store/Supabase no novo app; não persistir em `localStorage` |
| `KEY` / `THEME_KEY` de tema (`light`/`dark`/`auto`) | `src/context/ThemeContext.tsx`, `src/theme/ThemeProvider.tsx` | Preferência de UI | Pode permanecer em persistência local no PWA |

## Chaves exigidas pelo adendo

Estas chaves não apareceram no código-fonte auditado, então foram tratadas como legado externo ainda não visível no repositório atual:

| Chave/estado | Classificação | Destino explícito |
|---|---|---|
| ritual concluído | Estado de negócio | Migrar para store/Supabase se essa persistência reaparecer |
| ordem do dia | Estado de negócio | Migrar para store/Supabase se essa persistência reaparecer |
| revisão semanal resultado | Estado de negócio | Migrar para store/Supabase se essa persistência reaparecer |
| lembretes dispensados | Estado de negócio | Migrar para store/Supabase se essa persistência reaparecer |
| marcos de hábito vistos | Estado de negócio | Migrar para store/Supabase se essa persistência reaparecer |
| onboarding concluído | Estado de negócio | Migrar para store/Supabase |
| banners administrativos vistos | Preferência de UI | Pode continuar em persistência local |

## Categorias sem ocorrências confirmadas no código auditado

| Categoria | Chaves | Destino explícito |
|---|---|---|
| Cache temporário | Nenhuma chave confirmada | Manter local apenas se surgir um cache descartável e não ligado ao negócio |
| Obsoleto | Nenhuma chave confirmada | Eliminar imediatamente se alguma chave legada sem uso for encontrada |

## Observações

- O projeto atual usa `AsyncStorage`, não `localStorage`, por ser Expo/React Native.
- Não encontrei, no código auditado, persistência local confirmada para ritual, ordem do dia, revisão semanal, lembretes dispensados ou marcos de hábito vistos.
- Na Fase 1 do PWA, nenhuma nova chave de persistência local foi criada para estado de negócio.
