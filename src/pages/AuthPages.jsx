import { ArrowLeft, ArrowRight, Building2, ChevronDown, Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import CompanyLogoField from '../components/common/CompanyLogoField.jsx';
import ThemeToggle from '../components/common/ThemeToggle.jsx';

export function LoginPage() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  async function loginWithDemo(role) {
    const account = role === 'recruiter'
      ? { email: 'ananya.rao@demo.hirehub.in', password: 'HireHubDemo2026!' }
      : { email: 'riya.sharma@demo.hirehub.in', password: 'HireHubDemo2026!' };
    setError('');
    setBusy(true);
    try {
      const user = await login(account.email, account.password, true);
      setDemoMenuOpen(false);
      navigate(user.role === 'recruiter' ? '/recruiter/dashboard' : '/job-seeker/dashboard', { replace: true });
    } catch (reason) {
      setError(reason.message || 'Unable to sign in with the demo account.');
    } finally {
      setBusy(false);
    }
  }
  async function submit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const user = await login(email, password, remember);
      const requested = searchParams.get('next');
      const safeNext = requested?.startsWith('/') && !requested.startsWith('//') ? requested : null;
      navigate(safeNext || (user.role === 'recruiter' ? '/recruiter/dashboard' : '/job-seeker/dashboard'), { replace: true });
    } catch (reason) {
      setError(reason.message || 'Unable to sign in.');
    } finally { setBusy(false); }
  }
  return <AuthFrame eyebrow="WELCOME BACK" title="Good to see you again." intro="Sign in to pick up where your career journey left off.">
    <div className="login-demo-layout">
      <form onSubmit={submit} className="auth-form">
        <label className="field-label">Email address<div className="input-wrap"><Mail size={17} /><input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></div></label>
        <label className="field-label">Password<div className="input-wrap"><LockKeyhole size={17} /><input type={visible ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" /><button className="input-icon-button" type="button" onClick={() => setVisible(!visible)} aria-label={visible ? 'Hide password' : 'Show password'}>{visible ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
        <label className="checkbox-field"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /> Keep me signed in on this browser</label>
        {error && <p className="form-message error-message" role="alert">{error}</p>}
        <button className="button button-primary button-full" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'} <ArrowRight size={16} /></button>
      </form>
      <div className="demo-login-control">
        <button className="demo-login-trigger" type="button" aria-expanded={demoMenuOpen} aria-controls="demo-login-menu" onClick={() => { setError(''); setDemoMenuOpen((open) => !open); }} disabled={busy}>
          Login with Demo Account <ChevronDown size={14} />
        </button>
        {demoMenuOpen && <div className="demo-login-menu" id="demo-login-menu" role="group" aria-label="Choose a demo account">
          <button type="button" onClick={() => loginWithDemo('seeker')} disabled={busy}>Job Seeker Demo</button>
          <button type="button" onClick={() => loginWithDemo('recruiter')} disabled={busy}>Recruiter Demo</button>
          <p>Sample accounts for exploring HireHub. Demo activity is stored in this browser.</p>
        </div>}
      </div>
    </div>
    <p className="auth-switch">New to HireHub? <Link to="/register">Create an account</Link></p>
  </AuthFrame>;
}

export function RegisterPage() {
  const { register } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [role, setRole] = useState(searchParams.get('role') === 'recruiter' ? 'recruiter' : 'seeker');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyLogo, setCompanyLogo] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setError('');
    if (password.length < 8) { setError('Use at least 8 characters for your password.'); return; }
    if (password !== confirm) { setError('Your passwords do not match.'); return; }
    setBusy(true);
    try {
      const user = await register({
        name,
        email,
        password,
        role,
        companyName: role === 'recruiter' ? companyName : '',
        companyLogo: role === 'recruiter' ? companyLogo : '',
      });
      navigate(user.role === 'recruiter' ? '/recruiter/dashboard' : '/job-seeker/dashboard', { replace: true });
    } catch (reason) {
      setError(reason.message || 'Unable to create your account.');
    } finally { setBusy(false); }
  }
  return <AuthFrame eyebrow="YOUR NEXT CHAPTER" title="A better start begins here." intro="Create a free account and bring your next career step into focus.">
    <div className="role-picker" role="group" aria-label="Choose your account type">
      <button type="button" className={role === 'seeker' ? 'role-option selected' : 'role-option'} onClick={() => setRole('seeker')}><UserRound size={17} /><strong>Job seeker</strong><span>Explore jobs and track applications</span></button>
      <button type="button" className={role === 'recruiter' ? 'role-option selected' : 'role-option'} onClick={() => setRole('recruiter')}><Mail size={17} /><strong>Recruiter</strong><span>Publish roles and review candidates</span></button>
    </div>
    {role === 'recruiter' && <section className="recruiter-company-fields" aria-label="Company information">
      <label className="field-label">Company name<div className="input-wrap"><Building2 size={17} /><input required autoComplete="organization" value={companyName} onChange={(event) => setCompanyName(event.target.value)} placeholder="Your company name" /></div></label>
      <div className="field-label">Company Logo (Optional)<CompanyLogoField companyName={companyName} logo={companyLogo} onChange={setCompanyLogo} /></div>
    </section>}
    <form onSubmit={submit} className="auth-form">
      <label className="field-label">Full name<div className="input-wrap"><UserRound size={17} /><input required autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" /></div></label>
      <label className="field-label">Email address<div className="input-wrap"><Mail size={17} /><input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></div></label>
      <label className="field-label">Password<div className="input-wrap"><LockKeyhole size={17} /><input type={visible ? 'text' : 'password'} required minLength="8" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" /><button className="input-icon-button" type="button" onClick={() => setVisible(!visible)} aria-label={visible ? 'Hide password' : 'Show password'}>{visible ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
      <label className="field-label">Confirm password<div className="input-wrap"><LockKeyhole size={17} /><input type={visible ? 'text' : 'password'} required autoComplete="new-password" value={confirm} onChange={(event) => setConfirm(event.target.value)} placeholder="Enter your password again" /></div></label>
      {error && <p className="form-message error-message" role="alert">{error}</p>}
      <button className="button button-primary button-full" type="submit" disabled={busy}>{busy ? 'Creating account…' : 'Create account'} <ArrowRight size={16} /></button>
      <p className="legal-note">This local demo stores an account record in this browser. Do not use a real or reused password.</p>
    </form>
    <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
  </AuthFrame>;
}

function AuthFrame({ eyebrow, title, intro, children }) {
  return <div className="auth-page"><div className="auth-decoration"><Link to="/" className="auth-back"><ArrowLeft size={15} /> Back to HireHub</Link><div className="auth-decoration-copy"><img src="/assets/hirehub-logo-dark.png" alt="HireHub" className="auth-brand-logo" /><div className="eyebrow">CAREERS MOVE FORWARD</div><h2>Make your skills<br />part of the story.</h2><p>Find the opportunity that feels like your next step.</p></div><img src="/assets/hirehub-icon.png" alt="" className="auth-decoration-mark" /></div><div className="auth-content"><div className="auth-tools"><ThemeToggle /></div><div className="auth-form-wrap"><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p className="auth-intro">{intro}</p>{children}</div></div></div>;
}
