import React, { useState } from 'react'
import '../style/interview.scss'
import { useInterview } from '../hooks/useInterview.js'
import { useParams } from 'react-router'

const NAV_ITEMS = [
  {
    id: 'technical',
    label: 'Technical Questions',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    )
  },
  {
    id: 'behavioral',
    label: 'Behavioral Questions',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    )
  },
  {
    id: 'mock',
    label: 'Mock Interview',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
    )
  },
  {
    id: 'ats',
    label: 'ATS Score',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    )
  },
  {
    id: 'roadmap',
    label: 'Road Map',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="3 11 22 2 13 21 11 13 3 11" />
      </svg>
    )
  },
]

// Sub-components
const QuestionCard = ({ item, index }) => {
  const [open, setOpen] = useState(false)
  return (
    <div className='q-card'>
      <div className='q-card__header' onClick={() => setOpen(o => !o)}>
        <span className='q-card__index'>Q{index + 1}</span>
        <p className='q-card__question'>{item.question}</p>
        <span className={`q-card__chevron ${open ? 'q-card__chevron--open' : ''}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </div>
      {open && (
        <div className='q-card__body'>
          <div className='q-card__section'>
            <span className='q-card__tag q-card__tag--intention'>Intention</span>
            <p>{item.intention}</p>
          </div>
          <div className='q-card__section'>
            <span className='q-card__tag q-card__tag--answer'>Model Answer</span>
            <p>{item.answer}</p>
          </div>
        </div>
      )}
    </div>
  )
}

const RoadMapDay = ({ day }) => (
  <div className='roadmap-day'>
    <div className='roadmap-day__header'>
      <span className='roadmap-day__badge'>Day {day.day}</span>
      <h3 className='roadmap-day__focus'>{day.focus}</h3>
    </div>
    <ul className='roadmap-day__tasks'>
      {day.tasks.map((task, i) => (
        <li key={i}>
          <span className='roadmap-day__bullet' />
          {task}
        </li>
      ))}
    </ul>
  </div>
)

const AtsOverview = ({ score, scoreColor, summary, matchedKeywords, missingKeywords, suggestions }) => (
  <section>
    <div className='content-header'>
      <h2>ATS Score</h2>
      <span className='content-header__count'>{score}% score</span>
    </div>

    <div className='ats-panel'>
      <div className='ats-panel__score'>
        <div className={`match-score__ring ${scoreColor}`}>
          <span className='match-score__value'>{score}</span>
          <span className='match-score__pct'>%</span>
        </div>
        <p>{summary || 'ATS analysis will appear for newly generated reports.'}</p>
      </div>

      <div className='ats-grid'>
        <div className='ats-block'>
          <h3>Matched Keywords</h3>
          <div className='keyword-list'>
            {matchedKeywords.length ? matchedKeywords.map((keyword, i) => (
              <span key={i} className='keyword-chip keyword-chip--matched'>{keyword}</span>
            )) : <p className='empty-text'>No matched keywords saved.</p>}
          </div>
        </div>

        <div className='ats-block'>
          <h3>Missing Keywords</h3>
          <div className='keyword-list'>
            {missingKeywords.length ? missingKeywords.map((keyword, i) => (
              <span key={i} className='keyword-chip keyword-chip--missing'>{keyword}</span>
            )) : <p className='empty-text'>No missing keywords saved.</p>}
          </div>
        </div>
      </div>

      <div className='ats-block'>
        <h3>Resume Suggestions</h3>
        <ul className='ats-suggestions'>
          {suggestions.length ? suggestions.map((suggestion, i) => (
            <li key={i}>{suggestion}</li>
          )) : <li>Generate a new report to see ATS resume suggestions.</li>}
        </ul>
      </div>
    </div>
  </section>
)

const ScorePill = ({ label, value }) => (
  <div className='mock-score'>
    <span className='mock-score__label'>{label}</span>
    <strong>{value}%</strong>
  </div>
)

const buildMockInterviewQuestions = (report) => {
  const technical = (report.technicalQuestions || []).slice(0, 5).map((question, questionIndex) => ({
    ...question,
    questionType: 'technical',
    questionIndex
  }))
  const behavioral = (report.behavioralQuestions || []).slice(0, 3).map((question, questionIndex) => ({
    ...question,
    questionType: 'behavioral',
    questionIndex
  }))

  return [...technical, ...behavioral].slice(0, 8)
}

const MockInterview = ({ report, interviewId, submitMockInterview }) => {
  const sessionQuestions = buildMockInterviewQuestions(report)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [evaluation, setEvaluation] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const currentQuestion = sessionQuestions[questionIndex]
  const currentAnswer = answers[questionIndex] || ''
  const isLastQuestion = questionIndex === sessionQuestions.length - 1

  const handleAnswerChange = (value) => {
    setAnswers(previous => ({
      ...previous,
      [questionIndex]: value
    }))
  }

  const handleContinue = async () => {
    if (!currentAnswer.trim()) {
      alert("Please answer this question before continuing.")
      return
    }

    if (!isLastQuestion) {
      setQuestionIndex(index => index + 1)
      return
    }

    setSubmitting(true)
    const result = await submitMockInterview({
      interviewReportId: interviewId,
      answers: sessionQuestions.map((question, index) => ({
        questionType: question.questionType,
        questionIndex: question.questionIndex,
        answer: answers[index] || ''
      }))
    })
    setSubmitting(false)

    if (!result) {
      alert("Could not complete the interview. Please try again.")
      return
    }

    setEvaluation(result)
  }

  const restartInterview = () => {
    setAnswers({})
    setQuestionIndex(0)
    setEvaluation(null)
  }

  if (sessionQuestions.length < 6 || !currentQuestion) {
    return (
      <section className='mock-interview'>
        <div className='content-header'>
          <h2>Mock Interview</h2>
          <span className='content-header__count'>No questions</span>
        </div>
        <p className='empty-text'>At least 6 generated questions are needed to start a mock interview.</p>
      </section>
    )
  }

  if (evaluation) {
    return (
      <section className='mock-interview'>
        <div className='content-header'>
          <h2>Interview Result</h2>
          <span className='content-header__count'>{sessionQuestions.length} questions completed</span>
        </div>

        <div className='mock-feedback mock-feedback--final'>
          <div className='mock-feedback__header'>
            <div>
              <p className='mock-feedback__eyebrow'>Final verdict</p>
              <h3>{evaluation.verdict}</h3>
              <p className='mock-final-score'>{evaluation.finalScore}<span>/100</span></p>
            </div>
            <div className='mock-score-grid'>
              <ScorePill label='Technical' value={evaluation.technicalScore} />
              <ScorePill label='Behavioral' value={evaluation.behavioralScore} />
              <ScorePill label='Communication' value={evaluation.communicationScore} />
            </div>
          </div>

          <p className='mock-feedback__summary'>{evaluation.summary}</p>

          <div className='mock-feedback__grid'>
            <div className='mock-feedback__block'>
              <h4>What went well</h4>
              <ul>
                {(evaluation.strengths || []).map((item, index) => <li key={index}>{item}</li>)}
              </ul>
            </div>
            <div className='mock-feedback__block'>
              <h4>What to improve</h4>
              <ul>
                {(evaluation.improvements || []).map((item, index) => <li key={index}>{item}</li>)}
              </ul>
            </div>
          </div>

          <div className='mock-feedback__block'>
            <h4>Question-by-question feedback</h4>
            <ol className='mock-question-results'>
              {(evaluation.questionFeedback || []).map((item, index) => (
                <li key={index}>
                  <strong>{item.score}%</strong>
                  <span>{item.feedback}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className='mock-feedback__block'>
            <h4>Recommended next steps</h4>
            <ul>
              {(evaluation.nextSteps || []).map((item, index) => <li key={index}>{item}</li>)}
            </ul>
          </div>

          <div className='mock-actions mock-actions--end'>
            <button className='generate-btn' onClick={restartInterview}>Try Again</button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className='mock-interview'>
      <div className='content-header'>
        <h2>Mock Interview</h2>
        <span className='content-header__count'>
          {currentQuestion.questionType === 'technical' ? 'Technical Round' : 'HR Round'} · Question {questionIndex + 1} of {sessionQuestions.length}
        </span>
      </div>

      <div className='mock-progress' aria-label={`Question ${questionIndex + 1} of ${sessionQuestions.length}`}>
        {sessionQuestions.map((_, index) => (
          <span
            key={index}
            className={`mock-progress__step ${index <= questionIndex ? 'mock-progress__step--active' : ''}`}
          />
        ))}
      </div>

      <div className='mock-question-card'>
        <span className='q-card__tag q-card__tag--intention'>{currentQuestion.questionType}</span>
        <h3>{currentQuestion.question}</h3>
      </div>

      <textarea
        className='mock-answer'
        value={currentAnswer}
        onChange={(event) => handleAnswerChange(event.target.value)}
        placeholder='Answer as you would in a live interview...'
      />

      <div className='mock-actions'>
        <button
          className='mock-back-button'
          onClick={() => setQuestionIndex(index => Math.max(index - 1, 0))}
          disabled={questionIndex === 0 || submitting}
        >
          Previous
        </button>
        <div className='mock-actions__right'>
          <span>{currentAnswer.trim().split(/\s+/).filter(Boolean).length} words</span>
          <button
            className='generate-btn'
            onClick={handleContinue}
            disabled={submitting}
          >
            {submitting ? 'Preparing verdict...' : isLastQuestion ? 'Finish Interview' : 'Submit & Next'}
          </button>
        </div>
      </div>
    </section>
  )
}

// Main Component
const Interview = () => {
  const [activeNav, setActiveNav] = useState('technical')
  // useInterview already
  // handles fetching in its own useEffect when interviewId changes
  // having it in both places caused double API calls
  const { report, loading, getResumePdf, submitMockInterview } = useInterview()
  const { interviewId } = useParams()

  if (loading || !report) {
    return (
      <main className='loading-screen'>
        <h1>Loading your interview plan...</h1>
      </main>
    )
  }

  const getScoreColor = (score) =>
    score >= 80 ? 'score--high' :
      score >= 60 ? 'score--mid' : 'score--low'

  const atsScore = Number.isFinite(report.atsScore) ? report.atsScore : report.matchScore
  const scoreColor = getScoreColor(report.matchScore)
  const atsScoreColor = getScoreColor(atsScore)
  const matchedKeywords = report.matchedKeywords || []
  const missingKeywords = report.missingKeywords || []
  const atsSuggestions = report.atsSuggestions || []

  return (
    <div className='interview-page'>
      <div className='interview-layout'>

        {/* Left Nav */}
        <nav className='interview-nav'>
          <div className="nav-content">
            <p className='interview-nav__label'>Sections</p>
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                className={`interview-nav__item ${activeNav === item.id ? 'interview-nav__item--active' : ''}`}
                onClick={() => setActiveNav(item.id)}
              >
                <span className='interview-nav__icon'>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => getResumePdf(interviewId)}
            className='button primary-button'
          >
            <svg
              height={"0.8rem"}
              style={{ marginRight: "0.8rem" }}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M10.6144 17.7956 11.492 15.7854C12.2731 13.9966 13.6789 12.5726 15.4325 11.7942L17.8482 10.7219C18.6162 10.381 18.6162 9.26368 17.8482 8.92277L15.5079 7.88394C13.7092 7.08552 12.2782 5.60881 11.5105 3.75894L10.6215 1.61673C10.2916.821765 9.19319.821767 8.8633 1.61673L7.97427 3.75892C7.20657 5.60881 5.77553 7.08552 3.97685 7.88394L1.63658 8.92277C.868537 9.26368.868536 10.381 1.63658 10.7219L4.0523 11.7942C5.80589 12.5726 7.21171 13.9966 7.99275 15.7854L8.8704 17.7956C9.20776 18.5682 10.277 18.5682 10.6144 17.7956ZM19.4014 22.6899 19.6482 22.1242C20.0882 21.1156 20.8807 20.3125 21.8695 19.8732L22.6299 19.5353C23.0412 19.3526 23.0412 18.7549 22.6299 18.5722L21.9121 18.2532C20.8978 17.8026 20.0911 16.9698 19.6586 15.9269L19.4052 15.3156C19.2285 14.8896 18.6395 14.8896 18.4628 15.3156L18.2094 15.9269C17.777 16.9698 16.9703 17.8026 15.956 18.2532L15.2381 18.5722C14.8269 18.7549 14.8269 19.3526 15.2381 19.5353L15.9985 19.8732C16.9874 20.3125 17.7798 21.1156 18.2198 22.1242L18.4667 22.6899C18.6473 23.104 19.2207 23.104 19.4014 22.6899Z" />
            </svg>
            Download Resume
          </button>
        </nav>

        <div className='interview-divider' />

        {/* Center Content */}
        <main className='interview-content'>
          {activeNav === 'technical' && (
            <section>
              <div className='content-header'>
                <h2>Technical Questions</h2>
                <span className='content-header__count'>
                  {report.technicalQuestions.length} questions
                </span>
              </div>
              <div className='q-list'>
                {report.technicalQuestions.map((q, i) => (
                  <QuestionCard key={i} item={q} index={i} />
                ))}
              </div>
            </section>
          )}

          {activeNav === 'behavioral' && (
            <section>
              <div className='content-header'>
                <h2>Behavioral Questions</h2>
                <span className='content-header__count'>
                  {report.behavioralQuestions.length} questions
                </span>
              </div>
              <div className='q-list'>
                {report.behavioralQuestions.map((q, i) => (
                  <QuestionCard key={i} item={q} index={i} />
                ))}
              </div>
            </section>
          )}

          {activeNav === 'mock' && (
            <MockInterview
              report={report}
              interviewId={interviewId}
              submitMockInterview={submitMockInterview}
            />
          )}

          {activeNav === 'ats' && (
            <AtsOverview
              score={atsScore}
              scoreColor={atsScoreColor}
              summary={report.atsSummary}
              matchedKeywords={matchedKeywords}
              missingKeywords={missingKeywords}
              suggestions={atsSuggestions}
            />
          )}

          {activeNav === 'roadmap' && (
            <section>
              <div className='content-header'>
                <h2>Preparation Road Map</h2>
                <span className='content-header__count'>
                  {report.preparationPlan.length}-day plan
                </span>
              </div>
              <div className='roadmap-list'>
                {report.preparationPlan.map((day) => (
                  <RoadMapDay key={day.day} day={day} />
                ))}
              </div>
            </section>
          )}
        </main>

        <div className='interview-divider' />

        {/* Right Sidebar */}
        <aside className='interview-sidebar'>

          {/* Match Score */}
          <div className='match-score'>
            <p className='match-score__label'>Match Score</p>
            <div className={`match-score__ring ${scoreColor}`}>
              <span className='match-score__value'>{report.matchScore}</span>
              <span className='match-score__pct'>%</span>
            </div>
            <p className='match-score__sub'>Strong match for this role</p>
          </div>

          <div className='sidebar-divider' />

          <div className='match-score'>
            <p className='match-score__label'>ATS Score</p>
            <div className={`match-score__ring ${atsScoreColor}`}>
              <span className='match-score__value'>{atsScore}</span>
              <span className='match-score__pct'>%</span>
            </div>
            <p className='match-score__sub'>Resume scanner readiness</p>
          </div>

          <div className='sidebar-divider' />

          {/* Skill Gaps */}
          <div className='skill-gaps'>
            <p className='skill-gaps__label'>Skill Gaps</p>
            <div className='skill-gaps__list'>
              {report.skillGaps.map((gap, i) => (
                <span key={i} className={`skill-tag skill-tag--${gap.severity}`}>
                  {gap.skill}
                </span>
              ))}
            </div>
          </div>

        </aside>
      </div>
    </div>
  )
}

export default Interview
