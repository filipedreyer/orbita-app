import { getSupabase } from '../lib/supabase';

export type AdminRoleState = 'checking' | 'granted' | 'denied' | 'unavailable';

export interface AdminRoleStatus {
  state: AdminRoleState;
  isAdmin: boolean;
  reason: string;
}

export async function fetchAdminRoleStatus(userId: string | null | undefined): Promise<AdminRoleStatus> {
  if (!userId) {
    return {
      state: 'denied',
      isAdmin: false,
      reason: 'Sessao ausente.',
    };
  }

  try {
    const { data, error } = await getSupabase()
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (error) {
      return {
        state: 'unavailable',
        isAdmin: false,
        reason: 'Role admin nao pode ser confirmada.',
      };
    }

    const isAdmin = data?.role === 'admin';

    return {
      state: isAdmin ? 'granted' : 'denied',
      isAdmin,
      reason: isAdmin ? 'Role admin confirmada.' : 'Usuario sem role admin.',
    };
  } catch {
    return {
      state: 'unavailable',
      isAdmin: false,
      reason: 'Role admin indisponivel.',
    };
  }
}
