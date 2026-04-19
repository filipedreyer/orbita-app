import { supabase } from '../lib/supabase';
import type { HabitLog, InboxItem, Item, SubItem } from '../lib/types';

export async function fetchItems(userId: string): Promise<Item[]> {
  const { data, error } = await supabase.from('items').select('*').eq('user_id', userId).neq('status', 'archived').order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createItem(item: Omit<Item, 'id' | 'created_at' | 'updated_at'>): Promise<Item> {
  const { data, error } = await supabase.from('items').insert(item).select().single();
  if (error) throw error;
  return data;
}

export async function updateItem(id: string, updates: Partial<Item>): Promise<Item> {
  const { data, error } = await supabase.from('items').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function completeItem(id: string): Promise<Item> {
  return updateItem(id, { status: 'done', completed_at: new Date().toISOString() });
}

export async function archiveItem(id: string): Promise<Item> {
  return updateItem(id, { status: 'archived' });
}

export async function deleteItem(id: string): Promise<void> {
  const { error } = await supabase.from('items').delete().eq('id', id);
  if (error) throw error;
}

export async function rescheduleItem(id: string, newDate: string, currentCount: number): Promise<Item> {
  return updateItem(id, { due_date: newDate, reschedule_count: currentCount + 1 });
}

export async function fetchSubItems(itemId: string): Promise<SubItem[]> {
  const { data, error } = await supabase.from('sub_items').select('*').eq('item_id', itemId).order('sort_order', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchAllSubItems(userId: string): Promise<SubItem[]> {
  const { data, error } = await supabase.from('sub_items').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createSubItem(subItem: Omit<SubItem, 'id' | 'created_at'>): Promise<SubItem> {
  const { data, error } = await supabase.from('sub_items').insert(subItem).select().single();
  if (error) throw error;
  return data;
}

export async function updateSubItem(id: string, updates: Partial<SubItem>): Promise<void> {
  const { error } = await supabase.from('sub_items').update(updates).eq('id', id);
  if (error) throw error;
}

export async function deleteSubItem(id: string): Promise<void> {
  const { error } = await supabase.from('sub_items').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchInbox(userId: string): Promise<InboxItem[]> {
  const { data, error } = await supabase.from('inbox').select('*').eq('user_id', userId).order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createInboxItem(item: Omit<InboxItem, 'id' | 'created_at'>): Promise<InboxItem> {
  const { data, error } = await supabase.from('inbox').insert(item).select().single();
  if (error) throw error;
  return data;
}

export async function updateInboxItem(id: string, updates: Partial<InboxItem>): Promise<InboxItem> {
  const { data, error } = await supabase.from('inbox').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteInboxItem(id: string): Promise<void> {
  const { error } = await supabase.from('inbox').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchArchivedItems(userId: string): Promise<Item[]> {
  const { data, error } = await supabase.from('items').select('*').eq('user_id', userId).eq('status', 'archived').order('updated_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function logHabit(userId: string, itemId: string, date: string): Promise<HabitLog> {
  const { data, error } = await supabase.from('habit_logs').insert({ user_id: userId, item_id: itemId, checked_date: date }).select().single();
  if (error) throw error;
  return data;
}

export async function fetchHabitLogs(userId: string): Promise<HabitLog[]> {
  const { data, error } = await supabase.from('habit_logs').select('*').eq('user_id', userId).order('checked_date', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function uploadImage(userId: string, uri: string, fileName: string): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();
  const path = `${userId}/${Date.now()}_${fileName}`;
  const { error } = await supabase.storage.from('media').upload(path, blob, { contentType: blob.type });
  if (error) throw error;
  const { data } = supabase.storage.from('media').getPublicUrl(path);
  return data.publicUrl;
}
