# Contrato - Hoje

## Canonico

Hoje e a camada de execucao do dia. Nao e backlog e nao deve transformar protecao sistemica em urgencia operacional automatica.

## Regras

- `Cabe hoje` e horizonte de execucao possivel, nao deposito.
- `Para fazer agora` deve refletir vencimento, atencao imediata e prioridade operacional real.
- Essencial protegido nao significa automaticamente urgente.
- Essencial protegido nao significa automaticamente atrasado.
- Essencial protegido nao significa sempre executar hoje.
- Registros legados `inegociavel` podem aparecer como leitura controlada de Essencial protegido.
- Dados legados nao devem quebrar Hoje, mas nao definem a semantica vigente.

## Enforcement Fase 7

- `getAttentionLevel` nao eleva tensao apenas por legado de Essencial protegido.
- `cuidado` nao inclui Essencial protegido automaticamente.
- `DayList` exibe registros legados como legado convertido em Essencial protegido.
- Bloco de capacidade legado foi relabelado como Essencial protegido legado.

## Enforcement Fase 8

- Hoje consome `capacity` e `direction` projetados pelo dominio.
- Header nao comunica capacidade por contagem simples de itens.
- Texto visivel evita `Foco` como termo de dominio.
- `Para fazer agora` continua como faixa operacional sem virar score ou gamificacao.
