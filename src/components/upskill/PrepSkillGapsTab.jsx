import { useState } from 'react';
import { AlertCircle, BookOpen, CheckCircle2, ChevronRight, HelpCircle, Sparkles } from 'lucide-react';
import SkillLearningPathModal from './SkillLearningPathModal.jsx';

export default function PrepSkillGapsTab({ job, profile, userPrep, onUpdateSkillStatus }) {
  const [selectedSkillForModal, setSelectedSkillForModal] = useState(null);

  if (!job) return null;

  const profileSkills = (profile?.skills || []).map((s) => s.toLowerCase());
  const allJobSkills = [
    ...(job.skills || []).map((s) => ({ name: s, required: true })),
    ...(job.preferredSkills || []).map((s) => ({ name: s, required: false })),
  ];

  // Remove duplicates by name
  const uniqueSkills = [];
  const seen = new Set();
  for (const item of allJobSkills) {
    const key = item.name.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      uniqueSkills.push(item);
    }
  }

  // Get status for each skill:
  // 1. Present in profile
  // 2. Needs improvement (if user marked it as such or if learning in progress)
  // 3. Not listed in profile
  const getSkillAnalysis = (skillName) => {
    const isProfilePresent = profileSkills.includes(skillName.toLowerCase());
    const customStatus = userPrep?.skillStatus?.[skillName]?.status;

    let status = 'Not listed in profile';
    let statusType = 'missing';

    if (customStatus === 'Needs improvement') {
      status = 'Needs improvement';
      statusType = 'improving';
    } else if (customStatus === 'In Progress') {
      status = 'Practicing';
      statusType = 'improving';
    } else if (isProfilePresent) {
      status = 'Present in profile';
      statusType = 'present';
    }

    return { status, statusType, isProfilePresent };
  };

  const getRecommendation = (skillName, statusType, isRequired) => {
    if (statusType === 'present') {
      return `Listed in your profile. Be prepared to explain a real project where you utilized ${skillName} and the specific decisions you made.`;
    }
    if (statusType === 'improving') {
      return `Currently practicing. Focus on building a small proof-of-concept milestone or reviewing common interview questions.`;
    }
    return isRequired
      ? `Required for this role. Complete the recommended learning milestones and prepare a code sample or talking points.`
      : `Preferred skill. Learning foundational concepts will give you an advantage during technical discussions.`;
  };

  return (
    <div className="prep-tab-content prep-skill-gaps-tab">
      <div className="tab-intro-banner">
        <div>
          <h4>Skill Gap Breakdown & Learning Actions</h4>
          <p className="muted-small">
            Skills marked "Not listed" reflect your current profile tags. This does not assume you lack the skill; it highlights areas to emphasize on your resume or practice before the interview.
          </p>
        </div>
      </div>

      <div className="skill-gaps-table-wrap">
        <div className="skill-gaps-list">
          {uniqueSkills.map((item) => {
            const { status, statusType } = getSkillAnalysis(item.name);
            const recommendation = getRecommendation(item.name, statusType, item.required);

            return (
              <div key={item.name} className={`skill-gap-row gap-status-${statusType}`}>
                <div className="gap-row-main">
                  <div className="gap-name-col">
                    <span className="gap-skill-name">{item.name}</span>
                    <span className={`requirement-badge ${item.required ? 'req-core' : 'req-pref'}`}>
                      {item.required ? 'Core Requirement' : 'Preferred'}
                    </span>
                  </div>

                  <div className="gap-status-col">
                    <span className={`status-pill pill-${statusType}`}>
                      {statusType === 'present' && <CheckCircle2 size={13} />}
                      {statusType === 'improving' && <Sparkles size={13} />}
                      {statusType === 'missing' && <AlertCircle size={13} />}
                      {status}
                    </span>
                  </div>
                </div>

                <div className="gap-recommendation">
                  <p>{recommendation}</p>
                </div>

                <div className="gap-row-actions">
                  <button
                    className="button button-secondary button-small"
                    type="button"
                    onClick={() => setSelectedSkillForModal(item.name)}
                  >
                    <BookOpen size={13} /> View Learning Path
                  </button>

                  {statusType !== 'present' && (
                    <button
                      className="button button-quiet button-small"
                      type="button"
                      onClick={() => {
                        const nextStatus = statusType === 'improving' ? 'Not Started' : 'Needs improvement';
                        onUpdateSkillStatus(item.name, {
                          status: nextStatus,
                          progress: nextStatus === 'Needs improvement' ? 25 : 0,
                        });
                      }}
                    >
                      {statusType === 'improving' ? 'Mark Practiced' : 'Flag for Practice'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedSkillForModal && (
        <SkillLearningPathModal
          skill={selectedSkillForModal}
          onClose={() => setSelectedSkillForModal(null)}
          userStatus={userPrep?.skillStatus?.[selectedSkillForModal]}
          onStatusChange={onUpdateSkillStatus}
        />
      )}
    </div>
  );
}
