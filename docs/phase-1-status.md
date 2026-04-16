# Fase 1 - Status Consolidado

Este documento registra o estado real da Fase 1 antes do início da Fase 2.

## Limitações explicitamente assumidas

### 1. Auth ainda não validado com backend real

O fluxo de autenticação foi implementado estruturalmente no frontend:

- login
- signup
- forgot password
- reset password via link
- rotas públicas e protegidas

Porém, ele ainda **não foi validado ponta a ponta contra um backend Supabase real com credenciais reais e templates/regras reais de email**. A base está pronta, o build passa, mas a validação operacional com backend real continua pendente.

### 2. Store Zustand ainda é base

O store Zustand atual foi trazido como base funcional para a nova aplicação e reaproveita a direção do projeto anterior, mas ele **ainda não representa a modelagem final completa da nova arquitetura Órbita**.

Ainda faltam expansões previstas para as próximas fases, incluindo:

- slices e seletores mais específicos por domínio
- regras de capacidade
- regras de zonas
- regras de inegociáveis
- adaptação mais profunda às telas e fluxos novos

### 3. Páginas principais ainda são placeholders estruturais

As áreas principais do app já existem no roteamento e na estrutura de pastas:

- Fazer
- Planejar
- Memória
- Central

Mas essas páginas ainda são **placeholders estruturais**, usadas para consolidar:

- layout global
- navegação
- separação arquitetural por áreas
- base visual inicial

Elas ainda não correspondem à implementação final de comportamento, composição interna e design detalhado definidos na spec.
