import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { routes } from './routes';
import { ForgotPasswordPage } from '../features/auth/ForgotPasswordPage';
import { LoginPage } from '../features/auth/LoginPage';
import { ResetPasswordPage } from '../features/auth/ResetPasswordPage';
import { SignupPage } from '../features/auth/SignupPage';
import { CentralPage } from '../features/central/CentralPage';
import { useAuth } from '../features/auth/AuthProvider';
import { FazerHomePage } from '../features/fazer/FazerHomePage';
import { EncerramentoPage } from '../features/fazer/encerramento/EncerramentoPage';
import { HojePage } from '../features/fazer/hoje/HojePage';
import { PainelAtencaoPage } from '../features/fazer/atencao/PainelAtencaoPage';
import { RitualPage } from '../features/fazer/ritual/RitualPage';
import { TimelinePage } from '../features/fazer/timeline/TimelinePage';
import { MemoriaHomePage } from '../features/memoria/MemoriaHomePage';
import { BacklogPage } from '../features/planejar/backlog/BacklogPage';
import { DependenciasPage } from '../features/planejar/dependencias/DependenciasPage';
import { PlanejarHomePage } from '../features/planejar/PlanejarHomePage';
import { PrioridadesPage } from '../features/planejar/prioridades/PrioridadesPage';
import { ProntosParaFazerPage } from '../features/planejar/prontos/ProntosParaFazerPage';
import { useDataStore } from '../store';

function ProtectedApp() {
  const { session, loading } = useAuth();
  const loadAll = useDataStore((state) => state.loadAll);

  useEffect(() => {
    if (session?.user) {
      void loadAll();
    }
  }, [loadAll, session]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] text-[var(--text-secondary)]">Carregando sessão...</div>;
  }

  if (!session) {
    return <Navigate to={routes.login} replace />;
  }

  return (
    <AppLayout>
      <Routes>
        <Route path={routes.home} element={<Navigate to={routes.fazer} replace />} />
        <Route path={`${routes.fazer}/*`} element={<FazerHomePage />}>
          <Route index element={<Navigate to={routes.fazerHoje} replace />} />
          <Route path="hoje" element={<HojePage />} />
          <Route path="timeline" element={<TimelinePage />} />
          <Route path="ritual" element={<RitualPage />} />
          <Route path="encerramento" element={<EncerramentoPage />} />
          <Route path="atencao" element={<PainelAtencaoPage />} />
        </Route>
        <Route path={`${routes.planejar}/*`} element={<PlanejarHomePage />}>
          <Route index element={<Navigate to={routes.planejarBacklog} replace />} />
          <Route path="backlog" element={<BacklogPage />} />
          <Route path="prioridades" element={<PrioridadesPage />} />
          <Route path="dependencias" element={<DependenciasPage />} />
          <Route path="prontos" element={<ProntosParaFazerPage />} />
        </Route>
        <Route path={routes.memoria} element={<MemoriaHomePage />} />
        <Route path={routes.central} element={<CentralPage />} />
      </Routes>
    </AppLayout>
  );
}

export function AppRouter() {
  return (
    <Routes>
      <Route path={routes.login} element={<LoginPage />} />
      <Route path={routes.signup} element={<SignupPage />} />
      <Route path={routes.forgotPassword} element={<ForgotPasswordPage />} />
      <Route path={routes.resetPassword} element={<ResetPasswordPage />} />
      <Route path="/*" element={<ProtectedApp />} />
    </Routes>
  );
}
