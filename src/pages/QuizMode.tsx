import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle, XCircle, Trophy } from 'lucide-react'
import { storage, FlashcardDeck, Quiz } from '../utils/storage'
import { aiService } from '../utils/aiService'
import './QuizMode.css'

export default function QuizMode() {
  const { deckId } = useParams<{ deckId: string }>()
  const navigate = useNavigate()
  const [deck, setDeck] = useState<FlashcardDeck | null>(null)
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [isCorrect, setIsCorrect] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [pointsEarned, setPointsEarned] = useState(0)
  const currentUser = storage.getCurrentUser()

  useEffect(() => {
    if (!deckId) return
    const decks = storage.getDecks()
    const foundDeck = decks.find(d => d.id === deckId)
    if (foundDeck) {
      setDeck(foundDeck)
      loadOrCreateQuiz(foundDeck)
    }
  }, [deckId])

  const loadOrCreateQuiz = async (deck: FlashcardDeck) => {
    // Check if quiz already exists
    const quizzes = storage.getQuizzes()
    let existingQuiz = quizzes.find(q => q.deckId === deck.id && q.userId === currentUser?.id)

    if (existingQuiz) {
      // Resume existing quiz from where they left off
      if (existingQuiz.currentQuestionIndex !== undefined) {
        setCurrentIndex(existingQuiz.currentQuestionIndex)
      }
      setQuiz(existingQuiz)
      // Mark as started if not already
      if (!existingQuiz.startedAt) {
        existingQuiz.startedAt = Date.now()
        storage.saveQuiz(existingQuiz)
      }
    } else {
      // Check if there's a public quiz for this deck
      const publicQuiz = quizzes.find(q => q.deckId === deck.id && q.userId === 'public')
      
      if (publicQuiz) {
        // Create user copy from public quiz
        const newQuiz: Quiz = {
          ...publicQuiz,
          id: `quiz-${currentUser?.id}-${deck.id}-${Date.now()}`,
          userId: currentUser?.id || '',
          createdAt: Date.now(),
          startedAt: Date.now(),
          currentQuestionIndex: 0,
          answers: [],
        }
        storage.saveQuiz(newQuiz)
        setQuiz(newQuiz)
      } else {
        // Generate new quiz from deck content
        const deckContent = deck.cards.map(c => `${c.front} ${c.back}`).join(' ')
        const quizData = await aiService.generateQuiz(deckContent, 5)

        const newQuiz: Quiz = {
          id: `quiz-${Date.now()}`,
          deckId: deck.id,
          questions: quizData.map((q, idx) => ({
            id: `q-${idx}`,
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            points: 10,
          })),
          userId: currentUser?.id || '',
          createdAt: Date.now(),
          startedAt: Date.now(),
          currentQuestionIndex: 0,
          answers: [],
        }

        storage.saveQuiz(newQuiz)
        setQuiz(newQuiz)
      }
    }
  }

  if (!deck || !quiz || quiz.questions.length === 0) {
    return (
      <div className="quiz-mode">
        <div className="loading">Loading quiz...</div>
      </div>
    )
  }

  const currentQuestion = quiz.questions[currentIndex]
  const progress = ((currentIndex + 1) / quiz.questions.length) * 100

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult || !quiz) return
    setSelectedAnswer(answerIndex)
    const correct = answerIndex === currentQuestion.correctAnswer
    setIsCorrect(correct)

    if (correct) {
      const earnedPoints = currentQuestion.points
      setScore(score + earnedPoints)
      setPointsEarned(pointsEarned + earnedPoints)
      
      // Award points to user
      if (currentUser) {
        storage.addPoints(currentUser.id, earnedPoints)
      }
    }

    // Save answer to quiz progress
    const updatedQuiz = {
      ...quiz,
      answers: [
        ...(quiz.answers || []),
        { questionId: currentQuestion.id, selectedAnswer: answerIndex }
      ],
    }
    storage.saveQuiz(updatedQuiz)
    setQuiz(updatedQuiz)

    setShowResult(true)
  }

  const handleNext = () => {
    if (!quiz) return
    
    const nextIndex = currentIndex + 1
    
    if (nextIndex < quiz.questions.length) {
      setCurrentIndex(nextIndex)
      setSelectedAnswer(null)
      setShowResult(false)
      setIsCorrect(false)
      
      // Update quiz progress
      const updatedQuiz = {
        ...quiz,
        currentQuestionIndex: nextIndex,
      }
      storage.saveQuiz(updatedQuiz)
      setQuiz(updatedQuiz)
    } else {
      // Quiz completed
      const updatedQuiz = {
        ...quiz,
        completedAt: Date.now(),
        score: score,
        currentQuestionIndex: undefined, // Clear progress
      }
      storage.saveQuiz(updatedQuiz)
      setQuizCompleted(true)
    }
  }

  if (quizCompleted) {
    const percentage = Math.round((score / (quiz.questions.length * 10)) * 100)
    
    return (
      <div className="quiz-mode">
        <div className="quiz-completed">
          <Trophy className="trophy-icon" />
          <h1>Quiz Complete!</h1>
          <div className="final-score">
            <div className="score-value">{score}</div>
            <div className="score-label">points earned</div>
            <div className="score-percentage">{percentage}%</div>
          </div>
          <div className="quiz-actions">
            <button className="btn-secondary" onClick={() => navigate('/flashcards')}>
              Back to Decks
            </button>
            <button className="btn-primary" onClick={() => {
              setCurrentIndex(0)
              setSelectedAnswer(null)
              setShowResult(false)
              setIsCorrect(false)
              setScore(0)
              setPointsEarned(0)
              setQuizCompleted(false)
            }}>
              Retake Quiz
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="quiz-mode">
      <div className="quiz-header">
        <button className="back-button" onClick={() => navigate('/flashcards')}>
          <ArrowLeft size={20} />
          Back
        </button>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="progress-text">
          Question {currentIndex + 1} / {quiz.questions.length}
        </div>
        <div className="score-display">
          Score: {score} pts
        </div>
      </div>

      <div className="question-container">
        <h2 className="question-text">{currentQuestion.question}</h2>
        <div className="options-grid">
          {currentQuestion.options.map((option, index) => {
            let optionClass = 'option'
            if (showResult) {
              if (index === currentQuestion.correctAnswer) {
                optionClass += ' correct'
              } else if (index === selectedAnswer && !isCorrect) {
                optionClass += ' incorrect'
              }
            } else if (selectedAnswer === index) {
              optionClass += ' selected'
            }

            return (
              <button
                key={index}
                className={optionClass}
                onClick={() => handleAnswerSelect(index)}
                disabled={showResult}
              >
                {showResult && index === currentQuestion.correctAnswer && (
                  <CheckCircle className="option-icon" />
                )}
                {showResult && index === selectedAnswer && !isCorrect && (
                  <XCircle className="option-icon" />
                )}
                <span>{option}</span>
              </button>
            )
          })}
        </div>

        {showResult && (
          <div className={`result-message ${isCorrect ? 'correct' : 'incorrect'}`}>
            {isCorrect ? (
              <>
                <CheckCircle size={24} />
                <span>Correct! +{currentQuestion.points} points</span>
              </>
            ) : (
              <>
                <XCircle size={24} />
                <span>Incorrect. The correct answer is highlighted.</span>
              </>
            )}
          </div>
        )}

        {showResult && (
          <button className="next-button" onClick={handleNext}>
            {currentIndex < quiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
          </button>
        )}
      </div>
    </div>
  )
}
