# Contrato - Direcao

## Canonico

Direcao conecta planejamento e execucao sem transformar todo item importante em urgencia.

## Regras

- Direcao substitui linguagem legada de foco.
- Vínculo com Meta ou Projeto e sinal de alinhamento, nao dependencia.
- Essencial protegido protege importancia sistemica, nao infla prioridade operacional.
- Fazer deve mostrar quando a execucao esta solta, mas sem inventar relacao.
- Planejar deve aplicar protecao a entidades existentes, nao criar tipo novo.

## Enforcement Fase 7

- Planejar usa `Essencial protegido` como condicao aplicada.
- Onboarding normaliza sugestoes legadas para `essencial_protegido` e nao cria entidade.
- Revisao semanal conta entidades protegidas por flag e separa leitura legada.

## Enforcement Fase 8

- `getDirectionStatus` centraliza leitura de Direcao no dominio de Fazer.
- Direcao usa vinculo com Meta/Projeto e Essencial protegido como sinais de orientacao.
- Direcao nao vira score numerico nem gamificacao.
- Quando nao houver dado suficiente, Direcao usa `unknown` ou `incompleto`.
- `focusItems` permanece apenas como nome tecnico legado de colecao, nao como termo de dominio visivel.
