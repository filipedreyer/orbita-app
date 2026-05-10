import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import * as adminService from '../../services/admin';

const initialStatus: adminService.AdminRoleStatus = {
  state: 'checking',
  isAdmin: false,
  reason: 'Verificando role admin.',
};

export function useAdminRole() {
  const { session } = useAuth();
  const [status, setStatus] = useState<adminService.AdminRoleStatus>(initialStatus);

  useEffect(() => {
    let cancelled = false;

    void adminService.fetchAdminRoleStatus(session?.user?.id).then((nextStatus) => {
      if (!cancelled) {
        setStatus(nextStatus);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  return status;
}

