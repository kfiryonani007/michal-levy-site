import { Routes, Route, Navigate } from 'react-router-dom';
import { useSession } from '../lib/auth';
import LoginPage from './LoginPage';
import AdminLayout from './AdminLayout';
import DashboardPage from './DashboardPage';
import LeadsPage from './LeadsPage';
import ProjectsPage from './ProjectsPage';
import CommissionPage from './CommissionPage';
import SettingsPage from './SettingsPage';

/**
 * ============================================================================
 *  ADMIN APP — everything under /admin
 * ============================================================================
 *  Rendered by src/App.jsx instead of the public site's Header/Footer/Routes
 *  whenever the path starts with /admin — this is a tool, not a page of the
 *  site. /admin/login is reachable while signed out; every other /admin/*
 *  route requires a Supabase session (see useSession in src/lib/auth.js) and
 *  bounces to /admin/login otherwise.
 * ============================================================================
 */
export default function AdminApp() {
  const { session, loading } = useSession();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream text-ink/50">
        טוען…
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/admin/login"
        element={session ? <Navigate to="/admin" replace /> : <LoginPage />}
      />
      <Route
        path="/admin/*"
        element={
          session ? (
            <AdminLayout>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/leads" element={<LeadsPage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/commission" element={<CommissionPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </Routes>
            </AdminLayout>
          ) : (
            <Navigate to="/admin/login" replace />
          )
        }
      />
    </Routes>
  );
}
