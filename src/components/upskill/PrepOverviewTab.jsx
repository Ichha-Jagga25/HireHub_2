import { BadgeCheck, Building2, CheckCircle2, ChevronRight, MapPin, Sparkles, Target, AlertCircle } from 'lucide-react';
import CompanyLogo from '../common/CompanyLogo.jsx';
import { matchScore } from '../../utils/jobUtils.js';

export default function PrepOverviewTab({ job, profile, onNavigateTab }) {
  if (!job) return null;

  const profileSkills = (profile?.skills || []).map((s) => s.toLowerCase());
  const requiredSkills = job.skills || [];
  const preferredSkills = job.preferredSkills || [];
  
  const matchedRequired = requiredSkills.filter((s) => profileSkills.includes(s.toLowerCase()));
  const missingRequired = requiredSkills.filter((s) => !profileSkills.includes(s.toLowerCase()));
  const score = matchScore(job, profile) || 0;

  return (
    <div className="prep-tab-content prep-overview-tab">
      {/* Job Header Summary */}
      <div className="prep-overview-header">
        <div className="overview-company-col">
          <CompanyLogo companyName={job.company} logo={job.companyLogo} size={48} className="overview-logo" />
          <div>
            <h3>{job.title}</h3>
            <p className="overview-company-meta">
              <Building2 size={13} /> <strong>{job.company}</strong>
              <span className="dot-separator">·</span>
              <MapPin size={13} /> {job.location} ({job.mode})
              <span className="dot-separator">·</span>
              <span className="tag-pay">{job.salary}</span>
            </p>
          </div>
        </div>

        <div className="compatibility-card">
          <div className="compat-score-row">
            <span className="compat-number">{score}%</span>
            <div>
              <strong>Skill Match</strong>
              <span>{matchedRequired.length} of {requiredSkills.length} required skills</span>
            </div>
          </div>
          <p className="compat-disclaimer">
            Deterministic match based on profile tags. Does not represent an objective or verified assessment.
          </p>
        </div>
      </div>

      {/* Description & Responsibilities */}
      <div className="overview-sections-grid">
        <div className="overview-card">
          <div className="card-kicker"><BadgeCheck size={14} /> ROLE SUMMARY</div>
          <p className="overview-desc">{job.description}</p>
          {job.responsibilities?.length > 0 && (
            <div className="responsibilities-list">
              <strong>Key Responsibilities:</strong>
              <ul>
                {job.responsibilities.map((resp, i) => (
                  <li key={i}>{resp}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Skill Alignment Snapshot */}
        <div className="overview-card">
          <div className="card-kicker"><Target size={14} /> SKILLS ALIGNMENT</div>
          <div className="skill-alignment-block">
            <div className="alignment-group">
              <span className="group-label">Skills In Your Profile ({matchedRequired.length}):</span>
              <div className="skill-pills-wrap">
                {matchedRequired.length > 0 ? (
                  matchedRequired.map((s) => (
                    <span key={s} className="pill pill-matched">
                      <CheckCircle2 size={13} /> {s}
                    </span>
                  ))
                ) : (
                  <span className="muted-small">No required skills currently listed in your profile.</span>
                )}
              </div>
            </div>

            <div className="alignment-group">
              <span className="group-label">Identified Skill Gaps ({missingRequired.length}):</span>
              <div className="skill-pills-wrap">
                {missingRequired.length > 0 ? (
                  missingRequired.map((s) => (
                    <span key={s} className="pill pill-gap">
                      <AlertCircle size={13} /> {s}
                    </span>
                  ))
                ) : (
                  <span className="pill pill-matched"><CheckCircle2 size={13} /> All core required skills matched!</span>
                )}
              </div>
            </div>

            {preferredSkills.length > 0 && (
              <div className="alignment-group">
                <span className="group-label">Preferred / Nice to Have:</span>
                <div className="skill-pills-wrap">
                  {preferredSkills.map((s) => {
                    const has = profileSkills.includes(s.toLowerCase());
                    return (
                      <span key={s} className={`pill ${has ? 'pill-matched' : 'pill-neutral'}`}>
                        {s} {has && '(In profile)'}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recommended Preparation Priorities */}
      <div className="prep-priorities-banner">
        <div className="priorities-header">
          <Sparkles size={18} />
          <div>
            <h4>Recommended Preparation Roadmap</h4>
            <p className="muted-small">Targeted steps to increase your confidence before applying or interviewing.</p>
          </div>
        </div>

        <div className="priorities-grid">
          <div className="priority-card">
            <span className="priority-step">1</span>
            <strong>Bridge Gaps First</strong>
            <p>
              {missingRequired.length > 0
                ? `Focus on understanding ${missingRequired.slice(0, 2).join(' & ')}.`
                : 'Review core concepts and edge cases for your existing skill set.'}
            </p>
            <button className="text-button" type="button" onClick={() => onNavigateTab('skill-gaps')}>
              Explore Skill Gaps <ChevronRight size={13} />
            </button>
          </div>

          <div className="priority-card">
            <span className="priority-step">2</span>
            <strong>Practice Interview Answers</strong>
            <p>Rehearse technical questions and prepare your STAR behavioral stories for {job.company}.</p>
            <button className="text-button" type="button" onClick={() => onNavigateTab('interview')}>
              Practice Questions <ChevronRight size={13} />
            </button>
          </div>

          <div className="priority-card">
            <span className="priority-step">3</span>
            <strong>Track Checklist Progress</strong>
            <p>Complete role research, draft questions for interviewers, and tailor your portfolio.</p>
            <button className="text-button" type="button" onClick={() => onNavigateTab('progress')}>
              View Checklist <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
