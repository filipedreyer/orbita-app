# Regras de Evolucao do Dominio

Este documento define onde cada tipo de logica pode viver nas proximas fases do Orbita.

## 1. Regras de negocio

Novas regras de negocio so podem existir em:

- `src/features/fazer/domain/canonical.ts`
- `src/features/fazer/domain/derived.ts`

Responsabilidades:

- `canonical.ts`: criterios canonicos, predicados e regras atomicas de dominio.
- `derived.ts`: agregacoes, composicoes e calculos derivados a partir das regras canonicas.

## 2. Projecoes para UI

`src/features/fazer/domain/projections.ts` nao pode conter logica de decisao de dominio.

`projections.ts` pode apenas:

- transformar dados derivados para consumo de UI
- montar estruturas de apresentacao
- reorganizar dados sem redefinir criterios

`projections.ts` nao pode:

- criar regra nova
- redefinir criterio de dominio
- recalcular decisao que deveria viver em `canonical.ts` ou `derived.ts`

## 3. Novas regras

Toda nova regra deve:

- ser nomeada explicitamente
- ter responsabilidade unica
- ser reutilizavel

Toda regra nova deve nascer no dominio antes de ser usada por paginas, wrappers ou componentes.

## 4. Paginas

Nenhuma pagina pode:

- recalcular regra de negocio
- redefinir criterio de dominio
- conter logica duplicada de dominio

Paginas podem apenas:

- consumir hooks, seletores e projecoes do dominio
- disparar acoes
- compor blocos de interface
- manter estado local estritamente visual

## 5. Ritual

O Ritual nao pode criar regras proprias paralelas ao dominio.

O Ritual deve:

- consumir regras existentes do dominio
- orquestrar fluxo e composicao
- disparar acoes do store

Se o Ritual precisar de um novo criterio, esse criterio deve ser criado primeiro em `canonical.ts` ou `derived.ts`.

## 6. Regra operacional

Resumo obrigatorio:

- `canonical.ts`: o que algo e
- `derived.ts`: o que resulta dessas regras
- `projections.ts`: como isso chega na UI
- paginas: como a UI consome isso
- Ritual: fluxo sobre o dominio, nunca dominio paralelo
