import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getQuestions, submitTest } from '../../api/psychology'
import './PsychTest.css'

export default function PsychTest() {
  const navigate = useNavigate()
  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [direction, setDirection] = useState('forward') // for animation

  useEffect(() => {
    getQuestions().then(({ data }) => {
      setQuestions(data.questions)
      setLoading(false)
    })
  }, [])

  const handleAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const handleNext = () => {
    setDirection('forward')
    setCurrent((c) => Math.min(c + 1, questions.length - 1))
  }

  const handlePrev = () => {
    setDirection('backward')
    setCurrent((c) => Math.max(c - 1, 0))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await submitTest(answers)
      navigate('/recommendations')
    } catch (err) {
      console.error(err)
      setSubmitting(false)
    }
  }

  const handleSkip = () => {
    navigate('/dashboard')
  }

  if (loading) return (
    <div className="psych-loading">
      <div className="skeleton" style={{ width: 300, height: 20 }} />
    </div>
  )

  const question = questions[current]
  const progress = ((current + 1) / questions.length) * 100
  const currentAnswer = answers[question?.id]
  const isLast = current === questions.length - 1
  const answeredCount = Object.keys(answers).length

  return (
    <div className="psych-page">
      {/* Progress bar */}
      <div className="psych-progress-bar">
        <div className="psych-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="psych-container">
        {/* Header */}
        <div className="psych-header">
          <span className="psych-counter">
            {current + 1} / {questions.length}
          </span>
          <button className="psych-skip" onClick={handleSkip}>
            Passer le test
          </button>
        </div>

        {/* Question */}
        <div className={`psych-question-wrap ${direction}`} key={current}>
          <div className="psych-question-number">Question {current + 1}</div>
          <h2 className="psych-question-text">{question?.text}</h2>

          <div className="psych-options">
            {question?.options.map((opt) => (
              <button
                key={opt.value}
                className={`psych-option ${currentAnswer === opt.value ? 'selected' : ''}`}
                onClick={() => handleAnswer(question.id, opt.value)}
              >
                <span className="psych-option-letter">{opt.value.toUpperCase()}</span>
                <span className="psych-option-label">{opt.label}</span>
                {currentAnswer === opt.value && (
                  <svg className="psych-option-check" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="psych-nav">
          <button
            className="btn btn-ghost"
            onClick={handlePrev}
            disabled={current === 0}
          >
            ← Précédent
          </button>

          {isLast ? (
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={answeredCount < 8 || submitting}
            >
              {submitting ? 'Analyse...' : 'Découvrir mon profil →'}
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={handleNext}
              disabled={!currentAnswer}
            >
              Suivant →
            </button>
          )}
        </div>

        {/* Answered count */}
        <p className="psych-answered">
          {answeredCount} question{answeredCount !== 1 ? 's' : ''} répondue{answeredCount !== 1 ? 's' : ''}
          {answeredCount < 8 && isLast && ' (8 minimum pour soumettre)'}
        </p>
      </div>
    </div>
  )
}
