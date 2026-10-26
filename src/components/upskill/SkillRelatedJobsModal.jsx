import { useEffect } from 'react';
import { ArrowRight, BriefcaseBusiness, Building2, MapPin, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import CompanyLogo from '../common/CompanyLogo.jsx';
import { matchScore } from '../../utils/jobUtils.js';

export default function SkillRelatedJobsModal({ skill, jobs = [], profile = {}, onClose }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const matchingJobs = jobs.filter((job) => {
    if (job.status !== 'published') return false;
    const allJobSkills = [...(job.skills || []), ...(job.preferredSkills || [])].map((s) => s.toLowerCase());
    return allJobSkills.includes(skill.toLowerCase());
  });

  return (
    <div className="prep-modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-jobs-title">
      <div className="prep-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="prep-modal-header">
          <div>
            <div className="eyebrow"><BriefcaseBusiness size={14} /> ACTIVE LISTINGS</div>
            <h2 id="modal-jobs-title">Roles Requiring {skill}</h2>
            <p className="prep-modal-subtitle">
              Found {matchingJobs.length} {matchingJobs.length === 1 ? 'opportunity' : 'opportunities'} in HireHub listing {skill}.
            </p>
          </div>
          <button className="icon-button modal-close-btn" type="button" onClick={onClose} aria-label="Close related jobs modal">
            <X size={18} />
          </button>
        </div>

        <div className="prep-modal-body">
          {matchingJobs.length > 0 ? (
            <div className="related-jobs-list">
              {matchingJobs.map((job) => {
                const score = matchScore(job, profile);
                const isRequired = (job.skills || []).some((s) => s.toLowerCase() === skill.toLowerCase());
                return (
                  <article className="related-job-card" key={job.id}>
                    <div className="related-job-main">
                      <CompanyLogo companyName={job.company} logo={job.companyLogo} size={42} className="related-job-logo" />
                      <div className="related-job-info">
                        <Link to={`/jobs/${job.id}`} className="related-job-title" onClick={onClose}>
                          <h3>{job.title}</h3>
                        </Link>
                        <p className="related-job-company">
                          <Building2 size={13} /> {job.company} <span className="dot-separator">·</span> <MapPin size={13} /> {job.location}
                        </p>
                        <div className="tag-row">
                          <span className="tag">{job.type}</span>
                          <span className="tag">{job.salary}</span>
                          <span className={`tag ${isRequired ? 'tag-good' : 'tag-muted'}`}>
                            {isRequired ? `Required: ${skill}` : `Preferred: ${skill}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="related-job-action">
                      {score !== null && <span className="match-score">{score}% match</span>}
                      <Link to={`/jobs/${job.id}`} className="button button-secondary button-small" onClick={onClose}>
                        View Job <ArrowRight size={13} />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <BriefcaseBusiness size={32} />
              <h3>No direct listings right now</h3>
              <p>No currently published roles explicitly mention {skill}. Check back soon as new opportunities are posted weekly.</p>
            </div>
          )}
        </div>

        <div className="prep-modal-footer">
          <button className="button button-secondary" type="button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
