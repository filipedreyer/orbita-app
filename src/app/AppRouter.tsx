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
import { AnexosPage } from '../features/memoria/AnexosPage';
import { ArquivadosPage } from '../features/memoria/ArquivadosPage';
import { AtalhosPage } from '../features/memoria/AtalhosPage';
import { CaixolaPage } from '../features/memoria/CaixolaPage';
import { InboxPage } from '../features/memoria/InboxPage';
import { ItensPage } from '../features/memoria/ItensPage';
import { MemoriaHomePage } from '../features/memoria/MemoriaHomePage';
import { MemoriaLayout } from '../features/memoria/MemoriaLayout';
import { TemplatesPage } from '../features/memoria/TemplatesPage';
import { PlanearHomePage } from '../features/planejar/PlanearHomePage';
import { PlanejarPlaceholderPage } from '../features/planejar/PlanejarPlaceholderPage';
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
        <Route path={`${routes.planejar}/*`} element={<PlanearHomePage />}>
          <Route
            index
            element={
              <PlanejarPlaceholderPage
                title="Selecione um card do portfólio"
                description="O detalhamento de domínio entra na Fase 5. Nesta fase, Planejar existe como hub de navegação."
              />
            }
          />
          <Route path="metas" element={<PlanejarPlaceholderPage title="Metas" description="Placeholder ativo da Fase 4. O detalhamento entra na Fase 5." />} />
          <Route path="projetos" element={<PlanejarPlaceholderPage title="Projetos" description="Placeholder ativo da Fase 4. O detalhamento entra na Fase 5." />} />
          <Route path="habitos" element={<PlanejarPlaceholderPage title="Hábitos" description="Placeholder ativo da Fase 4. O detalhamento entra na Fase 5." />} />
          <Route path="inegociaveis" element={<PlanejarPlaceholderPage title="Inegociáveis" description="Placeholder ativo da Fase 4. O detalhamento entra na Fase 5." />} />
        </Route>
        <Route path={`${routes.memoria}/*`} element={<MemoriaLayout />}>
          <Route index element={<MemoriaHomePage />} />
          <Route path="inbox" element={<InboxPage />} />
          <Route path="itens" element={<ItensPage />} />
          <Route path="caixola" element={<CaixolaPage />} />
          <Route path="atalhos" element={<AtalhosPage />} />
          <Route path="templates" element={<TemplatesPage />} />
          <Route path="arquivados" element={<ArquivadosPage />} />
          <Route path="anexos" element={<AnexosPage />} />
        </Route>
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
