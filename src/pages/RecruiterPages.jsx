import { ArrowRight, BriefcaseBusiness, CheckCircle2, Mail, Phone, Plus, UsersRound } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import CompanyLogo from '../components/common/CompanyLogo.jsx';
import CompanyLogoField from '../components/common/CompanyLogoField.jsx';
import SelectField from '../components/common/SelectField.jsx';
import { useApp } from '../context/AppContext.jsx';
import { formatDate } from '../utils/jobUtils.js';

export function RecruiterDashboard() {
  const { recruiterJobs, recruiterApplications } = useApp();
  const publishedJobs = recruiterJobs.filter((job) => job.status === 'published');
  const activeApplications = recruiterApplications;
  const recent = activeApplications.slice(-3).reverse();
  return <div><PageHeading eyebrow="RECRUITER WORKSPACE" title="Build your next great team." subtitle="A focused place to publish roles and move candidates forward." />
    <div className="welcome-banner recruiter-welcome"><div><div className="eyebrow">YOUR HIRING DESK</div><h2>Great people are ready to grow with you.</h2><p>Share an opportunity, then keep candidate progress moving with a clear workflow.</p><Link to="/recruiter/jobs/create" className="button button-primary">Post a new role <Plus size={15} /></Link></div><div className="welcome-mark"><UsersRound size={48} /></div></div>
    <div className="stat-grid"><Stat label="Published roles" value={publishedJobs.length} icon={<BriefcaseBusiness size={18} />} /><Stat label="Candidates" value={activeApplications.length} icon={<UsersRound size={18} />} /><Stat label="In review" value={activeApplications.filter((app) => app.status === 'reviewing').length} icon={<CheckCircle2 size={18} />} /></div>
    <section className="dashboard-block recruiter-latest"><div className="block-heading"><div><h2>Recent candidates</h2><p>Latest applications across your workspace.</p></div><Link to="/recruiter/jobs">Manage roles <ArrowRight size={14} /></Link></div>
      {recent.length ? <div className="candidate-list">{recent.map((application) => {
        const job = recruiterJobs.find((item) => item.id === application.jobId);
        return <article key={application.id}><span className="candidate-avatar">{application.userId.slice(-1).toUpperCase()}</span>{job && <CompanyLogo companyName={job.company} logo={job.companyLogo} size={32} className="recent-application-mark" />}<div><strong>{job?.title || 'Role application'}</strong><p>Application received {formatDate(application.appliedAt)} · {job?.company}</p></div><span className={`status-badge status-${application.status}`}>{application.status}</span><Link className="text-link" to={`/recruiter/jobs/${job?.id}/applications`}>Review <ArrowRight size={13} /></Link></article>;
      })}</div> : <div className="empty-state"><p>No candidate applications yet. Publish a role to get started.</p><Link className="button button-secondary" to="/recruiter/jobs/create">Post a role</Link></div>}
    </section>
  </div>;
}

export function ManageJobs() {
  const { recruiterJobs, recruiterApplications, updateJob } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const query = (searchParams.get('q') || '').trim().toLowerCase();
  const visibleJobs = recruiterJobs.filter((job) => !query || `${job.title} ${job.company} ${job.location} ${job.skills.join(' ')}`.toLowerCase().includes(query));
  return <div><PageHeading eyebrow="YOUR OPENINGS" title="Manage jobs" subtitle="Review published roles and keep candidate activity moving." /><div className="toolbar"><span>{visibleJobs.length} {visibleJobs.length === 1 ? 'role' : 'roles'}{query ? ` matching “${searchParams.get('q')}”` : ' in your workspace'}</span><Link className="button button-primary" to="/recruiter/jobs/create"><Plus size={16} /> Post a job</Link></div>
    <div className="manage-job-list">{visibleJobs.map((job) => {
      const count = recruiterApplications.filter((application) => application.jobId === job.id).length;
      return <article className="manage-job-card" key={job.id}><div className="manage-job-main"><CompanyLogo companyName={job.company} logo={job.companyLogo} className="company-mark" /><div><h2>{job.title}</h2><p>{job.company} · {job.location} · {job.mode}</p><div className="tag-row"><span className={`status-badge ${job.status === 'published' ? 'status-offer' : 'status-applied'}`}>{job.status}</span><span className="muted-small">Posted {formatDate(job.postedAt)}</span></div></div></div><div className="manage-job-actions"><span className="candidate-count"><UsersRound size={15} /> {count} candidates</span><Link className="button button-secondary button-small" to={`/recruiter/jobs/${job.id}/applications`}>View candidates</Link><button className="button button-quiet button-small" type="button" onClick={() => navigate(`/recruiter/jobs/${job.id}/edit`)}>Edit</button><button className="button button-quiet button-small" type="button" onClick={() => { try { updateJob(job.id, { status: job.status === 'published' ? 'paused' : 'published' }); setError(''); setMessage(`${job.title} is now ${job.status === 'published' ? 'paused' : 'published'}.`); } catch (reason) { setError(reason.message || 'Unable to update this role.'); } }}>{job.status === 'published' ? 'Pause' : 'Publish'}</button></div></article>;
    })}</div>{visibleJobs.length === 0 && <div className="empty-state"><h3>No roles found</h3><p>Try searching by a different role, company, or skill.</p><Link className="button button-secondary" to="/recruiter/jobs">Clear search</Link></div>}{error && <p className="form-message error-message" role="alert">{error}</p>}{message && <p className="form-message success-message">{message}</p>}
  </div>;
}

export function CreateJob() {
  return <JobEditor mode="create" />;
}

export function EditJob() {
  return <JobEditor mode="edit" />;
}

function JobEditor({ mode }) {
  const { jobId } = useParams();
  const { recruiterJobs, profile, createJob, updateJob } = useApp();
  const navigate = useNavigate();
  const existing = mode === 'edit' ? recruiterJobs.find((job) => job.id === jobId) : null;
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState(() => existing ? {
    ...existing, location: existing.mode === 'Remote' ? '' : existing.location, skills: existing.skills.join(', '), preferredSkills: existing.preferredSkills.join(', '),
    branches: existing.branches.join(', '), responsibilities: existing.responsibilities.join('\n'),
    eligibility: existing.eligibility.join('\n'), selection: existing.selection.join('\n'), benefits: existing.benefits.join('\n'),
  } : {
    title: '', company: profile.companyName || '', location: '', mode: 'Hybrid', category: 'Technical', type: 'Internship', level: 'Fresher',
    salary: '', skills: '', preferredSkills: '', branches: 'Any branch', minYear: new Date().getFullYear(),
    description: '', responsibilities: '', eligibility: '', selection: '', benefits: '', deadline: '',
  });
  if (mode === 'edit' && !existing) return <div className="empty-state"><h1>Role not found</h1><Link to="/recruiter/jobs">Back to manage jobs</Link></div>;
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const setWorkMode = (value) => setForm((current) => ({ ...current, mode: value, ...(value === 'Remote' ? { location: '' } : {}) }));
  const textField = (key, label, placeholder = '', required = true) => <label className="field-label">{label}<input required={required} value={form[key] || ''} placeholder={placeholder} onChange={(event) => set(key, event.target.value)} /></label>;
  const selectField = (key, label, values, onChange = (value) => set(key, value)) => <label className="field-label">{label}<SelectField label={label} value={form[key]} options={values.map((option) => ({ value: option, label: option }))} onChange={onChange} /></label>;
  const listField = (key, label, placeholder) => <label className="field-label">{label}<textarea required value={form[key] || ''} placeholder={placeholder} rows="3" onChange={(event) => set(key, event.target.value)} /><span className="field-hint">Enter one item per line.</span></label>;
  function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const list = (value) => value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean);
    const payload = {
      ...form,
      location: form.mode === 'Remote' ? 'Remote' : form.location.trim(),
      skills: list(form.skills), preferredSkills: list(form.preferredSkills), branches: list(form.branches),
      responsibilities: list(form.responsibilities), eligibility: list(form.eligibility),
      selection: list(form.selection), benefits: list(form.benefits), minYear: Number(form.minYear),
      postedAt: existing?.postedAt, status: existing?.status || 'published', visibility: existing?.visibility || 'public',
    };
    delete payload.companyLogo;
    try {
      if (mode === 'create') createJob(payload);
      else updateJob(jobId, payload);
      navigate('/recruiter/jobs', { replace: true });
    } catch (reason) {
      setError(reason.message || 'Unable to save this role.');
      setBusy(false);
    }
  }
  return <div><Link className="back-link" to="/recruiter/jobs">← Back to jobs</Link><PageHeading eyebrow={mode === 'create' ? 'NEW OPPORTUNITY' : 'EDIT OPPORTUNITY'} title={mode === 'create' ? 'Tell candidates about the role.' : 'Update role details.'} subtitle="Clear expectations make it easier for candidates to see if they are a fit." />
    <form className="job-editor-form" onSubmit={submit}>
      <section className="form-section"><h2>Role details</h2><div className="form-grid">{textField('title', 'Job title', 'e.g. Product Analyst Intern')}{textField('company', 'Company', 'Company name')}{form.mode !== 'Remote' && textField('location', 'Location', 'City, State or Remote')}{textField('salary', 'Salary or stipend', 'e.g. ₹20,000 / month')}{selectField('mode', 'Work mode', ['Remote', 'Hybrid', 'On-site'], setWorkMode)}{selectField('category', 'Job category', ['Technical', 'Non-Technical'])}{selectField('type', 'Employment type', ['Internship', 'Full-time', 'Part-time', 'Contract'])}{selectField('level', 'Experience level', ['Fresher', 'Entry level'])}<label className="field-label">Application deadline<input type="date" required value={form.deadline || ''} onChange={(event) => set('deadline', event.target.value)} /></label>{textField('minYear', 'Minimum graduation year', '2025')}</div><label className="field-label editor-wide">Role summary<textarea required rows="4" value={form.description} placeholder="Describe the team, product, and purpose of the role." onChange={(event) => set('description', event.target.value)} /></label></section>
      <section className="form-section"><h2>Skills and requirements</h2><div className="form-grid">{textField('skills', 'Required skills', 'React, SQL, communication')}{textField('preferredSkills', 'Preferred skills', 'Figma, analytics', false)}{textField('branches', 'Eligible branches', 'CSE, IT, Any branch')}</div>{listField('responsibilities', 'Responsibilities', 'Build user-facing features\nWork with product and design')}{listField('eligibility', 'Eligibility requirements', 'Pursuing a relevant degree\nAvailable for the internship period')}{listField('selection', 'Selection process', 'Application review\nInterview')}{listField('benefits', 'Benefits', 'Mentorship\nFlexible hours')}</section>
      {error && <p className="form-message error-message">{error}</p>}<div className="editor-actions"><button className="button button-primary" type="submit" disabled={busy}>{busy ? 'Saving…' : mode === 'create' ? 'Publish role' : 'Save changes'} <CheckCircle2 size={16} /></button><Link className="button button-secondary" to="/recruiter/jobs">Cancel</Link></div>
    </form>
  </div>;
}

export function ManageApplications() {
  const { jobId } = useParams();
  const { recruiterJobs, candidateAccounts, recruiterApplications, updateApplication } = useApp();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [notes, setNotes] = useState({});
  const job = recruiterJobs.find((item) => item.id === jobId);
  if (!job) return <div className="empty-state"><h1>Role not found</h1><Link to="/recruiter/jobs">Back to manage jobs</Link></div>;
  const candidates = recruiterApplications.filter((application) => application.jobId === jobId);
  const statuses = ['applied', 'reviewing', 'interview', 'offer', 'rejected'];
  return <div><Link className="back-link" to="/recruiter/jobs">← Back to jobs</Link><div className="recruiter-job-heading"><CompanyLogo companyName={job.company} logo={job.companyLogo} size={42} /><PageHeading eyebrow="CANDIDATE PIPELINE" title={job.title} subtitle={`${job.company} · ${candidates.length} candidate${candidates.length === 1 ? '' : 's'}`} /></div>
    {candidates.length ? <div className="candidate-list pipeline-list">{candidates.map((application) => {
      const candidate = candidateAccounts.find((account) => account.id === application.userId);
      if (!candidate) return null;
      return <article className="pipeline-candidate" key={application.id}><span className="candidate-avatar">{candidate.name.slice(0, 1)}</span><div className="candidate-info"><strong>{candidate.name}</strong><p><a href={`mailto:${candidate.email}`} style={{ color: 'inherit', textDecoration: 'none' }}>{candidate.email}</a> · <a href={`tel:${candidate.profile?.phone || '+91 98765 43210'}`} style={{ color: 'var(--gold-primary)', textDecoration: 'none' }}>{candidate.profile?.phone || '+91 98765 43210'}</a> · {candidate.profile?.college || 'Education not added'}</p><span className="muted-small">Applied {formatDate(application.appliedAt)}</span></div><div className="candidate-skills">{(candidate.profile?.skills || []).slice(0, 4).map((skill) => <span key={skill}>{skill}</span>)}</div><label className="field-label status-select-label">Application stage<select value={application.status} onChange={(event) => { try { updateApplication(application.id, event.target.value); setError(''); setMessage(`Updated ${candidate.name}'s application.`); } catch (reason) { setError(reason.message || 'Unable to update this application.'); } }}>{statuses.map((status) => <option key={status} value={status}>{status[0].toUpperCase() + status.slice(1)}</option>)}</select></label><div className="candidate-note"><label className="field-label">Recruiter note<textarea rows="2" value={notes[application.id] ?? application.note ?? ''} placeholder="Add a private note for your hiring team" onChange={(event) => setNotes({ ...notes, [application.id]: event.target.value })} /></label><button className="button button-quiet button-small" type="button" onClick={() => { try { updateApplication(application.id, application.status, notes[application.id] ?? application.note ?? ''); setError(''); setMessage(`Saved a note for ${candidate.name}.`); } catch (reason) { setError(reason.message || 'Unable to save this note.'); } }}>Save note</button></div></article>;
    })}</div> : <div className="empty-state"><UsersRound size={25} /><h3>No candidates yet</h3><p>New applications for this opportunity will appear here.</p><Link className="button button-secondary" to={`/jobs/${job.id}`}>View public job</Link></div>}
    {error && <p className="form-message error-message" role="alert">{error}</p>}
    {message && <p className="form-message success-message">{message}</p>}
  </div>;
}

export function RecruiterNotifications() {
  const { recruiterJobs, recruiterApplications } = useApp();
  const notices = recruiterApplications.map((application) => {
    const job = recruiterJobs.find((item) => item.id === application.jobId);
    return job ? { id: application.id, job, application } : null;
  }).filter(Boolean);
  return <div><PageHeading eyebrow="HIRING UPDATES" title="Notifications" subtitle="Recent candidate activity across the roles in your workspace." />{notices.length ? <div className="notification-list">{notices.map(({ id, job, application }) => <article key={id}><span className="notification-icon"><UsersRound size={17} /></span><div><strong>New candidate activity · {job.title}</strong><p>Application status: {application.status} · {job.company}</p><Link to={`/recruiter/jobs/${job.id}/applications`}>Review candidates <ArrowRight size={13} /></Link></div><span className="notification-date">{formatDate(application.appliedAt)}</span></article>)}</div> : <div className="empty-state"><p>Candidate activity will appear here.</p><Link className="button button-secondary" to="/recruiter/jobs/create">Publish a role</Link></div>}</div>;
}

export function RecruiterApplications() {
  const { candidateAccounts, recruiterJobs, recruiterApplications } = useApp();
  const [searchParams] = useSearchParams();
  const query = (searchParams.get('q') || '').trim().toLowerCase();
  const candidates = recruiterApplications.map((application) => ({
    application,
    job: recruiterJobs.find((job) => job.id === application.jobId),
    candidate: candidateAccounts.find((account) => account.id === application.userId),
  })).filter(({ job, candidate }) => job && candidate && (!query || `${job.title} ${job.company} ${candidate.name} ${candidate.email}`.toLowerCase().includes(query)))
    .sort((a, b) => b.application.appliedAt.localeCompare(a.application.appliedAt));
  return <div><PageHeading eyebrow="CANDIDATE PIPELINE" title="Applications" subtitle="Review candidates across the roles in your workspace." />
    {candidates.length ? <div className="candidate-list pipeline-list">{candidates.map(({ application, job, candidate }) => <article className="pipeline-candidate" key={application.id}>
      <span className="candidate-avatar">{candidate.name.slice(0, 1)}</span><CompanyLogo companyName={job.company} logo={job.companyLogo} size={32} className="pipeline-company-logo" /><div className="candidate-info"><strong>{candidate.name}</strong><p>{job.title} · <a href={`mailto:${candidate.email}`} style={{ color: 'inherit', textDecoration: 'none' }}>{candidate.email}</a> · <a href={`tel:${candidate.profile?.phone || '+91 98765 43210'}`} style={{ color: 'var(--gold-primary)', textDecoration: 'none' }}>{candidate.profile?.phone || '+91 98765 43210'}</a></p><span className="muted-small">Applied {formatDate(application.appliedAt)}</span></div>
      <span className={`status-badge status-${application.status}`}>{application.status}</span><Link className="button button-secondary button-small" to={`/recruiter/jobs/${job.id}/applications`}>Review candidate</Link>
    </article>)}</div> : <div className="empty-state"><UsersRound size={25} /><h3>No applications found</h3><p>Candidate applications for your open roles will appear here.</p><Link className="button button-secondary" to="/recruiter/jobs">Manage roles</Link></div>}
  </div>;
}

export function RecruiterSettings() {
  const { profile, updateProfile } = useApp();
  const [companyName, setCompanyName] = useState(profile.companyName || '');
  const [companyLogo, setCompanyLogo] = useState(profile.companyLogo || '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  function submit(event) {
    event.preventDefault();
    setMessage('');
    setError('');
    try {
      updateProfile({ companyName, companyLogo });
      setMessage('Company profile saved. Your current job listings now use this branding.');
    } catch (reason) {
      setError(reason.message || 'Unable to save your company profile.');
    }
  }
  return <div><PageHeading eyebrow="PREFERENCES" title="Company profile" subtitle="Manage your company name and logo. These details are stored locally in this browser." />
    <form className="settings-card recruiter-company-settings" onSubmit={submit}>
      <div className="recruiter-company-settings-fields">
        <label className="field-label">Company name<div className="input-wrap"><input required autoComplete="organization" value={companyName} onChange={(event) => setCompanyName(event.target.value)} placeholder="Your company name" /></div></label>
        <div className="field-label">Current company logo<CompanyLogoField companyName={companyName} logo={companyLogo} onChange={setCompanyLogo} /></div>
        <p className="muted-small">When you save a logo change, it updates the branding shown on jobs posted by your account. Removing the logo restores the company initial.</p>
        {error && <p className="form-message error-message" role="alert">{error}</p>}
        {message && <p className="form-message success-message" role="status">{message}</p>}
        <button type="submit" className="button button-primary">Save changes <CheckCircle2 size={16} /></button>
      </div>
      <span className="tag tag-good">Local demo</span>
    </form>
    <div className="notice-box"><strong>Production readiness</strong><p>Company images are saved as small data URLs in this browser for the frontend demo. Do not use this local storage approach for production authentication or company assets.</p></div>
  </div>;
}

function PageHeading({ eyebrow, title, subtitle }) {
  return <div className="dashboard-page-heading"><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{subtitle}</p></div>;
}

function Stat({ label, value, icon }) {
  return <article className="stat-card"><span className="stat-icon">{icon}</span><span className="stat-label">{label}</span><strong>{value}</strong></article>;
}
