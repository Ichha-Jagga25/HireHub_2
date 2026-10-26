import {
  Bell,
  Bookmark,
  BriefcaseBusiness,
  ChevronDown,
  CircleHelp,
  Compass,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Settings,
  Sparkles,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import ThemeToggle from '../common/ThemeToggle.jsx';
import Footer from './Footer.jsx';

const seekerLinks = [
  { label: 'Overview', path: '/job-seeker/dashboard', icon: LayoutDashboard },
  { label: 'Find jobs', path: '/job-seeker/jobs', icon: Compass },
  { label: 'Saved jobs', path: '/job-seeker/saved-jobs', icon: Bookmark },
  { label: 'My applications', path: '/job-seeker/applications', icon: FileText },
  { label: 'Up Skill', path: '/job-seeker/up-skill', icon: Sparkles },
];

const recruiterLinks = [
  { label: 'Overview', path: '/recruiter/dashboard', icon: LayoutDashboard },
  { label: 'Manage jobs', path: '/recruiter/jobs', icon: BriefcaseBusiness },
  { label: 'Create job', path: '/recruiter/jobs/create', icon: Plus },
  { label: 'Applications', path: '/recruiter/applications', icon: UsersRound },
];

const accountLinks = (role) => [
  { label: 'Profile', path: role === 'seeker' ? '/job-seeker/profile' : '/recruiter/profile', icon: UserRound },
  { label: 'Notifications', path: role === 'seeker' ? '/job-seeker/notifications' : '/recruiter/notifications', icon: Bell },
  { label: 'Settings', path: role === 'seeker' ? '/job-seeker/settings' : '/recruiter/settings', icon: Settings },
];

const pageTitles = {
  dashboard: 'Overview',
  jobs: 'Find jobs',
  'saved-jobs': 'Saved jobs',
  applications: 'My applications',
  profile: 'Profile',
  'up-skill': 'Up Skill',
  notifications: 'Notifications',
  settings: 'Settings',
  create: 'Create job',
  edit: 'Edit job',
};

function getPageTitle(pathname, role) {
  if (role === 'recruiter' && pathname === '/recruiter/applications') return 'Applications';
  if (pathname.endsWith('/applications') && role === 'recruiter' && pathname.includes('/jobs/')) return 'Candidate pipeline';
  const part = pathname.split('/').filter(Boolean).pop() || 'dashboard';
  return pageTitles[part] || 'Workspace';
}

export default function DashboardLayout({ role }) {
  const { user, logout, applications, notificationReads, markNotificationsRead } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const links = role === 'seeker' ? seekerLinks : recruiterLinks;
  const secondaryLinks = accountLinks(role);
  const applicationsForUser = applications;
  const notificationCount = applicationsForUser.filter((application) => !notificationReads.includes(application.id)).length;
  const initials = user.name.split(/\s+/).map((word) => word[0]).slice(0, 2).join('').toUpperCase();
  const title = getPageTitle(location.pathname, role);

  useEffect(() => {
    if (location.pathname.endsWith('/notifications')) markNotificationsRead();
  }, [location.pathname]);

  function submitSearch(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const query = String(form.get('q') || '').trim();
    navigate(role === 'seeker' ? `/job-seeker/jobs?q=${encodeURIComponent(query)}` : `/recruiter/jobs?q=${encodeURIComponent(query)}`);
  }

  function toggleSidebar() {
    if (window.matchMedia('(max-width: 760px)').matches) {
      setMobileSidebarOpen((open) => !open);
      return;
    }
    setCollapsed((value) => !value);
  }

  function closeMobileSidebar() {
    setMobileSidebarOpen(false);
  }

  return <div className={`dashboard-shell ${collapsed ? 'sidebar-collapsed' : ''} ${mobileSidebarOpen ? 'mobile-sidebar-open' : ''}`}>
    {mobileSidebarOpen && <button className="mobile-sidebar-backdrop" type="button" aria-label="Close navigation menu" onClick={closeMobileSidebar} />}
    <aside className="app-sidebar">
      <Link className="sidebar-brand" to={role === 'seeker' ? '/job-seeker/dashboard' : '/recruiter/dashboard'} aria-label="HireHub overview">
        <span className="sidebar-brand-mark">
          <img src="/assets/hirehub-icon.png" alt="HireHub" className="brand-icon-img" />
        </span>
        <span className="sidebar-brand-copy">
          <strong>hirehub</strong>
          <small>CAREER PLATFORM</small>
        </span>
      </Link>
      <div className="sidebar-divider" />
      <p className="sidebar-section-label">WORKSPACE</p>
      <nav className="sidebar-navigation" aria-label="Workspace navigation">
        {links.map(({ label, path, icon: Icon }) => <NavLink key={path} to={path} end onClick={closeMobileSidebar} className={({ isActive }) => {
          const nestedManageRoute = role === 'recruiter' && label === 'Manage jobs' && location.pathname.startsWith('/recruiter/jobs/') && location.pathname !== '/recruiter/jobs/create';
          return isActive || nestedManageRoute ? 'dashboard-nav-link active' : 'dashboard-nav-link';
        }} title={label}>
          <Icon size={17} /><span className="dashboard-nav-label">{label}</span>
        </NavLink>)}
      </nav>
      <div className="sidebar-divider account-divider" />
      <p className="sidebar-section-label">ACCOUNT</p>
      <nav className="sidebar-navigation" aria-label="Account navigation">
        {secondaryLinks.map(({ label, path, icon: Icon }) => <NavLink key={`${label}-${path}`} to={path} end onClick={closeMobileSidebar} className={({ isActive }) => isActive ? 'dashboard-nav-link active' : 'dashboard-nav-link'} title={label}>
          <Icon size={17} /><span className="dashboard-nav-label">{label}</span>{label === 'Notifications' && notificationCount > 0 && <span className="sidebar-count">{notificationCount}</span>}
        </NavLink>)}
      </nav>
      <div className="sidebar-bottom">
        <Link className="sidebar-help" to={role === 'seeker' ? '/job-seeker/up-skill' : '/recruiter/settings'} onClick={closeMobileSidebar} title="Help & resources">
          <CircleHelp size={16} />
          <span className="dashboard-nav-label">Help & resources</span>
        </Link>
        <button className="sidebar-logout" type="button" onClick={() => { logout(); navigate('/'); }} title="Log out">
          <LogOut size={16} />
          <span className="dashboard-nav-label">Log out</span>
        </button>
        <div className="sidebar-divider" />
        <button className="sidebar-account" type="button" onClick={() => setAccountOpen((open) => !open)} title={user.name}>
          <span className="account-avatar">{initials}</span>
          <span className="account-copy">
            <strong>{user.name}</strong>
            <small>{role === 'seeker' ? 'Job seeker' : 'Recruiter'}</small>
          </span>
          <ChevronDown size={14} />
        </button>
      </div>
    </aside>
    <div className="dashboard-body">
      <header className="dashboard-topbar">
        <div className="topbar-leading">
          <button className="topbar-icon collapse-control" type="button" onClick={toggleSidebar} aria-label={mobileSidebarOpen ? 'Close navigation menu' : collapsed ? 'Expand sidebar' : 'Open navigation menu'} title={mobileSidebarOpen ? 'Close navigation menu' : collapsed ? 'Expand sidebar' : 'Open navigation menu'}>
            {mobileSidebarOpen ? <X size={17} /> : collapsed ? <PanelLeftOpen size={17} /> : window.matchMedia('(max-width: 760px)').matches ? <Menu size={17} /> : <PanelLeftClose size={17} />}
          </button>
          <span className="topbar-separator">/</span>
          <Link to={role === 'seeker' ? '/job-seeker/dashboard' : '/recruiter/dashboard'} className="topbar-breadcrumb-role">
            {role === 'seeker' ? 'Seeker' : 'Recruiter'}
          </Link>
          <span className="topbar-separator">/</span>
          <span className="topbar-title">{title}</span>
        </div>
        <form className="topbar-search" onSubmit={submitSearch} role="search">
          <Search size={15} /><input name="q" aria-label={role === 'seeker' ? 'Search jobs' : 'Search jobs and candidates'} placeholder={role === 'seeker' ? 'Search jobs, skills...' : 'Search your roles...'} /><kbd>/</kbd>
        </form>
        <div className="topbar-actions">
          <ThemeToggle />
          <Link className="topbar-icon notification-button" to={role === 'seeker' ? '/job-seeker/notifications' : '/recruiter/notifications'} aria-label={`Notifications${notificationCount ? `, ${notificationCount} unread` : ''}`}>
            <Bell size={17} />{notificationCount > 0 && <span className="notification-count">{notificationCount}</span>}
          </Link>
          <button className="topbar-profile" type="button" onClick={() => setAccountOpen((open) => !open)} aria-expanded={accountOpen}>
            <span className="account-avatar">{initials}</span><ChevronDown size={13} />
          </button>
        </div>
        {accountOpen && <div className="account-menu">
          <div className="account-menu-heading"><strong>{user.name}</strong><span>{user.email}</span></div>
          {secondaryLinks.map(({ label, path, icon: Icon }) => <Link key={`${label}-menu`} to={path} onClick={() => setAccountOpen(false)}><Icon size={15} />{label}</Link>)}
          <button type="button" onClick={() => { logout(); navigate('/'); }}><LogOut size={15} />Log out</button>
        </div>}
      </header>
      <main className="dashboard-main"><Outlet /></main>
      <Footer />
    </div>
  </div>;
}
