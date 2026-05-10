# Backlog de Migracao

## P0

- Consolidar governanca local no repositorio.
- Auditar Shell Global contra Olys V2.2.
- Garantir que lint nao piore em arquivos alterados.

## P1

- Aplicar e validar migration `20260510000000_security_phase_6.sql` no Supabase remoto.
- Definir bootstrap controlado do primeiro Admin em `user_roles`.
- Criar schema dedicado de anexos com `bucket/path` para refresh de signed URLs.
- Criar destino canonico para Menu e Acesso.
- Criar busca global real.
- Substituir fallback de Olys por asset oficial.
- Padronizar edge functions para outputs canonicos de IA.
- Versionar matriz de dominio no backend e impedir criacao externa de tipos depreciados.
- Migrar IA onboarding de `inegociavel` para essencial protegido como condicao.
- Renomear aliases internos de Fazer/IA para Essencial protegido apos inventario.

## P2

- Inventariar dados para remover ou migrar `ideia` como entidade.
- Revisar semantica de `inegociavel`.
- Migrar linguagem de Ritual/Diario para Abrir o Dia/Fechar o Dia.
- Definir destino canonico de Agenda versus Evento.
- Criar schema dedicado de origem/anexos da Inbox.
- Evoluir sugestoes da Caixola para IA tipada real.
- Criar schema proprio para Templates ou formalizar persistencia como Nota com metadata.
- Migrar registros legados `ideia` para `nota` apos inventario.
- Migrar registros legados `inegociavel` para entidade elegivel com flag de essencial protegido apos inventario.
- Renomear `focusItems` para nome tecnico neutro sem alterar semantica de Direcao.
- Atualizar IA para consumir estados canonicos de capacidade: `unknown`, `incompleto`, `parcial`, `balanced`, `loaded`, `overloaded`.
- Remover `overloadByItems` quando nenhum consumidor depender de contagem como fallback legado.
- Inventariar metadata de duracao, janela e esforco antes de qualquer calibracao fina de capacidade.
- Remover rota/nomes compatíveis de `inegociaveis` quando dados legados estiverem migrados.

## P3

- Criar UI administrativa de audit log apos roles remotas estarem validadas.
- Avaliar remocao de rotas legadas somente apos inventario real e backup.
