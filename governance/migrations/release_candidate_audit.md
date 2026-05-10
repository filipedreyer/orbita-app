# Auditoria Release Candidate - Olys V2.2

## Estado

Release candidate tecnico preparado localmente na branch `migration/olys-v2-canonical`.

## Pronto

- Governanca canonica local existe e prevalece sobre codigo legado.
- Shell global usa TopBar, BottomNav e FloatingActionPair canonicos.
- Idea e porta canonica da IA contextual.
- Capturar usa superficie propria com grid canonico e entrada livre para Inbox.
- Dominio bloqueia criacao nova de `ideia` e `inegociavel`.
- Essencial protegido e condicao/flag vigente.
- Timeline possui lentes Calendario, Capacidade e Dependencias.
- Capacidade usa duracao, janela ou esforco explicito e comunica `unknown`, `incompleto` e `parcial`.
- Admin falha fechado quando role nao pode ser confirmada.
- Storage novo passa por adapter com signed URL.
- Lint global esta zerado.

## Nao pronto

- Supabase remoto nao foi migrado nem validado.
- Bootstrap operacional do primeiro Admin nao foi executado.
- Dados reais legados `ideia` e `inegociavel` nao foram inventariados nem migrados.
- Schema final de anexos com `bucket/path` ainda nao existe.
- Asset oficial da marca Olys ainda nao foi aplicado.
- Busca global e destinos canonicos de Menu/Acesso ainda sao dividas.

## Cleanup executado

- `BottomTabs` e `FloatingButtons` removidos por nao serem usados.
- `IAChatDrawer` e `IAReportDrawer` removidos por nao serem usados e por nao serem a superficie canonica de IA.
- Hooks/contextos foram separados dos providers para zerar lint de Fast Refresh.
- Efeitos com `setState` sincronico foram ajustados de forma local.
- Ritual, Encerramento e IA mockada tiveram linguagem de `foco` reduzida onde era dominio.

## Blockers operacionais

- Aplicar e validar `supabase/migrations/20260510000000_security_phase_6.sql`.
- Conceder role Admin por processo controlado fora do browser.
- Validar buckets privados, signed URLs e ownership em ambiente real.
- Fazer backup e inventario antes de qualquer migracao real de tipos legados.

## Residual arquitetural

- `focusItems` permanece como nome tecnico legado interno.
- `overloadByItems` permanece como campo legado zerado para compatibilidade.
- IA ainda usa adapters para estados canonicos de capacidade.
- Rotas compativeis como `/planejar/inegociaveis` permanecem ate migracao real.

## QA

- `npm run build`: passou.
- `npm run regression:smoke`: passou.
- `npm run lint`: passou.
- ESLint direcionado aos arquivos alterados/criados na Fase 9: passou.
