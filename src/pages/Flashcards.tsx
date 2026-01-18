import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Upload, Trash2, Play, BookOpen, HelpCircle, FileText, Loader, Sparkles } from 'lucide-react'
import { storage, FlashcardDeck, Flashcard, Quiz } from '../utils/storage'
import { aiService } from '../utils/aiService'
import './Flashcards.css'

export default function Flashcards() {
  const [decks, setDecks] = useState<FlashcardDeck[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showUpload, setShowUpload] = useState(false)
  const navigate = useNavigate()
  const currentUser = storage.getCurrentUser()

  useEffect(() => {
    loadDecks()
  }, [])

  const loadDecks = () => {
    const allDecks = storage.getDecks()
    const userDecks = allDecks.filter(d => d.userId === currentUser?.id)
    setDecks(userDecks)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
      setFileName(selectedFile.name)
    } else {
      alert('Please select a PDF file')
    }
  }

  const handleGenerate = async () => {
    if (!file || !currentUser) return

    setIsProcessing(true)
    setProgress(0)

    try {
      // Step 1: Extract text from PDF
      setProgress(25)
      const pdfContent = await aiService.extractTextFromPDF(file)

      // Step 2: Generate flashcards
      setProgress(50)
      const flashcardData = await aiService.generateFlashcards(pdfContent.text, 15)
      
      // Step 3: Generate quiz
      setProgress(75)
      const quizData = await aiService.generateQuiz(pdfContent.text, 5)

      // Step 4: Create flashcards
      const flashcards: Flashcard[] = flashcardData.map((fc, index) => ({
        id: `card-${Date.now()}-${index}`,
        front: fc.front,
        back: fc.back,
        difficulty: 'medium' as const,
      }))

      // Step 5: Create deck
      const deck: FlashcardDeck = {
        id: `deck-${Date.now()}`,
        name: fileName.replace('.pdf', ''),
        description: `AI-generated from ${fileName}`,
        cards: flashcards,
        userId: currentUser.id,
        pdfSource: fileName,
        isAIGenerated: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      storage.saveDeck(deck)

      // Step 6: Save quiz
      const quiz: Quiz = {
        id: `quiz-${Date.now()}`,
        deckId: deck.id,
        questions: quizData.map((q, idx) => ({
          id: `q-${idx}`,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          points: 10,
        })),
        userId: currentUser.id,
        createdAt: Date.now(),
      }

      storage.saveQuiz(quiz)
      setProgress(100)

      // Reset and reload
      setFile(null)
      setFileName('')
      setShowUpload(false)
      loadDecks()

      setTimeout(() => {
        navigate(`/flashcards/edit/${deck.id}`)
      }, 500)
    } catch (error) {
      console.error('Error generating flashcards:', error)
      alert('Error generating flashcards. Please try again.')
    } finally {
      setIsProcessing(false)
      setProgress(0)
    }
  }

  const deleteDeck = (deckId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this deck?')) {
      storage.deleteDeck(deckId)
      loadDecks()
    }
  }

  return (
    <div className="flashcards-page">
      <div className="page-header">
        <h1>Flashcard Decks</h1>
        <button 
          className="btn-primary"
          onClick={() => setShowUpload(true)}
        >
          <Upload size={20} />
          Upload PDF
        </button>
      </div>

      {/* PDF Upload Section */}
      {showUpload && !isProcessing && (
        <div className="upload-section">
          <div className="upload-box">
            {!file ? (
              <>
                <label htmlFor="pdf-upload" className="upload-label">
                  <Upload size={64} className="upload-icon" />
                  <span className="upload-text">Drop your PDF here or click to browse</span>
                  <span className="upload-hint">PDF files only</span>
                </label>
                <input
                  id="pdf-upload"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="file-input"
                />
              </>
            ) : (
              <div className="file-selected">
                <FileText size={48} className="file-icon" />
                <div className="file-info">
                  <h3>{fileName}</h3>
                  <button
                    onClick={() => {
                      setFile(null)
                      setFileName('')
                    }}
                    className="remove-file-btn"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>

          {file && (
            <div className="upload-actions">
              <button className="btn-secondary" onClick={() => {
                setShowUpload(false)
                setFile(null)
                setFileName('')
              }}>
                Cancel
              </button>
              <button onClick={handleGenerate} className="btn-primary generate-btn">
                <Sparkles size={20} />
                Generate Flashcards & Quiz
              </button>
            </div>
          )}
        </div>
      )}

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="processing-container">
          <Loader className="spinner" />
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
          <p className="progress-text">AI is generating flashcards and quiz... {progress}%</p>
          <div className="ai-indicator">
            <Sparkles size={16} />
            <span>Using AI to extract key concepts</span>
          </div>
        </div>
      )}

      {decks.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={64} className="empty-icon" />
          <h2>No decks yet</h2>
          <p>Upload a PDF to generate AI-powered flashcards and quizzes!</p>
          <button 
            className="btn-primary"
            onClick={() => setShowUpload(true)}
          >
            <Upload size={20} />
            Upload PDF to Get Started
          </button>
        </div>
      ) : (
        <div className="decks-grid">
          {decks.map(deck => (
            <div key={deck.id} className="deck-card">
              <div className="deck-header">
                <h3>{deck.name}</h3>
                <button
                  className="icon-button danger"
                  onClick={(e) => deleteDeck(deck.id, e)}
                  aria-label="Delete deck"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <p className="deck-description">{deck.description || 'No description'}</p>
              <div className="deck-stats">
                <span>{deck.cards.length} cards</span>
              </div>
              <div className="deck-actions">
                {deck.cards.length > 0 && (
                  <>
                    <Link
                      to={`/flashcards/study/${deck.id}`}
                      className="btn-secondary"
                    >
                      <Play size={18} />
                      Study
                    </Link>
                    <Link
                      to={`/flashcards/quiz/${deck.id}`}
                      className="btn-secondary"
                    >
                      <HelpCircle size={18} />
                      Quiz
                    </Link>
                  </>
                )}
                <Link
                  to={`/flashcards/edit/${deck.id}`}
                  className="btn-secondary"
                >
                  Edit Cards
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
