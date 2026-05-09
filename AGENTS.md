# Olys V2.2 - Governanca Canonica

Este repositorio ainda contem codigo legado parcialmente chamado Orbita. A documentacao canonica prevalece sobre o codigo quando houver divergencia.

## Prevalencia

1. Documentacao canonica > codigo existente.
2. Arquitetura > implementacao conveniente.
3. Governanca > velocidade local.
4. Contratos explicitos > comportamento implicito.
5. Semantica do produto > reaproveitamento de nomes legados.

## Produto

Olys e um sistema operacional pessoal orientado por reducao de carga cognitiva, protecao do essencial e alinhamento entre execucao diaria e direcao de medio/longo prazo.

Olys nao e task manager comum, chatbot, SaaS generico ou second brain tradicional.

## Conceitos Canonicos

- `Idea`: porta contextual icon-only da camada de Apoio Contextual de IA. Nao e entidade.
- `Capturar`: entrada transversal icon-only.
- `TopBar`: menu, marca Olys, Acesso, Inbox e Busca.
- `BottomNav`: Fazer, Planejar e Memoria.
- `FloatingActionPair`: Idea e Capturar.
- `Direcao` substitui Foco.
- `Cabe hoje` substitui Ainda cabe hoje.
- `Abrir o Dia` substitui Ritual do Dia.
- `Fechar o Dia` substitui Diario como botao principal.

## Regras de Shell

- IA nao fica fixa na TopBar.
- Relatorios de IA e leitura contextual nao ficam na TopBar.
- Capturar nao fica na TopBar.
- Central e Admin nao entram na navegacao primaria.
- Idea e Capturar nao entram na BottomNav.
- Acesso, Inbox, Busca, Idea e Capturar devem ser icon-only visualmente e ter `aria-label`.
- Inbox pode ter dot contextual, mas nao badge numerico global.
- Busca e busca; nao e IA.
- Memoria nao deve usar sino.
- Acesso nao deve usar cadeado.
- A marca vigente e Olys. Orbita so pode existir como legado documentado.

## Regras de IA

- IA e apoio contextual, nao chatbot central do produto.
- Acoes persistentes exigem confirmacao humana explicita.
- Sugestoes devem ser reversiveis ou claramente auditaveis.
- IA nao cria novas entidades canonicas.
- Idea nao pode virar tipo, rota primaria ou entidade persistente.

## Regras de Migracao

- Mapear antes de alterar.
- Preferir refatoracoes pequenas e verificaveis.
- Preservar rotas existentes quando isso reduzir risco.
- Marcar desvios temporarios como divida, nunca como decisao final.
- Nao remover dados legados sem inventario e plano de migracao.
- Nao fazer redesign visual amplo durante fases de arquitetura.

## QA Obrigatorio

- `npm run build`
- `npm run regression:smoke`
- `npm run lint`

Se lint falhar por baseline preexistente, registrar total antes/depois, arquivos afetados e se houve erro novo em arquivo alterado.

## Confirmacao Humana

Exigir confirmacao antes de:

- migrar ou remover dados persistidos;
- alterar RLS, storage, auth ou Admin;
- remover rotas existentes;
- transformar entidades canonicas;
- executar mudancas destrutivas no Git ou filesystem.

