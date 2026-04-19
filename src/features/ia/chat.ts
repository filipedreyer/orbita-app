import { today } from '../../lib/dates';
import type { InboxItem, Item } from '../../lib/types';
import { deriveEncerramentoDomain, deriveHojeDomain } from '../fazer/domain/derived';
import { derivePlanejarPortfolio } from '../planejar/domain/derived';
import { readEncerramentoWithAI } from './encerramento';
import { runOnboardingWithAI } from './onboarding';
import { buildTodayReadPayload, readTodayWithAI } from './readToday';
import { reportHojeWithAI } from './reportHoje';
import { reportPlanejarWithAI } from './reportPlanejar';
import { reportRevisaoWithAI } from './reportRevisao';
import { reportTimelineWithAI } from './reportTimeline';
import { readRitualWithAI } from './ritual';
import { buildSuggestDayPayload, extendSuggestDayPayload, suggestDayWithAI } from './suggest';
import type { IAChatAction, IAChatIntent, IAChatResponse, IARouteContext } from './types';

type ChatDependencies = {
  pathname: string;
  routeContext: IARouteContext;
  items: Item[];
  inbox: InboxItem[];
};

function getExecutionLinkState(item: Item, itemsById: Map<string, Item>) {
  return Boolean(
    (item.goal_id && itemsById.has(item.goal_id)) ||
      (item.project_id && itemsById.has(item.project_id)) ||
      item.type === 'habito' ||
      item.type === 'rotina' ||
      item.type === 'inegociavel',
  );
}

function shiftDay(date: string, days: number) {
  const base = new Date(`${date}T12:00:00`);
  base.setDate(base.getDate() + days);
  return base.toISOString().slice(0, 10);
}

function getDaySignal(count: number, operationalHours: number): 'balanced' | 'loaded' | 'overloaded' {
  if (count > operationalHours + 1) return 'overloaded';
  if (count >= operationalHours) return 'loaded';
  return 'balanced';
}

function includesAny(text: string, patterns: string[]) {
  return patterns.some((pattern) => text.includes(pattern));
}

export function classifyChatIntent(message: string, pathname: string): IAChatIntent {
  const normalized = message.toLowerCase();

  if (
    includesAny(normalized, [
      'cria',
      'criar',
      'aceita',
      'aceitar',
      'vincula',
      'vincular',
      'adiar',
      'adia',
      'confirma',
      'confirmar',
      'executa',
      'fazer isso',
    ])
  ) {
    return 'action';
  }

  if (includesAny(normalized, ['relatorio', 'relatório', 'report', 'visao geral', 'visão geral'])) {
    return 'report';
  }

  if (
    includesAny(normalized, [
      'sugere',
      'sugerir',
      'sugest',
      'aliviar',
      'ajustar',
      'replanejar',
      'redistribuir',
      'manter',
      'adiaria',
      'adiar',
    ])
  ) {
    return 'suggestion';
  }

  if (pathname.includes('/timeline')) {
    return 'report';
  }

  return 'reading';
}

function buildActionProposal(message: string, pathname: string): IAChatResponse {
  const normalized = message.toLowerCase();
  const actions: IAChatAction[] = [];

  if (includesAny(normalized, ['adiar', 'adia'])) {
    actions.push({
      id: `chat-action-defer-${Date.now()}`,
      label: 'Preparar adiamento',
      intent: 'defer',
      payload: { surface: pathname },
    });
  } else if (includesAny(normalized, ['vincula', 'vincular'])) {
    actions.push({
      id: `chat-action-link-${Date.now()}`,
      label: 'Preparar vinculo',
      intent: 'link',
      payload: { surface: pathname },
    });
  } else if (includesAny(normalized, ['cria', 'criar', 'aceita', 'aceitar'])) {
    actions.push({
      id: `chat-action-create-${Date.now()}`,
      label: 'Preparar criacao',
      intent: 'create',
      payload: { surface: pathname },
    });
  } else {
    actions.push({
      id: `chat-action-confirm-${Date.now()}`,
      label: 'Preparar confirmacao',
      intent: 'confirm',
      payload: { surface: pathname },
    });
  }

  return {
    type: 'action',
    content: 'Posso preparar o proximo passo de forma estruturada, mas nada sera executado sem confirmacao explicita.',
    actions,
  };
}

async function buildReadingResponse({ pathname, items }: ChatDependencies): Promise<IAChatResponse> {
  const referenceDate = today();
  const hoje = deriveHojeDomain(items, referenceDate);
  const itemsById = new Map(items.map((item) => [item.id, item]));
  const linkedCount = hoje.focusItems.filter((item) => getExecutionLinkState(item, itemsById)).length;
  const standaloneCount = hoje.focusItems.length - linkedCount;

  if (pathname.includes('/ritual')) {
    const reading = await readRitualWithAI({
      risk: {
        overdueCount: hoje.overdueItems.length,
        revisitCount: items.filter((item) => (item.metadata as Record<string, unknown>)?.inbox_needs_revisit === true).length,
        staleCount: items.filter((item) => item.status === 'active' && !item.due_date).length,
      },
      capacity: {
        signal: getDaySignal(hoje.focusItems.length, hoje.capacity.operationalHours),
        agoraCount: hoje.focusItems.filter((item) => item.due_date === referenceDate || item.priority === 'alta').length,
      },
      direction: {
        linkedCount,
        standaloneCount,
      },
    });

    return {
      type: 'reading',
      content: reading ?? 'Leitura indisponivel agora para a abertura do dia.',
    };
  }

  if (pathname.includes('/encerramento')) {
    const encerramento = deriveEncerramentoDomain(items, referenceDate);
    const reading = await readEncerramentoWithAI({
      execution: {
        completedCount: encerramento.completedCount,
        openCount: hoje.focusItems.length,
        respectedInegociaveisCount: encerramento.respectedInegociaveisCount,
      },
      carryover: {
        unfinishedCount: hoje.focusItems.length,
        reconsiderCount: hoje.overdueItems.length,
      },
      attention: {
        overdueCount: hoje.overdueItems.length,
        revisitCount: items.filter((item) => (item.metadata as Record<string, unknown>)?.inbox_needs_revisit === true).length,
      },
    });

    return {
      type: 'reading',
      content: reading ?? 'Leitura indisponivel agora para o encerramento do dia.',
    };
  }

  if (pathname.includes('/hoje') || pathname.startsWith('/fazer')) {
    const agora = hoje.focusItems.filter((item) => item.due_date === referenceDate || item.priority === 'alta');
    const agoraIds = new Set(agora.map((item) => item.id));
    const cabe = hoje.focusItems.filter((item) => !agoraIds.has(item.id));
    const atencao = hoje.overdueItems;

    try {
      const reading = await readTodayWithAI(
        buildTodayReadPayload({
          agora,
          cabe,
          atencao,
          capacity: getDaySignal(agora.length, hoje.capacity.operationalHours),
          linked: linkedCount,
          standalone: standaloneCount,
          allItems: items,
        }),
      );

      return {
        type: 'reading',
        content: reading,
      };
    } catch {
      return {
        type: 'reading',
        content: 'Leitura indisponivel agora para esta superficie.',
      };
    }
  }

  return {
    type: 'reading',
    content: 'Esta superficie nao tem uma leitura direta dedicada no chat. Use os relatorios contextuais quando fizer sentido.',
    actions: [
      {
        id: `chat-open-report-${Date.now()}`,
        label: 'Preparar abertura de relatorio',
        intent: 'open',
        payload: { target: 'reports' },
      },
    ],
  };
}

async function buildSuggestionResponse({ pathname, items }: ChatDependencies): Promise<IAChatResponse> {
  const referenceDate = today();
  const hoje = deriveHojeDomain(items, referenceDate);
  const itemsById = new Map(items.map((item) => [item.id, item]));
  const activeItems = hoje.focusItems.filter((item) => item.status === 'active');
  const agoraCount = activeItems.filter((item) => item.due_date === referenceDate || item.priority === 'alta').length;
  const cabeCount = activeItems.length - agoraCount;

  if (!(pathname.includes('/hoje') || pathname.includes('/ritual') || pathname.includes('/timeline'))) {
    return {
      type: 'suggestion',
      content: 'Nao ha uma camada de sugestao contextual ativa para esta superficie.',
    };
  }

  let payload = buildSuggestDayPayload({
    items: activeItems,
    capacitySignal: getDaySignal(activeItems.length, hoje.capacity.operationalHours),
    agoraCount,
    cabeCount,
    referenceDate,
    fixedInegociaveis: hoje.fixedInegociaveis,
    capacityOnlyInegociaveis: hoje.capacityOnlyInegociaveis,
    blockedInegociaveis: hoje.blockedInegociaveis,
    linkedResolver: (item) => ({ linked: getExecutionLinkState(item, itemsById) }),
  });

  if (pathname.includes('/timeline')) {
    const nearbyDays = Array.from({ length: 3 }, (_, index) => {
      const date = shiftDay(referenceDate, index + 1);
      const scheduledCount = items.filter(
        (item) => item.status === 'active' && item.due_date === date && item.type !== 'evento' && item.type !== 'lembrete',
      ).length;
      return {
        date,
        signal: getDaySignal(scheduledCount, hoje.capacity.operationalHours),
        scheduledCount,
      };
    });
    payload = extendSuggestDayPayload(payload, { nearbyDays });
  }

  const suggestion = await suggestDayWithAI(payload);
  if (!suggestion || suggestion.suggestions.length === 0) {
    return {
      type: 'suggestion',
      content: 'Nao ha sugestoes relevantes agora para esta superficie.',
    };
  }

  return {
    type: 'suggestion',
    content: suggestion.summary,
    actions: [
      {
        id: `chat-suggestion-review-${Date.now()}`,
        label: 'Revisar sugestoes',
        intent: 'review',
        payload: {
          surface: pathname,
          summary: suggestion.summary,
        },
      },
      {
        id: `chat-suggestion-open-${Date.now()}`,
        label: 'Abrir superficie',
        intent: 'open',
        payload: {
          surface: pathname,
        },
      },
    ],
  };
}

async function buildReportResponse({ pathname, items }: ChatDependencies): Promise<IAChatResponse> {
  const referenceDate = today();
  const hoje = deriveHojeDomain(items, referenceDate);
  const portfolio = derivePlanejarPortfolio(items, referenceDate);
  const itemsById = new Map(items.map((item) => [item.id, item]));
  const linkedCount = hoje.focusItems.filter((item) => getExecutionLinkState(item, itemsById)).length;
  const standaloneCount = hoje.focusItems.length - linkedCount;

  if (pathname.includes('/timeline')) {
    const nearbyDays = Array.from({ length: 3 }, (_, index) => {
      const date = shiftDay(referenceDate, index + 1);
      const scheduledCount = items.filter(
        (item) => item.status === 'active' && item.due_date === date && item.type !== 'evento' && item.type !== 'lembrete',
      ).length;
      return {
        date,
        signal: getDaySignal(scheduledCount, hoje.capacity.operationalHours),
        scheduledCount,
      };
    });
    const report = await reportTimelineWithAI({
      selectedDay: {
        date: referenceDate,
        signal: getDaySignal(hoje.focusItems.length, hoje.capacity.operationalHours),
        itemCount: hoje.focusItems.length,
        operationalHours: hoje.capacity.operationalHours,
      },
      nearbyDays,
      constraints: {
        fixedInegociaveisCount: hoje.fixedInegociaveis.length,
        blockedInegociaveisCount: hoje.blockedInegociaveis.length,
      },
    });

    return {
      type: 'report',
      content: report ? report.blocks.map((block) => `${block.title}: ${block.description}`).join(' ') : 'Relatorio indisponivel agora para a Timeline.',
      actions: report
        ? [
            {
              id: `chat-report-timeline-${Date.now()}`,
              label: 'Preparar abertura do relatorio',
              intent: 'open',
              payload: { reportId: 'reportTimeline' },
            },
            {
              id: `chat-report-timeline-review-${Date.now()}`,
              label: 'Revisar blocos',
              intent: 'review',
              payload: { reportId: 'reportTimeline' },
            },
          ]
        : [],
    };
  }

  if (pathname.includes('/revisao-semanal')) {
    const report = await reportRevisaoWithAI({
      weekly: {
        completedThisWeek: portfolio.weeklyReview.completedThisWeek,
        overdueOpenCount: portfolio.weeklyReview.overdueOpenCount,
        activeCount: items.filter((item) => item.status === 'active').length,
      },
      portfolio: {
        goalsCount: portfolio.goals.length,
        projectsCount: portfolio.projects.length,
        habitsCount: portfolio.habits.length,
        inegociaveisCount: portfolio.inegociaveis.length,
      },
      balance: {
        linkedCount,
        standaloneCount,
      },
    });

    return {
      type: 'report',
      content: report ? report.blocks.map((block) => `${block.title}: ${block.description}`).join(' ') : 'Relatorio indisponivel agora para a Revisao Semanal.',
      actions: report
        ? [
            {
              id: `chat-report-revisao-${Date.now()}`,
              label: 'Preparar abertura do relatorio',
              intent: 'open',
              payload: { reportId: 'reportRevisao' },
            },
            {
              id: `chat-report-revisao-review-${Date.now()}`,
              label: 'Revisar blocos',
              intent: 'review',
              payload: { reportId: 'reportRevisao' },
            },
          ]
        : [],
    };
  }

  if (pathname.startsWith('/planejar')) {
    const report = await reportPlanejarWithAI({
      structure: {
        goalsCount: portfolio.goals.length,
        projectsCount: portfolio.projects.length,
        habitsCount: portfolio.habits.length,
        inegociaveisCount: portfolio.inegociaveis.length,
      },
      distribution: {
        goalsWithProjects: portfolio.goals.filter((goal) => (portfolio.projectsByGoal.get(goal.id) ?? []).length > 0).length,
        projectsWithTasks: portfolio.projects.filter((project) => (portfolio.tasksByProject.get(project.id) ?? []).length > 0).length,
        habitsActiveCount: portfolio.habits.length,
      },
      gaps: {
        goalsWithoutProjects: portfolio.goals.filter((goal) => (portfolio.projectsByGoal.get(goal.id) ?? []).length === 0).length,
        projectsWithoutTasks: portfolio.projects.filter((project) => (portfolio.tasksByProject.get(project.id) ?? []).length === 0).length,
      },
    });

    return {
      type: 'report',
      content: report ? report.blocks.map((block) => `${block.title}: ${block.description}`).join(' ') : 'Relatorio indisponivel agora para Planejar.',
      actions: report
        ? [
            {
              id: `chat-report-planejar-${Date.now()}`,
              label: 'Preparar abertura do relatorio',
              intent: 'open',
              payload: { reportId: 'reportPlanejar' },
            },
            {
              id: `chat-report-planejar-review-${Date.now()}`,
              label: 'Revisar blocos',
              intent: 'review',
              payload: { reportId: 'reportPlanejar' },
            },
          ]
        : [],
    };
  }

  const report = await reportHojeWithAI({
    capacity: {
      signal: getDaySignal(hoje.focusItems.length, hoje.capacity.operationalHours),
      focusCount: hoje.focusItems.length,
      overdueCount: hoje.overdueItems.length,
    },
    execution: {
      agoraCount: hoje.focusItems.filter((item) => item.due_date === referenceDate || item.priority === 'alta').length,
      cabeCount: hoje.focusItems.filter((item) => item.due_date !== referenceDate && item.priority !== 'alta').length,
      atencaoCount: hoje.overdueItems.length,
    },
    direction: {
      linkedCount,
      standaloneCount,
    },
  });

  return {
    type: 'report',
    content: report ? report.blocks.map((block) => `${block.title}: ${block.description}`).join(' ') : 'Relatorio indisponivel agora para Hoje.',
    actions: report
      ? [
          {
            id: `chat-report-hoje-${Date.now()}`,
            label: 'Preparar abertura do relatorio',
            intent: 'open',
            payload: { reportId: 'reportHoje' },
          },
          {
            id: `chat-report-hoje-review-${Date.now()}`,
            label: 'Revisar blocos',
            intent: 'review',
            payload: { reportId: 'reportHoje' },
          },
        ]
      : [],
  };
}

async function buildOnboardingActionResponse(message: string, items: Item[]): Promise<IAChatResponse | null> {
  const referenceDate = today();
  const portfolio = derivePlanejarPortfolio(items, referenceDate);
  const onboarding = await runOnboardingWithAI({
    step: 'goals',
    userInput: message,
    existingStructure: {
      goals: portfolio.goals.map((goal) => ({ id: goal.id, title: goal.title })),
      projects: portfolio.projects.map((project) => ({ id: project.id, title: project.title, goal_id: project.goal_id })),
      habits: portfolio.habits.map((habit) => ({ id: habit.id, title: habit.title })),
      inegociaveis: portfolio.inegociaveis.map((item) => ({ id: item.id, title: item.title })),
    },
  });

  if (!onboarding || onboarding.suggestions.length === 0) {
    return null;
  }

  return {
    type: 'action',
    content: 'Posso preparar criacoes estruturadas a partir desta entrada, mas a confirmacao continua explicita e separada.',
    actions: onboarding.suggestions.map((suggestion, index) => ({
      id: `chat-onboarding-${index}`,
      label: `Preparar ${suggestion.type}`,
      intent: 'create',
      payload: {
        type: suggestion.type,
        title: suggestion.title,
        description: suggestion.description,
      },
    })),
  };
}

export async function orchestrateChatMessage(message: string, dependencies: ChatDependencies): Promise<IAChatResponse> {
  const intent = classifyChatIntent(message, dependencies.pathname);

  if (intent === 'reading') {
    return buildReadingResponse(dependencies);
  }

  if (intent === 'suggestion') {
    return buildSuggestionResponse(dependencies);
  }

  if (intent === 'report') {
    return buildReportResponse(dependencies);
  }

  if (dependencies.pathname.startsWith('/planejar') && includesAny(message.toLowerCase(), ['meta', 'metas', 'projeto', 'projetos', 'habito', 'hábito', 'inegoci'])) {
    const onboardingAction = await buildOnboardingActionResponse(message, dependencies.items);
    if (onboardingAction) {
      return onboardingAction;
    }
  }

  return buildActionProposal(message, dependencies.pathname);
}
