# Checklist Release Candidate V2.2

## Arquitetura

- [x] Documentacao canonica prevalece sobre codigo.
- [x] Shell global canonico ativo.
- [x] Idea e porta canonica de IA.
- [x] Capturar e superficie transversal.
- [x] Essencial protegido nao e entidade.
- [x] Timeline usa lentes Calendario, Capacidade e Dependencias.
- [x] Capacidade comunica incerteza sem falsa precisao.
- [x] Direcao substitui Foco como dominio.

## QA

- [x] Build passou.
- [x] Smoke passou.
- [x] Lint global passou.
- [x] Componentes depreciados nao usados foram removidos.
- [x] Nenhuma migration remota foi aplicada nesta fase.

## Seguranca

- [x] Admin falha fechado no frontend.
- [x] Migration SQL de seguranca esta versionada.
- [x] Storage novo passa por adapter.
- [x] `service_role` nao foi introduzido no frontend.
- [ ] Supabase remoto validado operacionalmente.
- [ ] Bootstrap Admin executado por runbook seguro.

## Dados

- [x] Criacao nova de tipos legados bloqueada no frontend.
- [x] Leitura legada preservada.
- [ ] Inventario real de `ideia` e `inegociavel`.
- [ ] Migracao real com backup e rollback.
