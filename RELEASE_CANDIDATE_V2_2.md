# Olys V2.2 - Release Candidate Tecnico

## Status

O repositorio esta pronto como release candidate tecnico local do Olys V2.2, com blockers operacionais separados de blockers arquiteturais.

## Pronto para RC

- Shell global canonico.
- IA contextual via Idea.
- Capturar, Inbox e Caixola alinhados.
- Dominio canonico com bloqueio de criacao nova de tipos legados.
- Essencial protegido como flag/condicao.
- Timeline com Calendario, Capacidade e Dependencias.
- Capacidade sem falsa precisao por contagem simples nos fluxos principais.
- Admin fail closed.
- Storage novo via adapter.
- Governanca, auditorias e planos versionados.
- Build, smoke e lint passando localmente.

## Nao pronto para release final

- Supabase remoto nao validado.
- Migrations nao aplicadas remotamente nesta fase.
- Bootstrap Admin nao executado.
- Dados reais legados nao migrados.
- Schema final de anexos ainda pendente.
- Busca global, asset oficial e destinos finais de Menu/Acesso ainda pendentes.

## Blockers operacionais

- Aplicar e validar migrations no Supabase remoto.
- Conceder primeiro Admin por processo seguro.
- Inventariar dados `ideia` e `inegociavel` antes de migrar.
- Implementar schema de anexos com `bucket/path`.

## Divida pos-RC

- Renomear aliases internos `focusItems` e `inegociavel` apos migracao real.
- Atualizar IA para consumir estados canonicos completos sem adapter.
- Remover rotas compativeis apos inventario e rollback testado.
- Integrar asset oficial Olys.

## Recomendacao

Criar checkpoint Git da Fase 9 e, apos revisao humana, tag `olys-v2-rc1`.
