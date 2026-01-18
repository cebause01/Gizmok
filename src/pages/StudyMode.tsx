import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, RotateCcw, CheckCircle, XCircle } from 'lucide-react'
import { storage, FlashcardDeck, Flashcard } from '../utils/storage'
import './StudyMode.css'

export default function StudyMode() {
  const { deckId } = useParams<{ deckId: string }>()
  const navigate = useNavigate()
  const [deck, setDeck] = useState<FlashcardDeck | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showBack, setShowBack] = useState(false)
  const [shuffledCards, setShuffledCards] = useState<Flashcard[]>([])

  useEffect(() => {
    if (!deckId) return
    const decks = storage.getDecks()
    const foundDeck = decks.find(d => d.id === deckId)
    if (foundDeck) {
      setDeck(foundDeck)
      // Shuffle cards for study
      const shuffled = [...foundDeck.cards].sort(() => Math.random() - 0.5)
      setShuffledCards(shuffled)
    }
  }, [deckId])

  if (!deck) {
    return (
      <div className="study-mode">
        <div className="loading">Loading...</div>
      </div>
    )
  }

  if (deck.cards.length === 0 || shuffledCards.length === 0) {
    return (
      <div className="study-mode">
        <div className="empty-state">
          <h2>No cards in this deck</h2>
          <p>Add some cards to start studying!</p>
          <button className="btn-primary" onClick={() => navigate(`/flashcards/edit/${deckId}`)}>
            Add Cards
          </button>
        </div>
      </div>
    )
  }

  const currentCard = shuffledCards[currentIndex]
  const progress = ((currentIndex + 1) / shuffledCards.length) * 100

  const handleAnswer = (difficulty: 'easy' | 'medium' | 'hard') => {
    // Update card difficulty and schedule next review
    const updatedCard: Flashcard = {
      ...currentCard,
      difficulty,
      lastReviewed: Date.now(),
      nextReview: Date.now() + getNextReviewDelay(difficulty),
    }

    // Update card in deck
    const updatedCards = deck.cards.map(c =>
      c.id === currentCard.id ? updatedCard : c
    )
    const updatedDeck: FlashcardDeck = {
      ...deck,
      cards: updatedCards,
      updatedAt: Date.now(),
    }

    // Update shuffled array
    const updatedShuffled = shuffledCards.map(c =>
      c.id === currentCard.id ? updatedCard : c
    )
    setShuffledCards(updatedShuffled)

    storage.saveDeck(updatedDeck)
    setDeck(updatedDeck)

    // Move to next card
    if (currentIndex < shuffledCards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setShowBack(false)
    } else {
      // Finished all cards
      alert('Great job! You finished all cards!')
      navigate('/flashcards')
    }
  }

  const getNextReviewDelay = (difficulty: string): number => {
    // Spaced repetition intervals (in milliseconds)
    const delays: Record<string, number> = {
      easy: 7 * 24 * 60 * 60 * 1000, // 7 days
      medium: 3 * 24 * 60 * 60 * 1000, // 3 days
      hard: 1 * 24 * 60 * 60 * 1000, // 1 day
    }
    return delays[difficulty] || delays.medium
  }

  const flipCard = () => {
    setShowBack(!showBack)
  }

  const restart = () => {
    setCurrentIndex(0)
    setShowBack(false)
    const shuffled = [...deck.cards].sort(() => Math.random() - 0.5)
    setShuffledCards(shuffled)
  }

  return (
    <div className="study-mode">
      <div className="study-header">
        <button className="back-button" onClick={() => navigate('/flashcards')}>
          <ArrowLeft size={20} />
          Back to Decks
        </button>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="progress-text">
          {currentIndex + 1} / {shuffledCards.length}
        </div>
      </div>

      <div className="card-container">
        <div className={`flashcard ${showBack ? 'flipped' : ''}`} onClick={flipCard}>
          <div className="card-front">
            <div className="card-label">Question</div>
            <div className="card-content">{currentCard.front}</div>
            <div className="card-hint">Click to reveal answer</div>
          </div>
          <div className="card-back">
            <div className="card-label">Answer</div>
            <div className="card-content">{currentCard.back}</div>
            <div className="card-hint">How well did you know this?</div>
          </div>
        </div>
      </div>

      {showBack && (
        <div className="answer-buttons">
          <button
            className="answer-btn hard"
            onClick={() => handleAnswer('hard')}
          >
            <XCircle size={20} />
            Hard
          </button>
          <button
            className="answer-btn medium"
            onClick={() => handleAnswer('medium')}
          >
            <RotateCcw size={20} />
            Medium
          </button>
          <button
            className="answer-btn easy"
            onClick={() => handleAnswer('easy')}
          >
            <CheckCircle size={20} />
            Easy
          </button>
        </div>
      )}

      <div className="study-controls">
        <button className="btn-secondary" onClick={restart}>
          <RotateCcw size={18} />
          Restart
        </button>
      </div>
    </div>
  )
}
