import { ArrowRight, BriefcaseBusiness, LogOut, Menu, UserRound, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import ThemeToggle from '../common/ThemeToggle.jsx';

export default function Navbar() {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const home = user ? (user.role === 'recruiter' ? '/recruiter/dashboard' : '/job-seeker/dashboard') : '/';
  const closeMenu = () => setMenuOpen(false);
  return (
    <header className="site-header">
      <div className="nav-inner">
        <Link className="brand" to={home}>
          <span className="brand-icon">
            <img src="/assets/hirehub-icon.png" alt="HireHub" className="brand-icon-img" />
          </span>
          <span className="brand-text">hirehub</span>
        </Link>
        <nav className={menuOpen ? 'main-nav menu-open' : 'main-nav'} aria-label="Main navigation">
          <NavLink to="/jobs" onClick={closeMenu}>Jobs</NavLink>
          <Link to="/#companies" onClick={closeMenu}>Companies</Link>
          <Link to="/#about" onClick={closeMenu}>About</Link>
          {user && <NavLink to={user.role === 'seeker' ? '/job-seeker/up-skill' : '/up-skill'} onClick={closeMenu}>Up Skill</NavLink>}
          {user ? <Link className="mobile-nav-action" to={home} onClick={closeMenu}>My dashboard</Link> : <>
            <Link className="mobile-nav-action" to="/login" onClick={closeMenu}>Log in</Link>
            <Link className="mobile-nav-action" to="/register" onClick={closeMenu}>Get started <ArrowRight size={14} /></Link>
          </>}
        </nav>
        <div className="nav-actions"><ThemeToggle />
          {user ? <>
            <Link className="nav-dashboard" to={home} onClick={closeMenu}><UserRound size={16} /> {user.name.split(' ')[0]}</Link>
            <button className="button button-quiet" type="button" onClick={() => { closeMenu(); logout(); navigate('/'); }}><LogOut size={15} /> Log out</button>
          </> : <>
            <Link className="nav-login" to="/login" onClick={closeMenu}>Log in</Link>
            <Link className="button button-primary button-small" to="/register" onClick={closeMenu}>Get started</Link>
          </>}
        </div>
        <button className="mobile-menu" type="button" aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </header>
  );
}
