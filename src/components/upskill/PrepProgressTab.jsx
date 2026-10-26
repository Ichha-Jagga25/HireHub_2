import { CheckCircle2, Circle, ListChecks, Sparkles, Target, RotateCcw, Award } from 'lucide-react';
import { getJobInterviewQuestions, getJobPreparationChecklist } from '../../services/preparationService.js';

export default function PrepProgressTab({
  job,
  profile,
  userJobPrep,
  onToggleChecklistItem,
  onResetPrep,
  onNavigateTab,
}) {
  if (!job) return null;

  const questions = getJobInterviewQuestions(job);
  const checklist = getJobPreparationChecklist(job, profile);

  const completedQuestions = userJobPrep?.completedQuestions || [];
  const completedChecklist = userJobPrep?.checklist || [];
  const savedAnswersCount = Object.keys(userJobPrep?.savedAnswers || {}).length;

  const totalActivities = questions.length + checklist.length;
  const completedActivities = completedQuestions.length + completedChecklist.length;
  const overallPercentage = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;

  const profileSkills = (profile?.skills || []).map((s) => s.toLowerCase());
  const jobSkills = job.skills || [];
  const matchedSkillsCount = jobSkills.filter((s) => profileSkills.includes(s.toLowerCase())).length;

  return (
    <div className="prep-tab-content prep-progress-tab">
      {/* Metric Cards Banner */}
      <div className="prep-metrics-grid">
        <div className="prep-metric-card highlight-card">
          <div className="metric-icon-wrap">
            <Award size={22} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Overall Completion</span>
            <strong className="metric-value">{overallPercentage}%</strong>
            <span className="metric-subtext">{completedActivities} of {totalActivities} tasks completed</span>
          </div>
        </div>

        <div className="prep-metric-card">
          <div className="metric-icon-wrap">
            <Target size={20} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Questions Practiced</span>
            <strong className="metric-value">{completedQuestions.length} / {questions.length}</strong>
            <span className="metric-subtext">{savedAnswersCount} written answer notes</span>
          </div>
        </div>

        <div className="prep-metric-card">
          <div className="metric-icon-wrap">
            <ListChecks size={20} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Checklist Items Done</span>
            <strong className="metric-value">{completedChecklist.length} / {checklist.length}</strong>
            <span className="metric-subtext">Actionable milestones</span>
          </div>
        </div>

        <div className="prep-metric-card">
          <div className="metric-icon-wrap">
            <Sparkles size={20} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Skills Matched</span>
            <strong className="metric-value">{matchedSkillsCount} / {jobSkills.length}</strong>
            <span className="metric-subtext">From user profile tags</span>
          </div>
        </div>
      </div>

      {/* Progress Bar with Disclaimer */}
      <div className="overall-progress-container">
        <div className="progress-header-row">
          <span>Preparation Milestone Track</span>
          <strong>{overallPercentage}% Completed</strong>
        </div>
        <div className="prep-progress-bar-track">
          <div className="prep-progress-bar-fill" style={{ width: `${overallPercentage}%` }} />
        </div>
        <p className="progress-disclaimer">
          Activity completion reflects your personal self-directed preparation tasks on HireHub and does not guarantee job readiness, interview invitations, or employment offers.
        </p>
      </div>

      {/* Preparation Checklist */}
      <div className="checklist-section">
        <div className="checklist-header">
          <div>
            <h3>Job Preparation Checklist</h3>
            <p className="muted-small">Step-by-step actions to thoroughly prepare for {job.title} at {job.company}.</p>
          </div>
        </div>

        <div className="checklist-items">
          {checklist.map((item) => {
            const isDone = completedChecklist.includes(item.id);
            return (
              <div
                key={item.id}
                className={`checklist-item ${isDone ? 'done' : ''}`}
                onClick={() => onToggleChecklistItem(item.id)}
                role="checkbox"
                aria-checked={isDone}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    onToggleChecklistItem(item.id);
                  }
                }}
              >
                <div className="checklist-icon">
                  {isDone ? (
                    <CheckCircle2 size={19} className="check-done" />
                  ) : (
                    <Circle size={19} className="check-pending" />
                  )}
                </div>

                <div className="checklist-text">
                  <div className="checklist-title-row">
                    <strong>{item.title}</strong>
                    <span className="category-tag">{item.category}</span>
                  </div>
                  <p>{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Footer */}
      <div className="progress-footer">
        <div className="footer-links">
          <button className="button button-secondary" type="button" onClick={() => onNavigateTab('interview')}>
            Continue Interview Practice
          </button>
          <button className="button button-quiet" type="button" onClick={onResetPrep}>
            <RotateCcw size={14} /> Reset Preparation For This Job
          </button>
        </div>
      </div>
    </div>
  );
}
