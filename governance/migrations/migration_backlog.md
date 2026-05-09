# Backlog de Migracao

## P0

- Consolidar governanca local no repositorio.
- Auditar Shell Global contra Olys V2.2.
- Garantir que lint nao piore em arquivos alterados.

## P1

- Criar destino canonico para Menu e Acesso.
- Criar busca global real.
- Substituir fallback de Olys por asset oficial.
- Limpar drawers legados de IA depois da estabilizacao da Idea.
- Padronizar edge functions para outputs canonicos de IA.
- Versionar matriz de dominio no backend e impedir criacao externa de tipos depreciados.
- Migrar IA onboarding de `inegociavel` para essencial protegido como condicao.

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

## P3

- Revisar storage, signed URLs, RLS e Admin role.
