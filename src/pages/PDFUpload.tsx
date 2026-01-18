import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, FileText, Loader, Sparkles } from 'lucide-react'
import { storage, FlashcardDeck, Flashcard } from '../utils/storage'
import { aiService } from '../utils/aiService'
import './PDFUpload.css'

export default function PDFUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const navigate = useNavigate()
  const currentUser = storage.getCurrentUser()

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
      await aiService.generateQuiz(pdfContent.text, 5)

      // Step 4: Create deck
      const flashcards: Flashcard[] = flashcardData.map((fc, index) => ({
        id: `card-${Date.now()}-${index}`,
        front: fc.front,
        back: fc.back,
        difficulty: 'medium' as const,
      }))

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
      setProgress(100)

      setTimeout(() => {
        navigate(`/flashcards/edit/${deck.id}`)
      }, 500)
    } catch (error) {
      console.error('Error generating flashcards:', error)
      alert('Error generating flashcards. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="pdf-upload-page">
      <div className="upload-header">
        <h1>Upload PDF</h1>
        <p>Generate AI-powered flashcards and quizzes from your PDF documents</p>
      </div>

      <div className="upload-container">
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

        {isProcessing && (
          <div className="processing-container">
            <Loader className="spinner" />
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
            </div>
            <p className="progress-text">AI is generating flashcards... {progress}%</p>
            <div className="ai-indicator">
              <Sparkles size={16} />
              <span>Using AI to extract key concepts</span>
            </div>
          </div>
        )}

        {file && !isProcessing && (
          <button onClick={handleGenerate} className="generate-btn">
            <Sparkles size={20} />
            Generate Flashcards & Quiz
          </button>
        )}
      </div>

      <div className="upload-info">
        <h3>How it works</h3>
        <div className="info-steps">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h4>Upload PDF</h4>
              <p>Select any PDF document from your device</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h4>AI Analysis</h4>
              <p>Our AI extracts key concepts and information</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h4>Generate Content</h4>
              <p>Get flashcards and quiz questions automatically created</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
