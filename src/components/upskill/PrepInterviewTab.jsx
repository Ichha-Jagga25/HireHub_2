import { useState, useMemo } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, Code, Eye, EyeOff, HelpCircle, MessageSquare, Save, Sparkles } from 'lucide-react';
import { getJobInterviewQuestions } from '../../services/preparationService.js';

export default function PrepInterviewTab({ job, userJobPrep, onSaveAnswer, onToggleQuestionComplete }) {
  const questions = useMemo(() => getJobInterviewQuestions(job), [job]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [draftAnswer, setDraftAnswer] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);

  // Available categories in the questions list
  const categories = useMemo(() => {
    const set = new Set(questions.map((q) => q.category));
    return ['All', ...Array.from(set)];
  }, [questions]);

  // Filtered questions
  const filteredQuestions = useMemo(() => {
    if (activeCategory === 'All') return questions;
    return questions.filter((q) => q.category === activeCategory);
  }, [questions, activeCategory]);

  const currentQuestion = filteredQuestions[currentIndex] || filteredQuestions[0];
  const completedIds = userJobPrep?.completedQuestions || [];
  const savedAnswers = userJobPrep?.savedAnswers || {};

  // Sync draft answer when question changes
  const qId = currentQuestion?.id;
  const currentSaved = qId ? savedAnswers[qId] || '' : '';

  const handleSelectQuestion = (index) => {
    setCurrentIndex(index);
    setShowAnswer(false);
    setDraftAnswer(filteredQuestions[index] ? savedAnswers[filteredQuestions[index].id] || '' : '');
    setSavedNotice(false);
  };

  const handleNext = () => {
    if (currentIndex < filteredQuestions.length - 1) {
      handleSelectQuestion(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      handleSelectQuestion(currentIndex - 1);
    }
  };

  const handleSaveDraft = () => {
    if (!currentQuestion) return;
    onSaveAnswer(currentQuestion.id, draftAnswer);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const isCompleted = currentQuestion ? completedIds.includes(currentQuestion.id) : false;

  if (filteredQuestions.length === 0) {
    return (
      <div className="prep-tab-content empty-state">
        <HelpCircle size={32} />
        <h3>No questions available</h3>
        <p>No questions matched this filter for {job.title}.</p>
      </div>
    );
  }

  return (
    <div className="prep-tab-content prep-interview-tab">
      {/* Category Pills Header */}
      <div className="interview-category-bar">
        <span className="category-label">Category:</span>
        <div className="category-pills">
          {categories.map((cat) => {
            const count = cat === 'All' ? questions.length : questions.filter((q) => q.category === cat).length;
            const completedCount = (cat === 'All'
              ? questions
              : questions.filter((q) => q.category === cat)
            ).filter((q) => completedIds.includes(q.id)).length;

            return (
              <button
                key={cat}
                type="button"
                className={`category-pill ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => {
                  setActiveCategory(cat);
                  setCurrentIndex(0);
                  setShowAnswer(false);
                }}
              >
                {cat} ({completedCount}/{count})
              </button>
            );
          })}
        </div>
      </div>

      <div className="interview-layout">
        {/* Left Side: Question Navigator */}
        <div className="question-nav-list">
          <div className="nav-list-header">
            <strong>Questions ({currentIndex + 1} of {filteredQuestions.length})</strong>
          </div>
          <div className="nav-items">
            {filteredQuestions.map((q, idx) => {
              const done = completedIds.includes(q.id);
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={q.id}
                  type="button"
                  className={`nav-item-btn ${isCurrent ? 'current' : ''} ${done ? 'done' : ''}`}
                  onClick={() => handleSelectQuestion(idx)}
                >
                  <span className="nav-item-number">{idx + 1}</span>
                  <span className="nav-item-title">{q.question}</span>
                  {done && <CheckCircle2 size={14} className="done-icon" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Active Question Card */}
        <div className="active-question-card">
          <div className="question-card-top">
            <div className="question-badges">
              <span className="tag tag-good">{currentQuestion.category}</span>
              <span className="tag">{currentQuestion.topic}</span>
              {currentQuestion.difficulty && (
                <span className="tag tag-muted">{currentQuestion.difficulty}</span>
              )}
            </div>

            <button
              className={`button button-small ${isCompleted ? 'button-secondary' : 'button-primary'}`}
              type="button"
              onClick={() => onToggleQuestionComplete(currentQuestion.id)}
            >
              <CheckCircle2 size={14} />
              {isCompleted ? 'Completed' : 'Mark as Completed'}
            </button>
          </div>

          <h3 className="active-question-text">{currentQuestion.question}</h3>

          {currentQuestion.problemStatement && (
            <div className="problem-statement-box">
              <div className="box-label"><Code size={13} /> Problem Statement & Examples:</div>
              <pre>{currentQuestion.problemStatement}</pre>
            </div>
          )}

          {/* User's Answer Input Area */}
          <div className="user-answer-section">
            <label className="field-label" htmlFor="user-answer-input">
              <span>Your Draft Answer / Practice Notes:</span>
              <textarea
                id="user-answer-input"
                rows={5}
                placeholder="Draft your answer here or write out your approach before reviewing the model answer..."
                value={draftAnswer !== '' ? draftAnswer : currentSaved}
                onChange={(e) => setDraftAnswer(e.target.value)}
              />
            </label>
            <div className="answer-actions-row">
              <button
                className="button button-secondary button-small"
                type="button"
                onClick={handleSaveDraft}
              >
                <Save size={14} /> Save Notes
              </button>
              {savedNotice && <span className="save-toast">Saved to your preparation plan!</span>}
            </div>
          </div>

          {/* Suggested Model Answer Toggle */}
          <div className="model-answer-section">
            <button
              className="toggle-answer-btn"
              type="button"
              onClick={() => setShowAnswer(!showAnswer)}
              aria-expanded={showAnswer}
            >
              {showAnswer ? <EyeOff size={15} /> : <Eye size={15} />}
              <span>{showAnswer ? 'Hide Suggested Answer' : 'Reveal Suggested Model Answer'}</span>
            </button>

            {showAnswer && (
              <div className="model-answer-content">
                <div className="answer-box">
                  <strong>Suggested Response & Approach:</strong>
                  {currentQuestion.category === 'Coding Questions' ? (
                    <pre className="code-solution">{currentQuestion.suggestedAnswer}</pre>
                  ) : (
                    <p>{currentQuestion.suggestedAnswer}</p>
                  )}
                </div>

                {currentQuestion.keyPoints?.length > 0 && (
                  <div className="key-points-box">
                    <strong>Key Points to Cover:</strong>
                    <ul>
                      {currentQuestion.keyPoints.map((pt, i) => (
                        <li key={i}>{pt}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Question Navigation Controls */}
          <div className="question-nav-controls">
            <button
              className="button button-secondary"
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0}
            >
              <ChevronLeft size={16} /> Previous Question
            </button>
            <span className="nav-counter">
              Question {currentIndex + 1} of {filteredQuestions.length}
            </span>
            <button
              className="button button-secondary"
              type="button"
              onClick={handleNext}
              disabled={currentIndex === filteredQuestions.length - 1}
            >
              Next Question <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
