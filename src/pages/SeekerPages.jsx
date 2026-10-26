import { ArrowRight, Bell, Bookmark, BookOpen, BriefcaseBusiness, CheckCircle2, Clock3, GraduationCap, MapPin, Sparkles, Target, UserRound, UsersRound } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import JobCard from '../components/common/JobCard.jsx';
import CompanyLogo from '../components/common/CompanyLogo.jsx';
import PrepareForJob from '../components/upskill/PrepareForJob.jsx';
import SkillLearningPathModal from '../components/upskill/SkillLearningPathModal.jsx';
import SkillRelatedJobsModal from '../components/upskill/SkillRelatedJobsModal.jsx';
import { loadUserPreparationState, saveUserPreparationState, getSkillLearningPath } from '../services/preparationService.js';
import { useApp } from '../context/AppContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { formatDate, getEligibility, matchScore, profileCompletion } from '../utils/jobUtils.js';

export function SeekerDashboard() {
  const { user, profile, jobs, applications, savedJobIds, toggleSavedJob } = useApp();
  const myApplications = applications.filter((application) => application.userId === user.id)
    .sort((a, b) => b.appliedAt.localeCompare(a.appliedAt));
  const recommended = jobs.filter((job) => getEligibility(job, profile).eligible)
    .map((job) => ({ job, score: matchScore(job, profile) }))
    .sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 3);
  const completion = profileCompletion(profile, user.name);
  const interviews = myApplications.filter((application) => application.status === 'interview'
    && application.interviewAt && new Date(application.interviewAt) >= new Date());
  const recentJobs = [...jobs].filter((job) => job.status === 'published' && job.visibility === 'public')
    .sort((a, b) => b.postedAt.localeCompare(a.postedAt)).slice(0, 3);
  const skillSuggestions = useMemo(() => {
    const existing = (profile.skills || []).map((skill) => skill.toLowerCase());
    const counts = new Map();
    jobs.filter((job) => job.status === 'published').forEach((job) => job.skills.forEach((skill) => {
      if (!existing.includes(skill.toLowerCase())) counts.set(skill, (counts.get(skill) || 0) + 1);
    }));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
  }, [jobs, profile]);
  return <div className="seeker-dashboard">
    <div className="dashboard-welcome">
      <div><div className="eyebrow">YOUR CAREER OVERVIEW</div><h1>Welcome back, {user.name.split(' ')[0]}</h1><p>Here's what's happening with your job search.</p></div>
      <Link to="/job-seeker/jobs" className="button button-primary">Explore jobs <ArrowRight size={15} /></Link>
    </div>
    <div className="stat-grid seeker-stat-grid">
      <Stat label="Applications submitted" value={myApplications.length} description="All-time applications" icon={<BriefcaseBusiness size={17} />} />
      <Stat label="Under review" value={myApplications.filter((application) => ['applied', 'reviewing'].includes(application.status)).length} description="With a hiring team" icon={<Clock3 size={17} />} />
      <Stat label="Interviews scheduled" value={interviews.length} description={interviews.length ? 'Your next career conversation' : 'No upcoming interviews'} icon={<UsersRound size={17} />} />
      <Stat label="Profile completion" value={`${completion}%`} description={completion < 100 ? 'A few details can help' : 'Your profile is looking good'} icon={<UserRound size={17} />} />
    </div>
    <div className="dashboard-panel-grid">
      <section className="dashboard-panel recommended-panel">
        <div className="panel-heading"><div><span className="panel-kicker">MATCHED TO YOUR PROFILE</span><h2>Recommended jobs</h2></div><Link to="/job-seeker/jobs">View all <ArrowRight size={14} /></Link></div>
        {recommended.length ? <div className="recommended-list">{recommended.map(({ job, score }) => <article className="recommended-job" key={job.id}>
          <CompanyLogo companyName={job.company} logo={job.companyLogo} size={38} className="recommended-job-mark" /><div className="recommended-job-copy"><Link to={`/jobs/${job.id}`}><h3>{job.title}</h3></Link><p>{job.company} <span>·</span> {job.location}</p><div className="recommended-job-meta"><span>{job.type}</span><span>{job.salary}</span></div><div className="skill-row">{job.skills.slice(0, 3).map((skill) => <span key={skill}>{skill}</span>)}</div></div>
          <div className="recommended-job-actions">{score !== null && <span className="match-score"><Target size={13} /> {score}% match</span>}<button className={`recommended-save ${savedJobIds.includes(job.id) ? 'saved' : ''}`} type="button" aria-label={savedJobIds.includes(job.id) ? `Remove ${job.title} from saved jobs` : `Save ${job.title}`} onClick={() => toggleSavedJob(job.id)}><Bookmark size={13} /> {savedJobIds.includes(job.id) ? 'Saved' : 'Save'}</button><Link to={`/jobs/${job.id}`} className="recommended-details">Details <ArrowRight size={13} /></Link></div>
        </article>)}</div> : <Empty text="Add skills to your profile to get relevant recommendations." link="/job-seeker/profile" label="Complete profile" />}
      </section>
      <section className="dashboard-panel recent-applications-panel">
        <div className="panel-heading"><div><span className="panel-kicker">KEEP YOUR MOMENTUM</span><h2>Recent applications</h2></div><Link to="/job-seeker/applications">See all <ArrowRight size={14} /></Link></div>
        {myApplications.length ? <div className="recent-application-list">{myApplications.slice(0, 4).map((application) => {
          const job = jobs.find((item) => item.id === application.jobId);
          if (!job) return null;
          return <article className="recent-application" key={application.id}><CompanyLogo companyName={job.company} logo={job.companyLogo} size={32} className="recent-application-mark" /><div><Link to={`/jobs/${job.id}`}><strong>{job.title}</strong></Link><p>{job.company} <span>·</span> {formatDate(application.appliedAt)}</p></div><span className={`status-badge status-${application.status}`}>{application.status}</span></article>;
        })}</div> : <Empty text="Your applications and their latest status will show here." link="/job-seeker/jobs" label="Find your first role" />}
      </section>
    </div>
    <div className="dashboard-panel-grid dashboard-secondary-grid">
      <section className="dashboard-panel recent-jobs-panel">
        <div className="panel-heading"><div><span className="panel-kicker">FRESH OPPORTUNITIES</span><h2>Recently posted</h2></div><Link to="/job-seeker/jobs">Browse jobs <ArrowRight size={14} /></Link></div>
        {recentJobs.map((job) => <article className="recent-job-row" key={job.id}><CompanyLogo companyName={job.company} logo={job.companyLogo} size={32} className="recent-application-mark" /><div><Link to={`/jobs/${job.id}`}><strong>{job.title}</strong></Link><p>{job.company} <span>·</span> <MapPin size={12} /> {job.location}</p></div><span className="recent-job-pay">{job.salary}</span></article>)}
      </section>
      <section className="dashboard-panel skill-panel">
        <div className="panel-heading"><div><span className="panel-kicker">GROW YOUR PROFILE</span><h2>Skills to explore</h2></div><Link to="/job-seeker/up-skill">Up Skill <ArrowRight size={14} /></Link></div>
        {skillSuggestions.length ? <><p className="panel-description">These skills appear in open roles but aren't listed on your profile yet.</p><div className="suggested-skill-list">{skillSuggestions.map(([skill, count]) => <span key={skill}>{skill}<small>{count} {count === 1 ? 'role' : 'roles'}</small></span>)}</div></> : <p className="panel-description">Your current skills cover the open roles. Keep adding projects and experience to your profile.</p>}
        <div className="profile-reminder"><span className="profile-reminder-icon"><UserRound size={17} /></span><div><strong>Your profile is {completion}% complete</strong><p>{completion < 100 ? 'A few more details can help recruiters get to know you.' : 'Your profile is ready to make an impression.'}</p></div><Link to="/job-seeker/profile" aria-label="Update your profile"><ArrowRight size={16} /></Link></div>
      </section>
    </div>
    {interviews.length > 0 && <section className="dashboard-panel interviews-panel"><div className="panel-heading"><div><span className="panel-kicker">COMING UP</span><h2>Upcoming interviews</h2></div></div>{interviews.map((application) => {
      const job = jobs.find((item) => item.id === application.jobId);
      return job ? <article className="upcoming-interview" key={application.id}><span className="interview-date">{new Date(application.interviewAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span><div><strong>{job.title}</strong><p>{job.company} · {new Date(application.interviewAt).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}</p></div><span className="tag tag-good">Interview</span></article> : null;
    })}</section>}
  </div>;
}

export function SeekerProfile() {
  const { user, profile, updateProfile } = useApp();
  const [form, setForm] = useState({ ...profile, name: user.name, email: user.email, skills: (profile.skills || []).join(', ') });
  const [message, setMessage] = useState('');
  const completion = profileCompletion({ ...form, skills: form.skills.split(',').filter(Boolean) }, user.name);
  const field = (name, label, placeholder = '', optional = false) => <label className="field-label">{label}{optional && <span className="optional-label"> · Optional</span>}<input value={form[name] || ''} placeholder={placeholder} onChange={(event) => setForm({ ...form, [name]: event.target.value })} /></label>;
  function submit(event) {
    event.preventDefault();
    try {
      if (!form.name.trim() || !form.email.trim()) throw new Error('Name and email are required.');
      updateProfile({ ...form, skills: form.skills.split(',').map((skill) => skill.trim()).filter(Boolean) });
      setMessage('Your profile has been saved.');
    } catch (error) { setMessage(error.message); }
  }
  return <div><PageHeading eyebrow="YOUR PROFILE" title="Show what you can do." subtitle="A complete profile helps the right opportunities find you." />
    <div className="profile-progress"><div><strong>Profile completeness</strong><span>{completion}%</span></div><div className="progress-track"><span style={{ width: `${completion}%` }} /></div><p>Required details are kept simple. Add optional details whenever you're ready.</p></div>
    <form className="profile-form" onSubmit={submit}>
      <section className="form-section"><h2>Personal information</h2><p>Your contact and education details.</p><div className="form-grid">{field('name', 'Full name', user.name)}{field('email', 'Email', user.email)}{field('phone', 'Phone number', '+91', true)}{field('college', 'College or university', 'Your institution')}{field('degree', 'Degree', 'B.Tech, B.Com, etc.')}{field('branch', 'Branch / discipline', 'e.g. CSE, ECE, Design')}{field('graduationYear', 'Graduation year', '2027')}{field('semester', 'Current semester', 'e.g. 5th', true)}{field('cgpa', 'CGPA', 'e.g. 8.2 / 10', true)}{field('preferredLocation', 'Preferred location', 'City or Remote')}</div></section>
      <section className="form-section"><h2>Professional information</h2><p>Share your practical skills and work samples. These details are optional.</p><div className="form-grid">{field('skills', 'Skills', 'React, SQL, communication', true)}{field('projects', 'Projects', 'What have you built?', true)}{field('internships', 'Internships & experience', 'Role, company, and what you did', true)}{field('certifications', 'Certifications', 'Name of certification', true)}{field('resume', 'Resume link or details', 'Paste a shareable link', true)}{field('github', 'GitHub profile', 'https://github.com/…', true)}{field('linkedin', 'LinkedIn profile', 'https://linkedin.com/in/…', true)}{field('portfolio', 'Portfolio URL', 'https://…', true)}</div></section>
      {message && <p className="form-message success-message" role="status">{message}</p>}<button className="button button-primary" type="submit">Save profile <CheckCircle2 size={16} /></button>
    </form>
  </div>;
}

export function SavedJobs() {
  const { jobs, savedJobIds } = useApp();
  const saved = jobs.filter((job) => savedJobIds.includes(job.id));
  return <div><PageHeading eyebrow="YOUR SHORTLIST" title="Saved jobs" subtitle="Keep interesting opportunities close while you decide what's next." />{saved.length ? <div className="job-list">{saved.map((job) => <JobCard key={job.id} job={job} />)}</div> : <Empty text="Saved roles will show up here." link="/jobs" label="Explore jobs" />}</div>;
}

export function MyApplications() {
  const { user, jobs, applications } = useApp();
  const mine = applications.filter((application) => application.userId === user.id).sort((a, b) => b.appliedAt.localeCompare(a.appliedAt));
  const labels = { applied: 'Application submitted', reviewing: 'Under review', interview: 'Interview', offer: 'Offer', rejected: 'Not moving forward' };
  return <div><PageHeading eyebrow="YOUR PROGRESS" title="My applications" subtitle="See the latest status for every role you've applied to." />{mine.length ? <div className="application-list">{mine.map((application) => {
    const job = jobs.find((item) => item.id === application.jobId);
    if (!job) return null;
    return <article className="application-card" key={application.id}><div className="application-card-head"><CompanyLogo companyName={job.company} logo={job.companyLogo} size={38} className="application-company-logo" /><div><Link to={`/jobs/${job.id}`}><h3>{job.title}</h3></Link><p>{job.company} · {job.location}</p></div><span className={`status-badge status-${application.status}`}>{labels[application.status] || application.status}</span></div><div className="application-timeline"><span className="timeline-point complete" /><span className="timeline-line" /><span className={`timeline-point ${application.status !== 'applied' ? 'complete' : ''}`} /><span className="timeline-line" /><span className={`timeline-point ${['offer', 'rejected'].includes(application.status) ? 'complete' : ''}`} /></div><div className="timeline-labels"><span>Applied {formatDate(application.appliedAt)}</span><span>Recruiter review</span><span>Decision</span></div></article>;
  })}</div> : <Empty text="Once you apply, your progress will be tracked here." link="/jobs" label="Find a role" />}</div>;
}

export function UpSkill() {
  const { jobs, profile, user } = useApp();
  const [prepState, setPrepState] = useState(() => loadUserPreparationState(user?.id));
  const [activeLearningSkill, setActiveLearningSkill] = useState(null);
  const [activeJobsSkill, setActiveJobsSkill] = useState(null);

  // Keep state synced if user changes
  useEffect(() => {
    setPrepState(loadUserPreparationState(user?.id));
  }, [user?.id]);

  const handleStatusChange = (skill, statusUpdate) => {
    const updated = {
      ...prepState,
      skillStatus: {
        ...(prepState?.skillStatus || {}),
        [skill]: statusUpdate,
      },
    };
    setPrepState(updated);
    saveUserPreparationState(user?.id, updated);
  };

  const suggestions = useMemo(() => {
    const missing = new Map();
    const overall = new Map();
    const userSkills = (profile?.skills || []).map((s) => s.toLowerCase());

    jobs.filter((job) => job.status === 'published').forEach((job) => {
      const allSkills = [...(job.skills || []), ...(job.preferredSkills || [])];
      allSkills.forEach((skill) => {
        const count = overall.get(skill) || 0;
        overall.set(skill, count + 1);
        if (!userSkills.includes(skill.toLowerCase())) {
          missing.set(skill, (missing.get(skill) || 0) + 1);
        }
      });
    });

    const sortedMissing = [...missing.entries()].sort((a, b) => b[1] - a[1]);
    if (sortedMissing.length >= 6) {
      return sortedMissing.slice(0, 6);
    }

    // Supplement with top in-demand skills from overall if fewer than 6 missing
    const result = [...sortedMissing];
    const seen = new Set(result.map(([s]) => s.toLowerCase()));
    const sortedOverall = [...overall.entries()].sort((a, b) => b[1] - a[1]);
    for (const [skill, count] of sortedOverall) {
      if (result.length >= 6) break;
      if (!seen.has(skill.toLowerCase())) {
        seen.add(skill.toLowerCase());
        result.push([skill, count]);
      }
    }
    return result;
  }, [jobs, profile]);

  return (
    <div className="seeker-upskill-page">
      <PageHeading
        eyebrow="CAREER DEVELOPMENT"
        title="Up Skill"
        subtitle="Build a practical next-step plan from the skills showing up in roles you care about."
      />

      {/* Expandable 'Prepare for This Job' Section */}
      <PrepareForJob jobs={jobs} user={user} profile={profile} />

      {/* In-Demand Recommended Skills Section */}
      <section className="in-demand-skills-section" aria-labelledby="in-demand-skills-heading">
        <div className="upskill-intro">
          <Sparkles size={22} />
          <div>
            <h2 id="in-demand-skills-heading">High-Impact Skills in Current Roles</h2>
            <p>
              These skills frequently appear across active HireHub job postings. Select any skill to view
              structured practical milestones or inspect live job openings.
            </p>
          </div>
        </div>

        <div className="skill-gap-grid">
          {suggestions.map(([skill, count]) => {
            const skillStatusObj = prepState?.skillStatus?.[skill];
            const completedMilestones = skillStatusObj?.completedMilestones || [];
            const path = getSkillLearningPath(skill);
            const totalMilestones = path?.milestones?.length || 4;
            const progressPercent = skillStatusObj?.progress !== undefined
              ? skillStatusObj.progress
              : completedMilestones.length > 0
                ? Math.round((completedMilestones.length / totalMilestones) * 100)
                : 0;
            const statusText = skillStatusObj?.status || (progressPercent > 0 ? (progressPercent === 100 ? 'Completed' : 'In Progress') : 'Not Started');
            const isActiveStatus = statusText === 'In Progress' || statusText === 'Completed';

            return (
              <article className="skill-gap-card" key={skill}>
                <div>
                  <div className="skill-card-top">
                    <div className="skill-gap-icon">
                      <GraduationCap size={19} />
                    </div>
                    <span className={`skill-status-tag ${isActiveStatus ? 'active' : ''}`}>
                      {statusText}
                    </span>
                  </div>

                  <div className="skill-gap-card-content">
                    <span className="eyebrow">IN {count} OPEN {count === 1 ? 'ROLE' : 'ROLES'}</span>
                    <h3>{skill}</h3>
                    <p>{path?.overview || path?.recommendation || `Try building a focused exercise or mini-project to build confidence with ${skill}.`}</p>

                    {progressPercent > 0 && (
                      <div className="skill-card-progress">
                        <div className="prep-progress-track">
                          <div
                            className="prep-progress-fill"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                        <span>{progressPercent}% milestone progress</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="skill-card-actions">
                  <button
                    type="button"
                    className="button button-primary button-sm"
                    onClick={() => setActiveLearningSkill(skill)}
                  >
                    <BookOpen size={13} />
                    View Learning Path
                  </button>
                  <button
                    type="button"
                    className="button button-secondary button-sm"
                    onClick={() => setActiveJobsSkill(skill)}
                  >
                    <BriefcaseBusiness size={13} />
                    See Related Jobs ({count})
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <div className="notice-box">
        <strong>Learning, your way.</strong>
        <p>HireHub provides guided project outlines and milestone checklists without selling courses. Use these suggestions to plan practical learning from tools and resources you trust.</p>
      </div>

      {/* Learning Path Modal */}
      {activeLearningSkill && (
        <SkillLearningPathModal
          skill={activeLearningSkill}
          userStatus={prepState?.skillStatus?.[activeLearningSkill]}
          onClose={() => setActiveLearningSkill(null)}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Related Jobs Modal */}
      {activeJobsSkill && (
        <SkillRelatedJobsModal
          skill={activeJobsSkill}
          jobs={jobs}
          profile={profile}
          onClose={() => setActiveJobsSkill(null)}
        />
      )}
    </div>
  );
}

export function SeekerNotifications() {
  const { user, applications, jobs } = useApp();
  const updates = applications.filter((application) => application.userId === user.id).map((application) => {
    const job = jobs.find((item) => item.id === application.jobId);
    return job ? { id: application.id, title: `Application update · ${job.title}`, body: application.status === 'applied' ? `Your application to ${job.company} was submitted.` : `${job.company} updated your application to “${application.status}”.`, date: application.appliedAt } : null;
  }).filter(Boolean);
  return <div><PageHeading eyebrow="UPDATES" title="Notifications" subtitle="Important updates about your applications and activity." />{updates.length ? <div className="notification-list">{updates.map((item) => <article key={item.id}><span className="notification-icon"><Bell size={17} /></span><div><strong>{item.title}</strong><p>{item.body}</p><span>{formatDate(item.date)}</span></div></article>)}</div> : <Empty text="You're all caught up. New updates will appear here." link="/jobs" label="Find a role" />}</div>;
}

export function SeekerSettings() {
  const { user, logout } = useApp();
  const { theme, toggleTheme } = useTheme();
  return <div><PageHeading eyebrow="PREFERENCES" title="Settings" subtitle="Manage your local demo account and display preferences." /><section className="settings-card"><div><h2>Appearance</h2><p>Choose a comfortable theme for your workspace.</p></div><button type="button" className="button button-secondary" onClick={toggleTheme}>Switch to {theme === 'dark' ? 'light' : 'dark'} mode</button></section><section className="settings-card"><div><h2>Account</h2><p>{user.name} · {user.email}</p><p>Demo account data is stored locally in this browser.</p></div><button className="button button-quiet" type="button" onClick={logout}>Sign out</button></section><div className="notice-box"><strong>Demo security reminder</strong><p>Local browser storage is not production-grade authentication. Do not use real credentials or sensitive personal information.</p></div></div>;
}

function PageHeading({ eyebrow, title, subtitle }) {
  return <div className="dashboard-page-heading"><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{subtitle}</p></div>;
}

function Stat({ label, value, icon, description }) {
  return <article className="stat-card"><span className="stat-icon">{icon}</span><span className="stat-label">{label}</span><strong>{value}</strong>{description && <span className="stat-description">{description}</span>}</article>;
}

function Empty({ text, link, label }) {
  return <div className="empty-state"><Sparkles size={23} /><p>{text}</p><Link className="button button-secondary" to={link}>{label} <ArrowRight size={14} /></Link></div>;
}
