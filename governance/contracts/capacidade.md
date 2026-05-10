# Contrato - Capacidade

## Canonico

Capacidade comunica carga temporal ou operacional sem falsa precisao. Ela nao e contagem de itens e nao deve virar semaforo quando faltam dados.

## Regras

- Capacidade deve usar duracao, janela, esforco explicito ou regra equivalente quando existir.
- Quando faltar dado, usar estados `unknown`, `incompleto` ou `parcial`.
- Estados incompletos sao informativos e ativos, nao disabled.
- Lembrete sem duracao nao ocupa capacidade comprometida por padrao.
- Evento sem duracao ou janela clara nao deve receber duracao padrao silenciosa.
- Essencial protegido nao ocupa capacidade automaticamente.
- Dado legado `inegociavel` so contribui quando houver bloco/horas explicitadas.
- `length` e `count` podem apoiar leitura de listas, mas nao podem ser calculo final de capacidade.

## Enforcement Fase 8

- `getCapacityStatus` centraliza o estado canonico.
- `isCapacityComputable` explicita quando todos os itens relevantes tem dado suficiente.
- `getExplicitCapacityHours` aceita duracao, janela ou esforco explicito.
- `toAISuggestCapacitySignal` adapta estados canonicos para interfaces legadas de IA sem alterar a fonte de verdade.
