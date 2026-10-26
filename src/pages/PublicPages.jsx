import { ArrowRight, BadgeCheck, Building2, CheckCircle2, Mail, MapPin, Phone, Search, Share2, Sparkles, Target, UsersRound } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import JobCard from '../components/common/JobCard.jsx';
import CompanyLogo from '../components/common/CompanyLogo.jsx';
import { useApp } from '../context/AppContext.jsx';
import { formatDate, getEligibility, matchScore } from '../utils/jobUtils.js';

export function HomePage() {
  const { jobs } = useApp();
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const navigate = useNavigate();
  const publishedJobs = useMemo(() => jobs.filter((job) => job.status === 'published' && job.visibility === 'public'), [jobs]);
  const companies = useMemo(() => [...new Set(publishedJobs.map((job) => job.company))], [publishedJobs]);
  const skills = useMemo(() => new Set(publishedJobs.flatMap((job) => job.skills)).size, [publishedJobs]);
  const pathways = useMemo(() => new Set(publishedJobs.map((job) => job.category)).size, [publishedJobs]);
  const searchJobs = (term = query) => {
    const params = new URLSearchParams();
    if (term.trim()) params.set('q', term.trim());
    if (location.trim()) params.set('location', location.trim());
    navigate(`/jobs${params.size ? `?${params.toString()}` : ''}`);
  };
  return <div className="home-page">
    <section className="hero-section">
      <div className="hero-copy">
        <div className="eyebrow"><span className="eyebrow-dot" /> A more human way to find your next move</div>
        <h1>Work that<br /><em>moves</em> you<br />forward.</h1>
        <p>Discover thoughtful opportunities with teams building what comes next. HireHub brings the right people and the right work together.</p>
        <div className="hero-links"><Link className="button button-primary" to="/jobs">Find your next job <ArrowRight size={16} /></Link><Link className="button button-secondary" to="/register?role=recruiter">I’m hiring <ArrowRight size={15} /></Link></div>
        <div className="hero-proof"><div className="proof-avatars"><span>H</span><span>H</span><span>H</span></div><span><strong>Discover opportunities at your pace.</strong><br />Take your next career step with clarity.</span></div>
      </div>
      <div className="hero-visual">
        <div className="floating-note hero-note-one"><CheckCircle2 size={18} /><span><strong>Thoughtful fit</strong><br />Roles worth a closer look</span></div>
        <div className="spotlight-card hero-search-panel">
          <p className="muted-small">YOUR NEXT CHAPTER</p><h2>Explore opportunities</h2><p>Find work that fits where you want to go.</p>
          <form className="hero-search" onSubmit={(event) => { event.preventDefault(); searchJobs(); }}>
            <label><span>Role, skill, or company</span><span className="hero-search-field"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="e.g. Product design" aria-label="Search roles, companies, or skills" /></span></label>
            <label><span>Location</span><span className="hero-search-field"><MapPin size={17} /><input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="City or remote" aria-label="Job location" /></span></label>
            <button className="button button-primary" type="submit">Search opportunities <ArrowRight size={16} /></button>
          </form>
          <div className="popular-searches"><span>EXPLORE</span>{['Product Design', 'Remote', 'Engineering'].map((term) => <button type="button" key={term} onClick={() => { setQuery(term); searchJobs(term); }}>{term}</button>)}</div>
        </div>
        <div className="floating-note hero-note-two"><Sparkles size={18} /><span><strong>New this week</strong><br />Fresh opportunities to explore</span></div>
      </div>
    </section>
    <section className="trust-strip home-stats" aria-label="HireHub opportunity statistics">
      <div><strong>{publishedJobs.length}</strong><span>Opportunities available</span></div><div><strong>{companies.length}</strong><span>Companies represented</span></div><div><strong>{skills}</strong><span>Skills to explore</span></div><div><strong>{pathways}</strong><span>Career pathways</span></div>
    </section>
    <section className="section featured-section" id="jobs"><div className="section-heading"><div><div className="eyebrow">A place to begin</div><h2>Find work that fits.</h2><p>Explore opportunities aligned with your skills, interests, and ambitions.</p></div><Link className="text-link" to="/jobs">Browse all jobs <ArrowRight size={15} /></Link></div>
      {publishedJobs.length ? <div className="job-grid">{publishedJobs.slice(0, 3).map((job) => <JobCard key={job.id} job={job} />)}</div> : <div className="empty-state"><h3>New opportunities are on the way</h3><p>Check back soon for roles from growing teams.</p></div>}
    </section>
    <section className="section how-section" id="about"><div className="section-heading centered"><div><div className="eyebrow">How HireHub works</div><h2>Your career, one clear step at a time.</h2><p>Everything you need to move from exploring to getting hired.</p></div></div>
      <div className="step-grid">{[['01', 'Discover', 'Find opportunities based on your interests, skills, and eligibility.'], ['02', 'Develop', 'Use Up Skill to identify learning opportunities and build relevant projects.'], ['03', 'Apply', 'Submit applications directly through HireHub.'], ['04', 'Progress', 'Track your application status as recruiters review your profile.']].map(([number, title, text]) => <article className="step-card" key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
    </section>
    <section className="section companies-section" id="companies"><div className="section-heading"><div><div className="eyebrow">The teams behind the roles</div><h2>Companies hiring on HireHub.</h2><p>Explore organizations represented in the current opportunity listings.</p></div></div><div className="companies-list">{companies.length ? companies.map((company) => <Link key={company} to={`/jobs?company=${encodeURIComponent(company)}`}><Building2 size={17} />{company}<ArrowRight size={13} /></Link>) : <p>Company listings will appear here as roles are published.</p>}</div></section>
    <section className="section value-section"><div className="value-copy"><div className="eyebrow">More than a job board</div><h2>Make your potential easier to see.</h2><p>HireHub brings useful opportunities and career momentum together, so you can focus on what comes next.</p><Link className="button button-primary" to="/register">Build your profile <ArrowRight size={15} /></Link></div><div className="value-list">
      <article><span><Target size={18} /></span><div><strong>Skill-oriented discovery</strong><p>See why a role matches the skills you already have.</p></div></article>
      <article><span><BadgeCheck size={18} /></span><div><strong>Clarity for early careers</strong><p>Find internships and entry-level roles that welcome new talent.</p></div></article>
      <article><span><CheckCircle2 size={18} /></span><div><strong>Transparent progress</strong><p>Know where your applications stand without losing track.</p></div></article>
      <article><span><Sparkles size={18} /></span><div><strong>Space to grow</strong><p>Turn a missing skill into your next learning goal.</p></div></article>
    </div></section>
    <section className="section audience-section"><div className="section-heading"><div><div className="eyebrow">Built for both sides</div><h2>Better beginnings, better hiring.</h2></div></div><div className="audience-grid">
      <article><div className="audience-icon"><UsersRound size={20} /></div><div className="eyebrow">FOR JOB SEEKERS</div><h3>Find a role where you can grow.</h3><p>Explore technical and non-technical opportunities, make your skills visible, and follow each application through.</p><Link to="/jobs">Explore opportunities <ArrowRight size={14} /></Link></article>
      <article><div className="audience-icon"><Target size={20} /></div><div className="eyebrow">FOR RECRUITERS</div><h3>Meet people ready to learn.</h3><p>Share clear role expectations, review candidate profiles, and move applicants through a focused hiring workflow.</p><Link to="/register?role=recruiter">Create a recruiter account <ArrowRight size={14} /></Link></article>
    </div></section>
    <section className="final-cta"><div><div className="eyebrow">Make today your starting point</div><h2>Your next opportunity is out there.</h2><p>Explore roles that match what you can do — and what you want to become.</p></div><div><Link className="button button-primary" to="/jobs">Find your next role <ArrowRight size={16} /></Link><Link className="cta-secondary" to="/register">Join HireHub</Link></div></section>
  </div>;
}

export function JobsPage() {
  const { jobs } = useApp();
  const params = new URLSearchParams(window.location.search);
  const [filters, setFilters] = useState({ q: params.get('q') || '', category: 'All jobs', location: params.get('location') || 'Any location', mode: 'Any mode', type: 'Any type', level: 'Any level', branch: 'Any branch', company: params.get('company') || '', compensation: 'Any compensation' });
  const update = (key, value) => setFilters((current) => ({ ...current, [key]: value }));
  const clear = () => setFilters({ q: '', category: 'All jobs', location: 'Any location', mode: 'Any mode', type: 'Any type', level: 'Any level', branch: 'Any branch', company: '', compensation: 'Any compensation' });
  const locations = useMemo(() => ['Any location', ...new Set(jobs.map((job) => job.location))], [jobs]);
  const companies = useMemo(() => ['Any company', ...new Set(jobs.map((job) => job.company))], [jobs]);
  const results = jobs.filter((job) => {
    const search = filters.q.trim().toLowerCase();
    const searchable = [job.title, job.company, job.description, ...job.skills].join(' ').toLowerCase();
    return job.status === 'published' && job.visibility === 'public'
      && (!search || searchable.includes(search))
      && (filters.category === 'All jobs' || job.category === filters.category)
      && (filters.location === 'Any location' || job.location.toLowerCase().includes(filters.location.toLowerCase()))
      && (filters.mode === 'Any mode' || job.mode === filters.mode)
      && (filters.type === 'Any type' || job.type === filters.type)
      && (filters.level === 'Any level' || job.level === filters.level)
      && (filters.branch === 'Any branch' || job.branches.includes('Any branch') || job.branches.includes(filters.branch))
      && (!filters.company || filters.company === 'Any company' || job.company === filters.company)
      && (filters.compensation === 'Any compensation'
        || (filters.compensation === 'Monthly stipend' && /\/ month/i.test(job.salary))
        || (filters.compensation === 'Annual salary' && /lpa/i.test(job.salary)));
  });
  return <div className="jobs-page page-container"><div className="page-intro"><div className="eyebrow">Your next step starts here</div><h1>Find work that fits.</h1><p>Search opportunities from teams looking for your potential, not just your years of experience.</p></div>
    <div className="jobs-search"><Search size={18} /><input value={filters.q} onChange={(event) => update('q', event.target.value)} placeholder="Search roles, companies, skills" aria-label="Search jobs" /></div>
    <div className="jobs-layout"><aside className="filter-panel"><div className="filter-heading"><h2>Filters</h2><button type="button" className="text-button" onClick={clear}>Clear all</button></div>
      <label className="field-label">Job category<select value={filters.category} onChange={(event) => update('category', event.target.value)}><option>All jobs</option><option>Technical</option><option>Non-Technical</option></select></label>
      <label className="field-label">Location<select value={filters.location} onChange={(event) => update('location', event.target.value)}>{filters.location !== 'Any location' && !locations.includes(filters.location) && <option>{filters.location}</option>}{locations.map((location) => <option key={location}>{location}</option>)}</select></label>
      <label className="field-label">Work mode<select value={filters.mode} onChange={(event) => update('mode', event.target.value)}><option>Any mode</option><option>Remote</option><option>Hybrid</option><option>On-site</option></select></label>
      <label className="field-label">Employment type<select value={filters.type} onChange={(event) => update('type', event.target.value)}><option>Any type</option><option>Internship</option><option>Full-time</option><option>Part-time</option><option>Contract</option></select></label>
      <label className="field-label">Experience level<select value={filters.level} onChange={(event) => update('level', event.target.value)}><option>Any level</option><option>Fresher</option><option>Entry level</option></select></label>
      <label className="field-label">Branch eligibility<select value={filters.branch} onChange={(event) => update('branch', event.target.value)}><option>Any branch</option>{['CSE', 'IT', 'AI/ML', 'Data Science', 'Cybersecurity', 'Computer Engineering', 'Software Engineering', 'ECE', 'Other'].map((branch) => <option key={branch}>{branch}</option>)}</select></label>
      <label className="field-label">Company<select value={filters.company || 'Any company'} onChange={(event) => update('company', event.target.value === 'Any company' ? '' : event.target.value)}>{companies.map((company) => <option key={company}>{company}</option>)}</select></label>
      <label className="field-label">Compensation<select value={filters.compensation} onChange={(event) => update('compensation', event.target.value)}><option>Any compensation</option><option>Monthly stipend</option><option>Annual salary</option></select></label>
    </aside><section className="results-panel"><div className="results-heading"><div><strong>{results.length} opportunities</strong><span> across India</span></div><span className="sort-label">Skills-first · Updated regularly</span></div>
      {results.length ? <div className="job-list">{results.map((job) => <JobCard key={job.id} job={job} />)}</div> : <div className="empty-state"><Search size={24} /><h3>No roles found</h3><p>Try another keyword or clear some filters to see more opportunities.</p><button className="button button-secondary" onClick={clear} type="button">Clear filters</button></div>}
    </section></div>
  </div>;
}

export function UpSkillLandingPage() {
  return <div className="page-container upskill-landing">
    <div className="eyebrow">GROW WITH INTENTION</div><h1>Make your next skill count.</h1>
    <p>Up Skill connects the skills employers ask for with practical next steps you can take at your own pace.</p>
    <div className="upskill-intro"><Sparkles size={22} /><div><h2>A learning path, shaped around your goals.</h2><p>Build a profile, explore opportunities, and see which skills show up in roles that interest you. HireHub suggests focus areas without pretending one course fits everyone.</p></div></div>
    <div className="step-grid"><article className="step-card"><span>01</span><h3>Know your starting point</h3><p>Add skills, projects, and interests to your profile.</p></article><article className="step-card"><span>02</span><h3>Notice the patterns</h3><p>Compare your skills with requirements in open jobs.</p></article><article className="step-card"><span>03</span><h3>Choose what to practice</h3><p>Set a small goal using courses and resources you trust.</p></article><article className="step-card"><span>04</span><h3>Show what you learned</h3><p>Add projects and new skills to your profile when ready.</p></article></div>
    <div className="final-cta"><div><div className="eyebrow">START WITH YOUR PROFILE</div><h2>Turn a skill gap into a next step.</h2><p>Join HireHub to see role-based suggestions tailored to your interests.</p></div><div><Link className="button button-primary" to="/register">Create a job-seeker account <ArrowRight size={15} /></Link></div></div>
  </div>;
}

export function JobDetailsPage() {
  const { jobId } = useParams();
  const { jobs, user, profile, savedJobIds, toggleSavedJob, applyToJob, applications } = useApp();
  const [message, setMessage] = useState('');
  const [sharing, setSharing] = useState(false);
  const navigate = useNavigate();
  const job = jobs.find((item) => item.id === jobId);
  if (!job || job.status !== 'published' || job.visibility !== 'public') return <div className="page-container"><div className="empty-state"><h1>Opportunity unavailable</h1><p>This job may have closed or moved.</p><Link className="button button-primary" to="/jobs">Browse open jobs</Link></div></div>;
  const eligibility = getEligibility(job, profile);
  const alreadyApplied = applications.some((application) => application.userId === user?.id && application.jobId === job.id);
  const score = user?.role === 'seeker' ? matchScore(job, profile) : null;
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: job.title, text: `${job.title} at ${job.company}`, url });
      else if (navigator.clipboard) { await navigator.clipboard.writeText(url); setMessage('Job link copied to clipboard.'); }
      else { window.prompt('Copy this job link:', url); }
    } catch (error) {
      if (error.name !== 'AbortError') setMessage('Sharing was not available. You can copy the page URL from your browser.');
    }
  };
  return <div className="job-detail-page page-container">
    <Link className="back-link" to="/jobs">← Back to jobs</Link>
    <div className="detail-layout"><article className="detail-main">
      <div className="detail-company"><CompanyLogo companyName={job.company} logo={job.companyLogo} size={50} className="company-mark-large" /><div><p>{job.company}</p><span><MapPin size={14} /> {job.location}</span></div></div>
      <h1>{job.title}</h1><div className="tag-row"><span className="tag">{job.category}</span><span className="tag">{job.type}</span><span className="tag">{job.mode}</span><span className="tag">{job.level}</span></div>
      <div className="detail-facts"><div><span>Compensation</span><strong>{job.salary}</strong></div><div><span>Application deadline</span><strong>{formatDate(job.deadline)}</strong></div><div><span>Posted</span><strong>{formatDate(job.postedAt)}</strong></div></div>
      <section className="detail-section"><h2>About the role</h2><p>{job.description}</p></section>
      <section className="detail-section"><h2>What you'll do</h2><ul>{job.responsibilities.map((item) => <li key={item}>{item}</li>)}</ul></section>
      <section className="detail-section"><h2>Skills for this role</h2><p className="detail-subtitle">Required</p><div className="skill-row">{job.skills.map((skill) => <span key={skill}>{skill}</span>)}</div><p className="detail-subtitle">Nice to have</p><div className="skill-row">{job.preferredSkills.map((skill) => <span key={skill}>{skill}</span>)}</div></section>
      <section className="detail-section"><h2>Eligibility</h2><ul>{job.eligibility.map((item) => <li key={item}>{item}</li>)}</ul><p>Branches: {job.branches.join(', ')} · Graduation year: {job.minYear} or later</p></section>
      <section className="detail-section"><h2>Selection process</h2><ol>{job.selection.map((item) => <li key={item}>{item}</li>)}</ol></section>
      <section className="detail-section"><h2>What you'll get</h2><ul>{job.benefits.map((item) => <li key={item}>{item}</li>)}</ul></section>
      <section className="detail-section employer-contact-section">
        <h2>Employer contact & inquiries</h2>
        <div className="job-employer-contact">
          <p>Questions regarding this role or application process? Reach out to the talent acquisition team:</p>
          <div className="job-contact-row">
            <a href={`mailto:careers@${job.company.toLowerCase().replace(/[^a-z0-9]/g, '')}.in`} className="job-contact-link">
              <Mail size={14} /> careers@{job.company.toLowerCase().replace(/[^a-z0-9]/g, '')}.in
            </a>
            <a href="tel:+918041235678" className="job-contact-link">
              <Phone size={14} /> +91 (080) 4123-5678 (Ext. {100 + (job.id.length * 37) % 900})
            </a>
            <span className="job-contact-link">
              <MapPin size={14} /> {job.location}
            </span>
          </div>
        </div>
      </section>
    </article><aside className="apply-panel"><div className="apply-panel-label">APPLICATION</div><h2>Take the next step.</h2><p>Review the details and apply when you're ready.</p>
      {score !== null && <div className="detail-match"><span>Skills match</span><strong>{score}%</strong></div>}
      {user?.role === 'seeker' ? <div className={`eligibility-note ${eligibility.eligible ? 'eligible' : 'not-eligible'}`}><strong>{eligibility.eligible ? 'You can apply' : 'Review eligibility'}</strong><p>{eligibility.reason}</p></div> : <div className="eligibility-note"><p>Sign in as a job seeker to check eligibility and apply.</p></div>}
      {user?.role === 'seeker' ? <button className="button button-primary button-full" type="button" disabled={!eligibility.eligible || alreadyApplied} onClick={() => { try { applyToJob(job); setMessage('Application submitted. Track it from My applications.'); } catch (error) { setMessage(error.message); } }}>{alreadyApplied ? 'Application submitted' : 'Apply now'} <ArrowRight size={16} /></button> : <button className="button button-primary button-full" type="button" onClick={() => navigate(`/login?next=${encodeURIComponent(window.location.pathname)}`)}>Log in to apply <ArrowRight size={16} /></button>}
      <button className="button button-secondary button-full" type="button" onClick={() => { if (!user) navigate('/login'); else if (user.role === 'seeker') toggleSavedJob(job.id); else setMessage('Saving jobs is available for job-seeker accounts.'); }}>{savedJobIds.includes(job.id) ? 'Saved to your list' : 'Save this job'}</button>
      <button className="button button-quiet button-full" type="button" disabled={sharing} onClick={async () => { setSharing(true); await share(); setSharing(false); }}><Share2 size={15} /> Share job</button>
      {message && <p className="form-message success-message">{message}</p>}
      <div className="privacy-note">Your application details are only used in this local HireHub demo.</div>
    </aside></div>
  </div>;
}

export function NotFoundPage() {
  return <div className="not-found page-container"><span className="not-found-code">404</span><div className="eyebrow">Wrong turn?</div><h1>This page isn't part of the journey.</h1><p>The page may have moved, or the link may be out of date.</p><Link className="button button-primary" to="/">Back to HireHub</Link></div>;
}

export function UnauthorizedPage() {
  const { user } = useApp();
  const destination = user?.role === 'recruiter' ? '/recruiter/dashboard' : '/job-seeker/dashboard';
  return <div className="not-found page-container"><div className="eyebrow">Different workspace</div><h1>This area is for another account type.</h1><p>Use your {user?.role === 'recruiter' ? 'recruiter' : 'job seeker'} workspace, or sign in with a different account.</p><Link className="button button-primary" to={destination}>Go to my dashboard</Link></div>;
}
