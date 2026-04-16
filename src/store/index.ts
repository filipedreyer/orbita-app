import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import type { EntityType, InboxItem, Item, SubItem } from '../lib/types';
import * as authService from '../services/auth';
import * as itemsService from '../services/items';
import { isPast, today } from '../lib/dates';

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
  loading: boolean;
  error: string | null;
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
  checkHabit: (itemId: string) => Promise<void>;
  uploadImage: (uri: string, fileName: string) => Promise<string | null>;
  reset: () => void;
}

export const useDataStore = create<DataState>((set, get) => ({
  items: [],
  inbox: [],
  subItems: {},
  loading: false,
  error: null,
  loadAll: async () => {
    const session = useAuthStore.getState().session;
    if (!session?.user) return;
    set({ loading: true, error: null });
    try {
      const [items, inbox] = await Promise.all([itemsService.fetchItems(session.user.id), itemsService.fetchInbox(session.user.id)]);
      set({ items, inbox, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Falha ao carregar dados.', loading: false });
    }
  },
  loadSubItems: async (itemId) => {
    try {
      const subItems = await itemsService.fetchSubItems(itemId);
      set((state) => ({ subItems: { ...state.subItems, [itemId]: subItems } }));
    } catch {}
  },
  addItem: async (item) => {
    try {
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
    } catch {}
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
    } catch {}
  },
  removeSubItem: async (subItemId, itemId) => {
    try {
      await itemsService.deleteSubItem(subItemId);
      set((state) => ({ subItems: { ...state.subItems, [itemId]: (state.subItems[itemId] || []).filter((subItem) => subItem.id !== subItemId) } }));
    } catch {}
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
        ai_suggested_type: 'tarefa',
        ai_suggested_tags: tags || null,
      });
      set((state) => ({ inbox: [created, ...state.inbox] }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Falha ao enviar para inbox.' });
    }
  },
  acceptInbox: async (inboxId, asType) => {
    const session = useAuthStore.getState().session;
    const inboxItem = get().inbox.find((entry) => entry.id === inboxId);
    if (!session?.user || !inboxItem) return;
    try {
      const type = asType || inboxItem.ai_suggested_type || 'tarefa';
      const tags = [...(inboxItem.text.match(/#[\w-]+/g) || []), ...(inboxItem.ai_suggested_tags?.match(/#[\w-]+/g) || [])];
      const item = await itemsService.createItem({
        user_id: session.user.id,
        type,
        title: inboxItem.text,
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
      await itemsService.deleteInboxItem(inboxId);
      set((state) => ({ items: [item, ...state.items], inbox: state.inbox.filter((entry) => entry.id !== inboxId) }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Falha ao aceitar item da inbox.' });
    }
  },
  dismissInbox: async (inboxId) => {
    try {
      await itemsService.deleteInboxItem(inboxId);
      set((state) => ({ inbox: state.inbox.filter((entry) => entry.id !== inboxId) }));
    } catch {}
  },
  checkHabit: async (itemId) => {
    const session = useAuthStore.getState().session;
    const item = get().items.find((entry) => entry.id === itemId);
    if (!session?.user || !item) return;
    try {
      await itemsService.logHabit(session.user.id, itemId, today());
      const meta = (item.metadata || {}) as Record<string, unknown>;
      const streak = typeof meta.streak === 'number' ? meta.streak : 0;
      const updated = await itemsService.updateItem(itemId, {
        metadata: {
          ...meta,
          streak: streak + 1,
          last_checked: today(),
        },
      });
      set((state) => ({ items: state.items.map((entry) => (entry.id === itemId ? updated : entry)) }));
    } catch {}
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
  reset: () => set({ items: [], inbox: [], subItems: {}, loading: false, error: null }),
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
