import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { UnauthorizedPage } from '../pages/PublicPages.jsx';

export function ProtectedRoute({ role, children }) {
  const { user, ready } = useApp();
  const location = useLocation();
  if (!ready) return <div className="loading-state">Preparing your HireHub workspace…</div>;
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  if (role && user.role !== role) return <UnauthorizedPage />;
  return children;
}

export function PublicRoute({ children }) {
  const { user, ready } = useApp();
  if (!ready) return <div className="loading-state">Preparing your HireHub workspace…</div>;
  if (user) return <Navigate to={user.role === 'recruiter' ? '/recruiter/dashboard' : '/job-seeker/dashboard'} replace />;
  return children;
}
