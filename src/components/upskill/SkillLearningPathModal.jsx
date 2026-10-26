import { useState, useEffect } from 'react';
import { CheckCircle2, Clock, BookOpen, Sparkles, X, Target, ArrowRight } from 'lucide-react';
import { getSkillLearningPath } from '../../services/preparationService.js';

export default function SkillLearningPathModal({ skill, onClose, userStatus, onStatusChange }) {
  const path = getSkillLearningPath(skill);
  const [completedMilestones, setCompletedMilestones] = useState(() => {
    return userStatus?.completedMilestones || [];
  });

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!path) return null;

  const toggleMilestone = (mId) => {
    const next = completedMilestones.includes(mId)
      ? completedMilestones.filter((id) => id !== mId)
      : [...completedMilestones, mId];
    setCompletedMilestones(next);

    const progress = Math.round((next.length / path.milestones.length) * 100);
    const status = progress === 100 ? 'Completed' : progress > 0 ? 'In Progress' : 'Not Started';

    if (onStatusChange) {
      onStatusChange(skill, {
        status,
        progress,
        completedMilestones: next,
      });
    }
  };

  const progressPercent = Math.round((completedMilestones.length / path.milestones.length) * 100);

  return (
    <div className="prep-modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-skill-title">
      <div className="prep-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="prep-modal-header">
          <div>
            <div className="eyebrow"><Sparkles size={14} /> LEARNING PATH</div>
            <h2 id="modal-skill-title">{path.skill}</h2>
            <p className="prep-modal-subtitle">{path.overview}</p>
          </div>
          <button className="icon-button modal-close-btn" type="button" onClick={onClose} aria-label="Close learning path modal">
            <X size={18} />
          </button>
        </div>

        <div className="prep-modal-meta">
          <div className="meta-badge-group">
            <span className="tag tag-good">{path.category}</span>
            <span className="meta-pill"><Clock size={13} /> ~{path.estimatedHours} hours suggested study</span>
            <span className="meta-pill"><Target size={13} /> {progressPercent}% Milestones Completed</span>
          </div>

          <div className="prep-progress-bar-track">
            <div className="prep-progress-bar-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        <div className="prep-modal-body">
          <section className="modal-section">
            <div className="section-subheading">
              <BookOpen size={16} />
              <h3>Structured Learning Milestones</h3>
            </div>
            <p className="muted-small">Check off milestones as you study to track your hands-on progress.</p>
            <div className="milestones-checklist">
              {path.milestones.map((m, index) => {
                const isDone = completedMilestones.includes(m.id);
                return (
                  <div
                    key={m.id}
                    className={`milestone-item ${isDone ? 'done' : ''}`}
                    onClick={() => toggleMilestone(m.id)}
                    role="checkbox"
                    aria-checked={isDone}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        toggleMilestone(m.id);
                      }
                    }}
                  >
                    <div className="milestone-checkbox">
                      <CheckCircle2 size={18} className={isDone ? 'checked' : 'unchecked'} />
                    </div>
                    <div className="milestone-content">
                      <div className="milestone-title-row">
                        <strong>Step {index + 1}: {m.title}</strong>
                        {isDone && <span className="milestone-badge">Done</span>}
                      </div>
                      <p>{m.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="modal-section project-highlight">
            <div className="section-subheading">
              <Sparkles size={16} />
              <h3>Recommended Portfolio Project</h3>
            </div>
            <p className="project-desc">{path.practiceProject}</p>
          </section>

          <section className="modal-section">
            <div className="section-subheading">
              <Target size={16} />
              <h3>Key Topics to Mention in Interviews</h3>
            </div>
            <div className="topic-tags">
              {path.recommendedTopics.map((topic) => (
                <span key={topic} className="topic-tag">{topic}</span>
              ))}
            </div>
          </section>
        </div>

        <div className="prep-modal-footer">
          <button className="button button-secondary" type="button" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
