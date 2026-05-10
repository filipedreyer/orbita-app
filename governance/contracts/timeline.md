# Contrato - Timeline

## Canonico

Timeline e a visao temporal unica do Olys. Calendario, Capacidade e Dependencias sao lentes sobre a mesma linha temporal.

## Regras

- Timeline nao cria nova navegacao principal.
- Calendario e a lente base de leitura temporal.
- Capacidade nao substitui Calendario.
- Dependencias nao substituem Calendario.
- Itens sem data, horario, duracao ou esforco explicito nao podem gerar falsa precisao temporal.
- Evento sem janela clara deve aparecer como informacao incompleta quando usado em capacidade.
- Lembrete sem duracao nao ocupa capacidade comprometida por padrao.
- Essencial protegido nao ocupa capacidade automaticamente.
- Dependencia exige relacao qualificada de impacto, como `blocked_by`.
- Vinculo com Meta ou Projeto orienta Direcao, mas nao e dependencia.

## Enforcement Fase 8

- `TimelinePage` usa lentes `calendar`, `capacity` e `dependencies`.
- `getTimelineLens` centraliza a validacao de lente.
- Lente de Capacidade usa `getCapacityStatus`, nao contagem simples de cards.
- Lente de Dependencias usa `getDependencyImpact` para diferenciar bloqueio, incompleto e ausencia de dependencia.
