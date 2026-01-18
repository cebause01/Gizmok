import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Clock, Play, BookOpen, ArrowRight, CheckCircle } from 'lucide-react'
import { storage, Quiz, FlashcardDeck } from '../utils/storage'
import './Progress.css'

interface InProgressQuiz {
  quiz: Quiz
  deck: FlashcardDeck | null
  progress: number
  currentQuestion: number
  totalQuestions: number
}

export default function Progress() {
  const [inProgressQuizzes, setInProgressQuizzes] = useState<InProgressQuiz[]>([])
  const currentUser = storage.getCurrentUser()

  useEffect(() => {
    loadProgress()
    // Refresh every 2 seconds to catch updates
    const interval = setInterval(loadProgress, 2000)
    return () => clearInterval(interval)
  }, [])

  const loadProgress = () => {
    if (!currentUser) return
    
    // Get all user quizzes that are started but not completed
    const allQuizzes = storage.getQuizzes()
    const userQuizzes = allQuizzes.filter(q => 
      q.userId === currentUser.id && 
      q.startedAt && 
      !q.completedAt
    )
    
    // Get all decks to match with quizzes
    const allDecks = storage.getDecks()
    
    const inProgress: InProgressQuiz[] = userQuizzes.map(quiz => {
      const deck = allDecks.find(d => d.id === quiz.deckId) || null
      const currentQ = quiz.currentQuestionIndex !== undefined ? quiz.currentQuestionIndex : 0
      const totalQ = quiz.questions.length
      const progress = totalQ > 0 ? Math.round((currentQ / totalQ) * 100) : 0
      
      return {
        quiz,
        deck,
        progress,
        currentQuestion: currentQ + 1, // 1-based for display
        totalQuestions: totalQ,
      }
    })
    
    // Sort by most recently started
    inProgress.sort((a, b) => (b.quiz.startedAt || 0) - (a.quiz.startedAt || 0))
    
    setInProgressQuizzes(inProgress)
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    return date.toLocaleDateString()
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return '#16a34a' // green
    if (percentage >= 50) return '#fbbf24' // yellow
    if (percentage >= 25) return '#ea580c' // orange
    return '#dc2626' // red
  }

  if (!currentUser) {
    return (
      <div className="progress-page">
        <div className="empty-state">
          <p>Please log in to view your progress</p>
        </div>
      </div>
    )
  }

  return (
    <div className="progress-page">
      <div className="progress-header">
        <h1>In Progress</h1>
        <p>Quizzes you've started but haven't completed yet</p>
      </div>

      {inProgressQuizzes.length === 0 ? (
        <div className="empty-state-large">
          <Clock size={64} className="empty-icon" />
          <h2>No quizzes in progress</h2>
          <p>Start a quiz to see your progress here</p>
          <Link to="/flashcards" className="btn-primary-large">
            <BookOpen size={20} />
            Browse Quizzes
          </Link>
        </div>
      ) : (
        <div className="quizzes-grid">
          {inProgressQuizzes.map((item) => {
            const progressColor = getProgressColor(item.progress)
            
            return (
              <div key={item.quiz.id} className="quiz-card-progress">
                <div className="quiz-card-header">
                  <div className="quiz-title-section">
                    <h3>{item.deck?.name || 'Quiz'}</h3>
                    {item.deck?.subject && (
                      <span className="quiz-subject">{item.deck.subject}</span>
                    )}
                  </div>
                  <div className="quiz-status-badge">
                    <Clock size={16} />
                    <span>{item.quiz.startedAt ? formatDate(item.quiz.startedAt) : 'Started'}</span>
                  </div>
                </div>

                <div className="quiz-progress-info">
                  <div className="progress-stats">
                    <div className="progress-stat">
                      <Play size={16} className="stat-icon-small" />
                      <span>Question {item.currentQuestion} of {item.totalQuestions}</span>
                    </div>
                    {item.quiz.answers && (
                      <div className="progress-stat">
                        <CheckCircle size={16} className="stat-icon-small" />
                        <span>{item.quiz.answers.length} answered</span>
                      </div>
                    )}
                  </div>

                  <div className="progress-bar-container">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${item.progress}%`,
                        backgroundColor: progressColor,
                      }}
                    />
                    <span className="progress-percentage">{item.progress}%</span>
                  </div>
                </div>

                <Link
                  to={`/flashcards/quiz/${item.quiz.deckId}`}
                  className="continue-quiz-btn"
                >
                  <ArrowRight size={18} />
                  Continue Quiz
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
