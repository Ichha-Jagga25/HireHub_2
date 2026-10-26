import { Bookmark, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import CompanyLogo from './CompanyLogo.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { formatDate, getEligibility, matchScore } from '../../utils/jobUtils.js';

export default function JobCard({ job }) {
  const { user, profile, savedJobIds, toggleSavedJob } = useApp();
  const eligibility = getEligibility(job, profile);
  const score = user?.role === 'seeker' ? matchScore(job, profile) : null;
  const saved = savedJobIds.includes(job.id);
  return (
    <article className="job-card">
      <div className="job-card-top">
        <CompanyLogo companyName={job.company} logo={job.companyLogo} className="company-mark" />
        <div className="job-card-title"><h3><Link to={`/jobs/${job.id}`}>{job.title}</Link></h3><p>{job.company}</p></div>
        {user?.role === 'seeker' && <button className={`icon-button ${saved ? 'saved' : ''}`} type="button" aria-label={saved ? 'Remove saved job' : 'Save job'} onClick={() => toggleSavedJob(job.id)}><Bookmark size={17} /></button>}
      </div>
      <p className="job-meta"><MapPin size={14} /> {job.location} <span className="dot-separator">·</span> {job.mode}</p>
      <p className="job-pay">{job.salary}</p>
      <div className="tag-row"><span className="tag">{job.type}</span><span className="tag">{job.category}</span><span className={`tag ${eligibility.eligible ? 'tag-good' : 'tag-muted'}`}>{eligibility.eligible ? 'Eligible' : 'Check eligibility'}</span></div>
      <div className="skill-row">{job.skills.slice(0, 4).map((skill) => <span key={skill}>{skill}</span>)}</div>
      <div className="job-card-bottom">
        <span className="muted-small">Apply by {formatDate(job.deadline)}</span>
        {score !== null && <span className="match-score">{score}% match</span>}
        <Link className="text-link" to={`/jobs/${job.id}`}>View details →</Link>
      </div>
    </article>
  );
}
