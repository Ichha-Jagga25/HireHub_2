import { useState, useEffect, useMemo } from 'react';
import {
  BriefcaseBusiness,
  Building2,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  HelpCircle,
  LayoutDashboard,
  ListChecks,
  MessageSquare,
  Sparkles,
  Target,
} from 'lucide-react';
import CompanyLogo from '../common/CompanyLogo.jsx';
import SelectField from '../common/SelectField.jsx';
import PrepOverviewTab from './PrepOverviewTab.jsx';
import PrepSkillGapsTab from './PrepSkillGapsTab.jsx';
import PrepInterviewTab from './PrepInterviewTab.jsx';
import PrepProgressTab from './PrepProgressTab.jsx';
import {
  loadUserPreparationState,
  saveUserPreparationState,
} from '../../services/preparationService.js';

export default function PrepareForJob({ jobs = [], user, profile }) {
  // Load initial persisted state for the logged-in user
  const [prepState, setPrepState] = useState(() => loadUserPreparationState(user?.id));
  const [isExpanded, setIsExpanded] = useState(() => {
    // If user has a selected job saved, default to expanded, otherwise collapsed
    const saved = loadUserPreparationState(user?.id);
    return Boolean(saved?.selectedJobId);
  });
  const [activeTab, setActiveTab] = useState('overview');

  // Filter only published jobs for preparation selection
  const publishedJobs = useMemo(
    () => jobs.filter((j) => j.status === 'published' && j.visibility === 'public'),
    [jobs]
  );

  // Set default selected job if none selected yet
  useEffect(() => {
    if (!prepState.selectedJobId && publishedJobs.length > 0) {
      setPrepState((prev) => ({
        ...prev,
        selectedJobId: publishedJobs[0].id,
      }));
    }
  }, [publishedJobs, prepState.selectedJobId]);

  // Persist state changes whenever prepState changes
  useEffect(() => {
    if (user?.id) {
      saveUserPreparationState(user.id, prepState);
    }
  }, [user?.id, prepState]);

  const selectedJob = useMemo(() => {
    return publishedJobs.find((j) => j.id === prepState.selectedJobId) || publishedJobs[0] || null;
  }, [publishedJobs, prepState.selectedJobId]);

  const currentJobPrep = (selectedJob && prepState.jobs?.[selectedJob.id]) || {
    completedQuestions: [],
    savedAnswers: {},
    completedActivities: [],
    checklist: [],
  };

  // Job selection options for SelectField
  const jobOptions = useMemo(() => {
    return publishedJobs.map((j) => ({
      value: j.id,
      label: `${j.title} · ${j.company} (${j.mode})`,
    }));
  }, [publishedJobs]);

  const handleJobSelect = (jobId) => {
    setPrepState((prev) => ({
      ...prev,
      selectedJobId: jobId,
    }));
  };

  // Handlers for Question answers & completion
  const handleSaveAnswer = (questionId, answer) => {
    if (!selectedJob) return;
    setPrepState((prev) => {
      const existingJobData = prev.jobs?.[selectedJob.id] || {};
      const updatedAnswers = {
        ...(existingJobData.savedAnswers || {}),
        [questionId]: answer,
      };
      return {
        ...prev,
        jobs: {
          ...(prev.jobs || {}),
          [selectedJob.id]: {
            ...existingJobData,
            savedAnswers: updatedAnswers,
          },
        },
      };
    });
  };

  const handleToggleQuestionComplete = (questionId) => {
    if (!selectedJob) return;
    setPrepState((prev) => {
      const existingJobData = prev.jobs?.[selectedJob.id] || {};
      const completedList = existingJobData.completedQuestions || [];
      const nextList = completedList.includes(questionId)
        ? completedList.filter((id) => id !== questionId)
        : [...completedList, questionId];

      return {
        ...prev,
        jobs: {
          ...(prev.jobs || {}),
          [selectedJob.id]: {
            ...existingJobData,
            completedQuestions: nextList,
          },
        },
      };
    });
  };

  // Handler for Checklist item toggling
  const handleToggleChecklistItem = (itemId) => {
    if (!selectedJob) return;
    setPrepState((prev) => {
      const existingJobData = prev.jobs?.[selectedJob.id] || {};
      const completedChecklist = existingJobData.checklist || [];
      const nextChecklist = completedChecklist.includes(itemId)
        ? completedChecklist.filter((id) => id !== itemId)
        : [...completedChecklist, itemId];

      return {
        ...prev,
        jobs: {
          ...(prev.jobs || {}),
          [selectedJob.id]: {
            ...existingJobData,
            checklist: nextChecklist,
          },
        },
      };
    });
  };

  // Handler for updating global skill status
  const handleUpdateSkillStatus = (skillName, statusObj) => {
    setPrepState((prev) => ({
      ...prev,
      skillStatus: {
        ...(prev.skillStatus || {}),
        [skillName]: statusObj,
      },
    }));
  };

  // Reset preparation for the currently selected job
  const handleResetPrep = () => {
    if (!selectedJob) return;
    const confirmReset = window.confirm(
      `Are you sure you want to reset your saved interview notes and checklist progress for ${selectedJob.title}?`
    );
    if (!confirmReset) return;

    setPrepState((prev) => {
      const updatedJobs = { ...(prev.jobs || {}) };
      delete updatedJobs[selectedJob.id];
      return {
        ...prev,
        jobs: updatedJobs,
      };
    });
  };

  const tabList = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'skill-gaps', label: 'Skill Gaps', icon: Target },
    { id: 'interview', label: 'Interview Practice', icon: MessageSquare },
    { id: 'progress', label: 'My Progress', icon: ListChecks },
  ];

  return (
    <section className={`prep-module-container ${isExpanded ? 'expanded' : 'collapsed'}`}>
      {/* Module Banner / Collapsible Trigger */}
      <div className="prep-module-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="header-text-block">
          <div className="eyebrow">
            <Sparkles size={14} /> ROLE PREPARATION
          </div>
          <h2>Prepare for This Job</h2>
          <p className="prep-subtitle">Turn your skill gaps into your next career opportunity.</p>

          {!isExpanded && selectedJob && (
            <div className="collapsed-chip">
              <Building2 size={13} />
              <span>Targeting: <strong>{selectedJob.title}</strong> at {selectedJob.company}</span>
            </div>
          )}
        </div>

        <div className="header-action-block">
          <button
            className="button button-primary"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            aria-expanded={isExpanded}
            aria-controls="prep-workspace-panel"
          >
            {isExpanded ? (
              <>
                <span>Collapse Workspace</span>
                <ChevronUp size={16} />
              </>
            ) : (
              <>
                <span>{selectedJob ? 'Resume Preparation' : 'Start Preparation'}</span>
                <ChevronDown size={16} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Expanded Preparation Workspace */}
      {isExpanded && (
        <div id="prep-workspace-panel" className="prep-workspace-body">
          {/* Job Selection Toolbar */}
          <div className="prep-job-selector-bar">
            <div className="selector-field-wrap">
              <span className="selector-label">Choose Target Job Listing:</span>
              {jobOptions.length > 0 ? (
                <SelectField
                  label="Select a job to prepare for"
                  value={selectedJob?.id || ''}
                  options={jobOptions}
                  onChange={handleJobSelect}
                />
              ) : (
                <span className="muted-small">No published jobs currently available to select.</span>
              )}
            </div>

            {selectedJob && (
              <div className="selected-job-quickmeta">
                <CompanyLogo
                  companyName={selectedJob.company}
                  logo={selectedJob.companyLogo}
                  size={36}
                  className="quickmeta-logo"
                />
                <div className="quickmeta-text">
                  <strong>{selectedJob.title}</strong>
                  <span>{selectedJob.company} · {selectedJob.location} ({selectedJob.mode})</span>
                </div>
              </div>
            )}
          </div>

          {/* Four Navigation Tabs */}
          <div className="prep-tabs-nav" role="tablist" aria-label="Preparation steps">
            {tabList.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`tabpanel-${tab.id}`}
                  className={`prep-tab-btn ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Tab Panel */}
          <div className="prep-tab-panel" id={`tabpanel-${activeTab}`} role="tabpanel">
            {selectedJob ? (
              <>
                {activeTab === 'overview' && (
                  <PrepOverviewTab
                    job={selectedJob}
                    profile={profile}
                    onNavigateTab={setActiveTab}
                  />
                )}

                {activeTab === 'skill-gaps' && (
                  <PrepSkillGapsTab
                    job={selectedJob}
                    profile={profile}
                    userPrep={prepState}
                    onUpdateSkillStatus={handleUpdateSkillStatus}
                  />
                )}

                {activeTab === 'interview' && (
                  <PrepInterviewTab
                    job={selectedJob}
                    userJobPrep={currentJobPrep}
                    onSaveAnswer={handleSaveAnswer}
                    onToggleQuestionComplete={handleToggleQuestionComplete}
                  />
                )}

                {activeTab === 'progress' && (
                  <PrepProgressTab
                    job={selectedJob}
                    profile={profile}
                    userJobPrep={currentJobPrep}
                    onToggleChecklistItem={handleToggleChecklistItem}
                    onResetPrep={handleResetPrep}
                    onNavigateTab={setActiveTab}
                  />
                )}
              </>
            ) : (
              <div className="empty-state">
                <HelpCircle size={36} />
                <h3>No Job Selected</h3>
                <p>Select an active job listing above to begin preparing.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
