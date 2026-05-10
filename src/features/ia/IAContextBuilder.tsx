import { today } from '../../lib/dates';
import type { InboxItem, Item } from '../../lib/types';
import { deriveHojeDomain } from '../fazer/domain/derived';
import { isDiaryNote, isShortcutItem } from '../memoria/memory-helpers';
import { derivePlanejarPortfolio } from '../planejar/domain/derived';
import type { IAActionDescriptor, IAChatMessage, IAOnboardingStep, IAReportDescriptor, IARouteContext, IASuggestionDescriptor } from './types';

function action(id: string, label: string, intent: IAActionDescriptor['intent'], description: string): IAActionDescriptor {
  return { id, label, intent, description };
}

function suggestion(
  id: string,
  title: string,
  description: string,
  actions: IAActionDescriptor[],
  tone: IASuggestionDescriptor['tone'] = 'neutral',
): IASuggestionDescriptor {
  return { id, title, description, actions, tone };
}

function report(id: string, title: string, summary: string, highlights: string[]): IAReportDescriptor {
  return { id, title, summary, highlights };
}

function assistantMessage(id: string, content: string): IAChatMessage {
  return { id, role: 'assistant', content };
}

function onboardingStep(id: string, title: string, description: string, done: boolean): IAOnboardingStep {
  return { id, title, description, done };
}

export function buildIAContext({
  pathname,
  items,
  inbox,
}: {
  pathname: string;
  items: Item[];
  inbox: InboxItem[];
}): IARouteContext {
  const referenceDate = today();
  const hoje = deriveHojeDomain(items, referenceDate);
  const portfolio = derivePlanejarPortfolio(items, referenceDate);
  const notes = items.filter((item) => item.type === 'nota');
  const diaries = notes.filter(isDiaryNote);
  const shortcuts = items.filter(isShortcutItem);

  // TODO: CLAUDE — conectar com Edge Function ia-context
  // Input esperado: { pathname, todaySummary, inboxSummary, planningSummary, memorySummary }
  // Output esperado: { title, subtitle, visibleContext, suggestions, reports, chatMessages, onboardingSteps }

  if (pathname.startsWith('/fazer')) {
    const isRitual = pathname.includes('/ritual');
    const isTimeline = pathname.includes('/timeline');

    return {
      contextKey: pathname,
      area: 'fazer',
      routeLabel: isRitual ? 'Ritual' : isTimeline ? 'Timeline' : 'Hoje',
      title: 'IA de execucao do dia',
      subtitle: 'Mocks focados em priorizacao, capacidade e conflito com inegociaveis.',
      visibleContext: [
        `${hoje.focusItems.length} itens no dia`,
        `${hoje.overdueItems.length} atrasados`,
        hoje.capacity.committedHours === null ? `capacidade ${hoje.capacity.completeness}` : `${hoje.capacity.committedHours.toFixed(1)}h mapeadas`,
      ],
      suggestions: isRitual
        ? [
            suggestion(
              'fazer-ritual-sequencia',
              'Ajustar a sequencia do Ritual',
              'Mock de IA focado em ordem do dia, compromisso operacional e carga real.',
              [
                action('fazer-ajustar-ritual', 'Ajustar sequencia', 'Ajustar', 'Reordenar mantendo o Ritual como centro de decisao.'),
                action('fazer-reprogramar-ritual', 'Reprogramar excesso', 'Reprogramar', 'Mover itens de menor impacto para aliviar a fila.'),
              ],
              'support',
            ),
          ]
        : isTimeline
          ? [
              suggestion(
                'fazer-timeline-conflito',
                'Ler conflitos da Timeline',
                'Mock visual para detectar choque entre carga, dependencias e blocos fixos.',
                [
                  action('fazer-organizar-timeline', 'Organizar blocos', 'Organizar', 'Redistribuir a execucao sem alterar a arquitetura do dia.'),
                  action('fazer-ajustar-dependencias', 'Ajustar dependencia', 'Ajustar', 'Sinalizar o proximo elo critico da cadeia.'),
                ],
                hoje.blockedInegociaveis.length > 0 ? 'warning' : 'neutral',
              ),
            ]
          : [
              suggestion(
                'fazer-capacidade',
                'Rebalancear o dia',
                'Ajuste visual para aliviar excesso de carga e abrir espaco para o que e inegociavel.',
                [
                  action('fazer-reprogramar', 'Reprogramar bloco', 'Reprogramar', 'Mover um lote de itens de menor impacto.'),
                  action('fazer-ajustar', 'Ajustar sequencia', 'Ajustar', 'Reordenar a execucao mantendo a estrutura do Ritual.'),
                ],
                hoje.capacity.signal === 'overloaded' ? 'warning' : 'support',
              ),
            ],
      reports: isRitual
        ? []
        : isTimeline
          ? [report('reportTimeline', 'Leitura da Timeline', 'Distribuicao de curto prazo e pressao entre dias proximos.', [])]
          : [report('reportHoje', 'Leitura de Hoje', 'Balanceamento do dia, direcao e risco imediato.', [])],
      chatMessages: [
        assistantMessage('fazer-msg-1', 'Posso ajudar a redistribuir o dia sem mexer no que o Ritual ja consolidou.'),
        assistantMessage('fazer-msg-2', 'Os mocks desta tela priorizam excesso de capacidade, inegociaveis e replanejamento simples.'),
      ],
      onboardingSteps: [],
    };
  }

  if (pathname.startsWith('/memoria')) {
    const isInbox = pathname.includes('/inbox');
    const isCaixola = pathname.includes('/caixola');

    return {
      contextKey: pathname,
      area: 'memoria',
      routeLabel: isInbox ? 'Inbox' : isCaixola ? 'Caixola' : 'Memoria',
      title: 'IA de memoria e organizacao',
      subtitle: 'Mocks focados em classificacao, vinculo de notas e transformacao de texto em acao.',
      visibleContext: [`${inbox.length} itens na inbox`, `${notes.length} notas`, `${diaries.length} diarios`, `${shortcuts.length} atalhos`],
      suggestions: isInbox
        ? [
            suggestion(
              'memoria-inbox-classificar',
              'Classificar a inbox',
              'Mock de IA para aceitar, descartar ou transformar capturas em algo utilizavel.',
              [
                action('memoria-classificar', 'Classificar lote', 'Organizar', 'Aplicar uma triagem visual inicial na fila.'),
                action('memoria-criar-nota', 'Criar nota organizada', 'Criar', 'Transformar a captura em nota com estrutura basica.'),
              ],
              'support',
            ),
          ]
        : isCaixola
          ? [
              suggestion(
                'memoria-caixola-vincular',
                'Vincular notas ao sistema',
                'Mock de IA para conectar notas, diarios e capturas a itens vivos do sistema.',
                [
                  action('memoria-vincular-projeto', 'Vincular a projeto', 'Vincular', 'Relacionar a nota a um projeto existente.'),
                  action('memoria-transformar-acao', 'Transformar em acao', 'Ajustar', 'Promover um trecho de texto a proximo passo.'),
                ],
                'neutral',
              ),
            ]
          : [
              suggestion(
                'memoria-classificar',
                'Classificar capturas e notas',
                'A IA mockada sugere transformar inbox em nota, vincular nota a projeto ou promover texto a acao.',
                [
                  action('memoria-criar', 'Criar nota organizada', 'Criar', 'Converter a captura atual em nota estruturada.'),
                  action('memoria-vincular', 'Vincular a projeto', 'Vincular', 'Relacionar nota ou insight a um projeto existente.'),
                ],
                'support',
              ),
            ],
      reports: [],
      chatMessages: [
        assistantMessage('memoria-msg-1', 'Posso sugerir como classificar capturas e conectar notas ao restante do sistema.'),
        assistantMessage('memoria-msg-2', 'Nesta fase tudo permanece mockado e contextual ao acervo visivel da Memoria.'),
      ],
      onboardingSteps: [],
    };
  }

  const isMetas = pathname.includes('/metas');
  const isProjetos = pathname.includes('/projetos');
  const isHabitos = pathname.includes('/habitos');
  const isInegociaveis = pathname.includes('/inegociaveis');
  const isRevisao = pathname.includes('/revisao-semanal');
  return {
    contextKey: pathname,
    area: 'planejar',
    routeLabel: pathname.includes('/revisao-semanal') ? 'Revisao semanal' : 'Planejar',
    title: 'IA de portfolio e direcionamento',
    subtitle: 'Mocks de onboarding, leitura simples do portfolio e sugestoes de ajuste.',
    visibleContext: [
      `${portfolio.goals.length} metas`,
      `${portfolio.projects.length} projetos`,
      `${portfolio.habits.length} habitos`,
      `${portfolio.inegociaveis.length} inegociaveis`,
    ],
    suggestions: isMetas
      ? [
          suggestion(
            'planejar-metas-ajuste',
            'Ajustar direcao das metas',
            'Mock de IA para revisar coerencia entre direcao declarada e projetos vinculados.',
            [
              action('planejar-ajustar-metas', 'Ajustar metas', 'Ajustar', 'Refinar o recorte das metas ativas.'),
              action('planejar-vincular-projetos', 'Vincular projetos', 'Vincular', 'Conectar metas a frentes concretas.'),
            ],
          ),
        ]
      : isProjetos
        ? [
            suggestion(
              'planejar-projetos-ajuste',
              'Reequilibrar projetos',
              'Mock de IA para destacar projetos sem meta ou com progresso minimo.',
              [
                action('planejar-ajustar-projetos', 'Ajustar projetos', 'Ajustar', 'Rever escopo e progresso minimo.'),
                action('planejar-organizar-projetos', 'Organizar carteira', 'Organizar', 'Ordenar projetos por clareza de avancos.'),
              ],
            ),
          ]
        : isHabitos
          ? [
              suggestion(
                'planejar-habitos-ajuste',
                'Apoiar consistencia',
                'Mock de IA para ajustar habitos com baixa consistencia sem criar analytics complexa.',
                [
                  action('planejar-ajustar-habitos', 'Ajustar habitos', 'Ajustar', 'Simplificar a carga recorrente.'),
                  action('planejar-organizar-habitos', 'Organizar recorrencia', 'Organizar', 'Redistribuir frequencias visualmente.'),
                ],
                'support',
              ),
            ]
          : isInegociaveis
            ? [
                suggestion(
                  'planejar-inegociaveis-ajuste',
                  'Proteger a agenda',
                  'Mock de IA para revisar inegociaveis e o impacto deles na semana.',
                  [
                    action('planejar-ajustar-inegociaveis', 'Ajustar restricoes', 'Ajustar', 'Rever regras minimas de protecao do dia.'),
                    action('planejar-organizar-inegociaveis', 'Organizar blocos', 'Organizar', 'Distribuir horarios e limites de forma legivel.'),
                  ],
                  'warning',
                ),
              ]
            : [
                suggestion(
                  'planejar-ajustes',
                  'Ajustar o portfolio atual',
                  'A IA mockada sugere vinculos simples entre metas, projetos e restricoes do sistema.',
                  [
                    action('planejar-ajustar', 'Ajustar carteira', 'Ajustar', 'Reequilibrar metas, projetos e restricoes.'),
                    action('planejar-vincular', 'Vincular projetos', 'Vincular', 'Conectar projetos sem meta a uma direcao clara.'),
                  ],
                ),
              ],
    reports: isRevisao
      ? [report('reportRevisao', 'Leitura da Revisao Semanal', 'Padroes da semana, acumulacao e coerencia mais ampla.', [])]
      : [report('reportPlanejar', 'Leitura de Planejar', 'Estrutura atual do portfolio e seus desequilibrios.', [])],
    chatMessages: [
      assistantMessage('planejar-msg-1', 'Posso explicar o portfolio atual e propor ajustes visuais antes de qualquer automacao real.'),
      assistantMessage('planejar-msg-2', 'Os mocks desta area leem metas, projetos, habitos e inegociaveis sem acoplar ao backend de IA.'),
    ],
    onboardingSteps: [
      onboardingStep('planejar-onboarding-1', 'Definir direcao', 'Escolher quais metas devem puxar a semana atual.', portfolio.goals.length > 0),
      onboardingStep('planejar-onboarding-2', 'Distribuir portfolio', 'Conectar projetos e habitos ao que realmente importa.', portfolio.projects.length > 0),
      onboardingStep('planejar-onboarding-3', 'Proteger a agenda', 'Validar inegociaveis antes de intensificar o plano.', portfolio.inegociaveis.length > 0),
    ],
  };
}
