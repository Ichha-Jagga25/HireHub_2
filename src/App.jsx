import { TriangleAlert } from 'lucide-react';
import { useApp } from './context/AppContext.jsx';
import AppRoutes from './routes/AppRoutes.jsx';

export default function App() {
  const { ready, notice } = useApp();
  if (!ready) return <div className="loading-screen">Loading HireHub…</div>;
  return <div className="app-root">{notice && <div className="storage-alert"><TriangleAlert size={17} />{notice}</div>}<AppRoutes /></div>;
}
