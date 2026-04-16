import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { routes } from './routes';
import { ForgotPasswordPage } from '../features/auth/ForgotPasswordPage';
import { LoginPage } from '../features/auth/LoginPage';
import { ResetPasswordPage } from '../features/auth/ResetPasswordPage';
import { SignupPage } from '../features/auth/SignupPage';
import { useAuth } from '../features/auth/AuthProvider';
import { FazerHomePage } from '../features/fazer/FazerHomePage';
import { MemoriaHomePage } from '../features/memoria/MemoriaHomePage';
import { CentralPage } from '../features/planejar/CentralPage';
import { PlanejarHomePage } from '../features/planejar/PlanejarHomePage';

function ProtectedApp() {
  const { session, loading } = useAuth();

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
        <Route path={routes.fazer} element={<FazerHomePage />} />
        <Route path={routes.planejar} element={<PlanejarHomePage />} />
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
