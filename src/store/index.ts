import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import type { EntityType, InboxItem, Item, SubItem } from '../lib/types';
import { assertNewEntityType, isLegacyEntityType, migrationWarnings, normalizeEntityType } from '../lib/entity-domain';
import * as authService from '../services/auth';
import * as itemsService from '../services/items';
import * as profileService from '../services/profile';
import { isPast, shiftLocalDate, today } from '../lib/dates';

interface AuthState {
  session: Session | null;
  loading: boolean;
  setSession: (session: Session | null) => void;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  loading: true,
  setSession: (session) => set({ session, loading: false }),
  initialize: async () => {
    try {
      const session = await authService.getSession();
      set({ session, loading: false });
    } catch {
      set({ loading: false });
    }
  },
  signIn: async (email, password) => {
    const { session } = await authService.signIn(email, password);
    set({ session });
  },
  signUp: async (email, password, name) => {
    await authService.signUp(email, password, name);
  },
  signOut: async () => {
    await authService.signOut();
    set({ session: null });
    useDataStore.getState().reset();
  },
}));

interface DataState {
  items: Item[];
  inbox: InboxItem[];
  subItems: Record<string, SubItem[]>;
  ritualOrder: string[];
  loading: boolean;
  error: string | null;
  clearError: () => void;
  loadAll: () => Promise<void>;
  loadSubItems: (itemId: string) => Promise<void>;
  addItem: (item: Omit<Item, 'id' | 'created_at' | 'updated_at'>) => Promise<Item | null>;
  updateItem: (id: string, updates: Partial<Item>) => Promise<void>;
  completeItem: (id: string) => Promise<void>;
  archiveItem: (id: string) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  rescheduleItem: (id: string, newDate: string) => Promise<void>;
  duplicateItem: (id: string) => Promise<void>;
  promoteItem: (id: string, newType: EntityType) => Promise<void>;
  cancelItem: (id: string) => Promise<void>;
  addSubItem: (itemId: string, text: string) => Promise<void>;
  toggleSubItem: (subItemId: string, done: boolean) => Promise<void>;
  removeSubItem: (subItemId: string, itemId: string) => Promise<void>;
  addToInbox: (text: string, imageUrl?: string | null) => Promise<void>;
  acceptInbox: (inboxId: string, asType?: EntityType) => Promise<void>;
  dismissInbox: (inboxId: string) => Promise<void>;
  updateInboxItem: (inboxId: string, updates: Partial<InboxItem>) => Promise<void>;
  checkHabit: (itemId: string) => Promise<void>;
  uploadImage: (uri: string, fileName: string) => Promise<string | null>;
  setRitualOrder: (ids: string[]) => void;
  moveRitualItem: (itemId: string, direction: 'up' | 'down') => void;
  clearRitualOrder: () => void;
  reset: () => void;
}

const habitCheckInFlight = new Set<string>();
const acceptInboxInFlight = new Set<string>();

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function isDuplicateSupabaseError(error: unknown) {
  return typeof error === 'object' && error !== null && 'code' in error && (error as { code?: string }).code === '23505';
}

function getNextHabitStreak(lastChecked: unknown, currentStreak: unknown, referenceDate: string) {
  const streak = typeof currentStreak === 'number' && Number.isFinite(currentStreak) ? currentStreak : 0;
  if (lastChecked === referenceDate) {
    return streak;
  }

  if (typeof lastChecked === 'string' && lastChecked === shiftLocalDate(referenceDate, -1)) {
    return streak + 1;
  }

  return 1;
}

export const useDataStore = create<DataState>((set, get) => ({
  items: [],
  inbox: [],
  subItems: {},
  ritualOrder: [],
  loading: false,
  error: null,
  clearError: () => set({ error: null }),
  loadAll: async () => {
    const session = useAuthStore.getState().session;
    if (!session?.user) return;
    set({ loading: true, error: null });
    try {
      const [items, inbox, settings] = await Promise.all([
        itemsService.fetchItems(session.user.id),
        itemsService.fetchInbox(session.user.id),
        profileService.fetchProfileSettings(session.user.id),
      ]);
      const ritualOrder = settings.ritualOrder?.date === today() ? settings.ritualOrder.ids : [];
      set({ items, inbox, ritualOrder, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Falha ao carregar dados.', loading: false });
    }
  },
  loadSubItems: async (itemId) => {
    try {
      const subItems = await itemsService.fetchSubItems(itemId);
      set((state) => ({ subItems: { ...state.subItems, [itemId]: subItems } }));
    } catch (error) {
      set({ error: getErrorMessage(error, 'Falha ao carregar sub-itens.') });
    }
  },
  addItem: async (item) => {
    try {
      assertNewEntityType(item.type);
      const created = await itemsService.createItem(item);
      set((state) => ({ items: [created, ...state.items] }));
      return created;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Falha ao criar item.' });
      return null;
    }
  },
  updateItem: async (id, updates) => {
    try {
      const updated = await itemsService.updateItem(id, updates);
      set((state) => ({ items: state.items.map((item) => (item.id === id ? updated : item)) }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Falha ao atualizar item.' });
    }
  },
  completeItem: async (id) => {
    try {
      const updated = await itemsService.completeItem(id);
      set((state) => ({ items: state.items.map((item) => (item.id === id ? updated : item)) }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Falha ao concluir item.' });
    }
  },
  archiveItem: async (id) => {
    try {
      await itemsService.archiveItem(id);
      set((state) => ({ items: state.items.filter((item) => item.id !== id) }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Falha ao arquivar item.' });
    }
  },
  deleteItem: async (id) => {
    try {
      await itemsService.deleteItem(id);
      set((state) => ({ items: state.items.filter((item) => item.id !== id) }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Falha ao excluir item.' });
    }
  },
  rescheduleItem: async (id, newDate) => {
    const item = get().items.find((entry) => entry.id === id);
    if (!item) return;
    try {
      const updated = await itemsService.rescheduleItem(id, newDate, item.reschedule_count);
      set((state) => ({ items: state.items.map((entry) => (entry.id === id ? updated : entry)) }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Falha ao reagendar item.' });
    }
  },
  duplicateItem: async (id) => {
    const item = get().items.find((entry) => entry.id === id);
    const session = useAuthStore.getState().session;
    if (!item || !session?.user) return;
    if (isLegacyEntityType(item.type)) {
      set({ error: migrationWarnings[item.type] });
      return;
    }
    try {
      const copy = await itemsService.createItem({
        user_id: session.user.id,
        type: item.type,
        title: `${item.title} (cópia)`,
        description: item.description,
        status: 'active',
        priority: item.priority,
        due_date: item.due_date,
        completed_at: null,
        goal_id: item.goal_id,
        project_id: item.project_id,
        tags: item.tags,
        reschedule_count: 0,
        metadata: item.metadata,
        image_url: item.image_url,
      });
      set((state) => ({ items: [copy, ...state.items] }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Falha ao duplicar item.' });
    }
  },
  promoteItem: async (id, newType) => {
    try {
      assertNewEntityType(newType);
      const updated = await itemsService.updateItem(id, { type: newType });
      set((state) => ({ items: state.items.map((item) => (item.id === id ? updated : item)) }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Falha ao promover item.' });
    }
  },
  cancelItem: async (id) => {
    try {
      const updated = await itemsService.updateItem(id, { status: 'cancelled' });
      set((state) => ({ items: state.items.map((item) => (item.id === id ? updated : item)) }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Falha ao cancelar item.' });
    }
  },
  addSubItem: async (itemId, text) => {
    const session = useAuthStore.getState().session;
    if (!session?.user) return;
    try {
      const existing = get().subItems[itemId] || [];
      const subItem = await itemsService.createSubItem({ item_id: itemId, user_id: session.user.id, text, done: false, sort_order: existing.length });
      set((state) => ({ subItems: { ...state.subItems, [itemId]: [...(state.subItems[itemId] || []), subItem] } }));
    } catch (error) {
      set({ error: getErrorMessage(error, 'Falha ao adicionar sub-item.') });
    }
  },
  toggleSubItem: async (subItemId, done) => {
    try {
      await itemsService.updateSubItem(subItemId, { done });
      set((state) => {
        const next = { ...state.subItems };
        Object.keys(next).forEach((key) => {
          next[key] = next[key].map((subItem) => (subItem.id === subItemId ? { ...subItem, done } : subItem));
        });
        return { subItems: next };
      });
    } catch (error) {
      set({ error: getErrorMessage(error, 'Falha ao atualizar sub-item.') });
    }
  },
  removeSubItem: async (subItemId, itemId) => {
    try {
      await itemsService.deleteSubItem(subItemId);
      set((state) => ({ subItems: { ...state.subItems, [itemId]: (state.subItems[itemId] || []).filter((subItem) => subItem.id !== subItemId) } }));
    } catch (error) {
      set({ error: getErrorMessage(error, 'Falha ao remover sub-item.') });
    }
  },
  addToInbox: async (text, imageUrl) => {
    const session = useAuthStore.getState().session;
    if (!session?.user) return;
    try {
      const tags = (text.match(/#[\w-]+/g) || []).join(' ');
      const created = await itemsService.createInboxItem({
        user_id: session.user.id,
        text,
        image_url: imageUrl ?? null,
        ai_suggested_type: null,
        ai_suggested_tags: tags || null,
      });
      set((state) => ({ inbox: [...state.inbox, created] }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Falha ao enviar para inbox.' });
    }
  },
  acceptInbox: async (inboxId, asType) => {
    const session = useAuthStore.getState().session;
    const inboxItem = get().inbox.find((entry) => entry.id === inboxId);
    if (!session?.user || !inboxItem) return;
    if (acceptInboxInFlight.has(inboxId)) return;

    acceptInboxInFlight.add(inboxId);
    let createdItem: Item | null = null;
    try {
      const type = normalizeEntityType(asType || inboxItem.ai_suggested_type);
      const title = inboxItem.text.trim();
      if (!type || !title) {
        set({ error: 'Para sair da inbox, o item precisa ter tipo e nome.' });
        return;
      }
      const tags = [...(inboxItem.text.match(/#[\w-]+/g) || []), ...(inboxItem.ai_suggested_tags?.match(/#[\w-]+/g) || [])];
      createdItem = await itemsService.createItem({
        user_id: session.user.id,
        type,
        title,
        description: null,
        status: 'active',
        priority: null,
        due_date: null,
        completed_at: null,
        goal_id: null,
        project_id: null,
        tags: [...new Set(tags)],
        reschedule_count: 0,
        metadata: {},
        image_url: inboxItem.image_url,
      });
      try {
        await itemsService.deleteInboxItem(inboxId);
      } catch (deleteError) {
        try {
          const refreshedInbox = await itemsService.fetchInbox(session.user.id);
          const inboxStillExists = refreshedInbox.some((entry) => entry.id === inboxId);

          if (!inboxStillExists) {
            set((state) => ({ items: createdItem ? [createdItem, ...state.items] : state.items, inbox: state.inbox.filter((entry) => entry.id !== inboxId) }));
            return;
          }
        } catch {
          // Mantem a estrategia de compensacao abaixo quando a verificacao falha.
        }

        try {
          await itemsService.deleteItem(createdItem.id);
        } catch {
          set({ error: 'Falha ao concluir a aceitacao da inbox e nao foi possivel reverter o item criado automaticamente.' });
          return;
        }

        set({ error: getErrorMessage(deleteError, 'Falha ao remover item da inbox apos criar o destino. A operacao foi revertida.') });
        return;
      }

      if (!createdItem) {
        set({ error: 'Falha ao criar o item de destino da inbox.' });
        return;
      }

      const acceptedItem = createdItem;
      set((state) => ({ items: [acceptedItem, ...state.items], inbox: state.inbox.filter((entry) => entry.id !== inboxId) }));
    } catch (error) {
      set({ error: getErrorMessage(error, 'Falha ao aceitar item da inbox.') });
    } finally {
      acceptInboxInFlight.delete(inboxId);
    }
  },
  dismissInbox: async (inboxId) => {
    try {
      await itemsService.deleteInboxItem(inboxId);
      set((state) => ({ inbox: state.inbox.filter((entry) => entry.id !== inboxId) }));
    } catch (error) {
      set({ error: getErrorMessage(error, 'Falha ao descartar item da inbox.') });
    }
  },
  updateInboxItem: async (inboxId, updates) => {
    try {
      const updated = await itemsService.updateInboxItem(inboxId, updates);
      set((state) => ({ inbox: state.inbox.map((entry) => (entry.id === inboxId ? updated : entry)) }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Falha ao atualizar item da inbox.' });
    }
  },
  checkHabit: async (itemId) => {
    const session = useAuthStore.getState().session;
    const item = get().items.find((entry) => entry.id === itemId);
    if (!session?.user || !item) return;
    const checkedDate = today();
    const inFlightKey = `${session.user.id}:${itemId}:${checkedDate}`;
    if (habitCheckInFlight.has(inFlightKey)) return;

    const meta = (item.metadata || {}) as Record<string, unknown>;
    if (meta.last_checked === checkedDate) return;

    habitCheckInFlight.add(inFlightKey);
    try {
      const existingLog = await itemsService.fetchHabitLogByDate(session.user.id, itemId, checkedDate);
      let baseItem = item;

      if (existingLog) {
        const latestItem = await itemsService.fetchItemById(itemId);
        if (latestItem) {
          baseItem = latestItem;
        }

        const latestMeta = (baseItem.metadata || {}) as Record<string, unknown>;
        if (latestMeta.last_checked === checkedDate) {
          set((state) => ({ items: state.items.map((entry) => (entry.id === itemId ? baseItem : entry)) }));
          return;
        }
      }

      if (!existingLog) {
        try {
          await itemsService.logHabit(session.user.id, itemId, checkedDate);
        } catch (error) {
          if (!isDuplicateSupabaseError(error)) {
            throw error;
          }

          const latestItem = await itemsService.fetchItemById(itemId);
          if (latestItem) {
            baseItem = latestItem;
            const latestMeta = (latestItem.metadata || {}) as Record<string, unknown>;
            if (latestMeta.last_checked === checkedDate) {
              set((state) => ({ items: state.items.map((entry) => (entry.id === itemId ? latestItem : entry)) }));
              return;
            }
          }
        }
      }

      const baseMeta = (baseItem.metadata || {}) as Record<string, unknown>;
      const nextStreak = getNextHabitStreak(baseMeta.last_checked, baseMeta.streak, checkedDate);
      const updated = await itemsService.updateItem(itemId, {
        metadata: {
          ...baseMeta,
          streak: nextStreak,
          last_checked: checkedDate,
        },
      });
      set((state) => ({ items: state.items.map((entry) => (entry.id === itemId ? updated : entry)) }));
    } catch (error) {
      if (isDuplicateSupabaseError(error)) {
        return;
      }

      set({ error: getErrorMessage(error, 'Falha ao registrar habito.') });
    } finally {
      habitCheckInFlight.delete(inFlightKey);
    }
  },
  uploadImage: async (uri, fileName) => {
    const session = useAuthStore.getState().session;
    if (!session?.user) return null;
    try {
      return await itemsService.uploadImage(session.user.id, uri, fileName);
    } catch {
      return null;
    }
  },
  setRitualOrder: (ids) => {
    set({ ritualOrder: ids });
    const session = useAuthStore.getState().session;
    if (!session?.user) return;
    void profileService
      .fetchProfileSettings(session.user.id)
      .then((settings) =>
        profileService.updateProfileSettings(session.user.id, {
          ...settings,
          ritualOrder: {
            date: today(),
            ids,
          },
        }),
      )
      .catch(() => {});
  },
  moveRitualItem: (itemId, direction) =>
    set((state) => {
      const current = state.ritualOrder;
      const index = current.indexOf(itemId);
      if (index === -1) return state;
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= current.length) return state;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      const session = useAuthStore.getState().session;
      if (session?.user) {
        void profileService
          .fetchProfileSettings(session.user.id)
          .then((settings) =>
            profileService.updateProfileSettings(session.user.id, {
              ...settings,
              ritualOrder: {
                date: today(),
                ids: next,
              },
            }),
          )
          .catch(() => {});
      }
      return { ritualOrder: next };
    }),
  clearRitualOrder: () => {
    set({ ritualOrder: [] });
    const session = useAuthStore.getState().session;
    if (!session?.user) return;
    void profileService
      .fetchProfileSettings(session.user.id)
      .then((settings) =>
        profileService.updateProfileSettings(session.user.id, {
          ...settings,
          ritualOrder: null,
        }),
      )
      .catch(() => {});
  },
  reset: () => set({ items: [], inbox: [], subItems: {}, ritualOrder: [], loading: false, error: null }),
}));

export const selectByType = (items: Item[], type: EntityType) => items.filter((item) => item.type === type && item.status !== 'archived');
export const selectGoals = (items: Item[]) => items.filter((item) => item.type === 'meta' && item.status === 'active');
export const selectTodayTasks = (items: Item[]) => {
  const currentDay = today();
  return items.filter((item) => item.type === 'tarefa' && item.status === 'active' && (item.due_date ? item.due_date <= currentDay : true));
};
export const selectOverdueTasks = (items: Item[]) => items.filter((item) => item.type === 'tarefa' && item.status === 'active' && isPast(item.due_date));
export const selectHabits = (items: Item[]) => items.filter((item) => item.type === 'habito' && item.status === 'active');
export const selectRoutines = (items: Item[]) => items.filter((item) => item.type === 'rotina' && item.status === 'active');
export const selectTodayEvents = (items: Item[]) => {
  const currentDay = today();
  return items.filter((item) => (item.type === 'evento' || item.type === 'lembrete') && item.status === 'active' && item.due_date === currentDay);
};
