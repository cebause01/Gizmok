import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Play, HelpCircle, Search, Filter, StickyNote, Plus } from 'lucide-react'
import { storage, FlashcardDeck } from '../utils/storage'
import { SUBJECTS } from '../utils/publicDecks'
import './PublicDecks.css'

type TabType = 'decks' | 'notes'

export default function PublicDecks() {
  const [activeTab, setActiveTab] = useState<TabType>('decks')
  const [publicDecks, setPublicDecks] = useState<FlashcardDeck[]>([])
  const [filteredDecks, setFilteredDecks] = useState<FlashcardDeck[]>([])
  const [selectedSubject, setSelectedSubject] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadPublicDecks()
  }, [])

  useEffect(() => {
    filterDecks()
  }, [publicDecks, selectedSubject, searchQuery])

  const loadPublicDecks = () => {
    // Ensure public decks are initialized
    storage.initializePublicDecks()
    
    // Load public decks
    const decks = storage.getPublicDecks()
    setPublicDecks(decks)
  }

  const filterDecks = () => {
    let filtered = [...publicDecks]

    // Filter by subject
    if (selectedSubject !== 'All') {
      filtered = filtered.filter(deck => deck.subject === selectedSubject)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(deck =>
        deck.name.toLowerCase().includes(query) ||
        deck.description?.toLowerCase().includes(query) ||
        deck.subject?.toLowerCase().includes(query)
      )
    }

    setFilteredDecks(filtered)
  }

  const getSubjectStats = () => {
    const stats = new Map<string, number>()
    publicDecks.forEach(deck => {
      const subject = deck.subject || 'Other'
      stats.set(subject, (stats.get(subject) || 0) + 1)
    })
    return Array.from(stats.entries()).map(([subject, count]) => ({ subject, count }))
  }

  return (
    <div className="public-decks-page">
      <div className="public-decks-header">
        <h1>Public Library</h1>
        <p>Browse public flashcard decks and create beautiful notes</p>
      </div>

      <div className="public-tabs">
        <button
          className={`public-tab ${activeTab === 'decks' ? 'active' : ''}`}
          onClick={() => setActiveTab('decks')}
        >
          <BookOpen size={20} />
          <span>Public Decks</span>
        </button>
        <button
          className={`public-tab ${activeTab === 'notes' ? 'active' : ''}`}
          onClick={() => setActiveTab('notes')}
        >
          <StickyNote size={20} />
          <span>Notes</span>
        </button>
      </div>

      {activeTab === 'notes' ? (
        <div className="public-notes-section">
          <div className="notes-section-header">
            <h2>Create Beautiful Notes</h2>
            <Link to="/notes/new" className="btn-create-note">
              <Plus size={20} />
              New Note
            </Link>
          </div>
          <div className="notes-features">
            <div className="feature-item">
              <StickyNote size={32} />
              <h3>Handwriting Support</h3>
              <p>Draw and write naturally with pen tools, just like GoodNotes</p>
            </div>
            <div className="feature-item">
              <BookOpen size={32} />
              <h3>Multiple Templates</h3>
              <p>Choose from blank, lined, grid, or dotted paper templates</p>
            </div>
            <div className="feature-item">
              <HelpCircle size={32} />
              <h3>Study Notes</h3>
              <p>Create study notes for your decks and organize your learning</p>
            </div>
          </div>
          <Link to="/notes/new" className="btn-start-note">
            Start Taking Notes →
          </Link>
        </div>
      ) : (
        <>

      <div className="public-decks-controls">
        <div className="search-box">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search decks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-box">
          <Filter size={20} className="filter-icon" />
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="subject-filter"
          >
            <option value="All">All Subjects</option>
            {SUBJECTS.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedSubject === 'All' && (
        <div className="subject-stats">
          <h3>Browse by Subject</h3>
          <div className="subject-stats-grid">
            {getSubjectStats().map(({ subject, count }) => (
              <button
                key={subject}
                className="subject-stat-card"
                onClick={() => setSelectedSubject(subject)}
              >
                <span className="subject-name">{subject}</span>
                <span className="subject-count">{count} decks</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="decks-results">
        <div className="results-header">
          <h2>
            {selectedSubject !== 'All' ? selectedSubject : 'All Decks'}
          </h2>
          <span className="results-count">{filteredDecks.length} deck{filteredDecks.length !== 1 ? 's' : ''}</span>
        </div>

        {filteredDecks.length === 0 ? (
          <div className="empty-state">
            <BookOpen size={64} className="empty-icon" />
            <h3>No decks found</h3>
            <p>
              {searchQuery ? 'Try adjusting your search terms' : 'No decks available for this subject yet'}
            </p>
          </div>
        ) : (
          <div className="public-decks-grid">
            {filteredDecks.map(deck => (
              <div key={deck.id} className="public-deck-card">
                <div className="deck-card-header">
                  <h3>{deck.name}</h3>
                  {deck.subject && (
                    <span className="subject-badge">{deck.subject}</span>
                  )}
                </div>
                <p className="deck-description">{deck.description || 'No description'}</p>
                <div className="deck-card-count">
                  {deck.cards.length} cards
                </div>
                <div className="deck-actions">
                  {deck.cards.length > 0 && (
                    <>
                      <Link
                        to={`/flashcards/study/${deck.id}`}
                        className="btn-deck-action study"
                      >
                        <Play size={18} />
                        Study
                      </Link>
                      <Link
                        to={`/flashcards/quiz/${deck.id}`}
                        className="btn-deck-action quiz"
                      >
                        <HelpCircle size={18} />
                        Quiz
                      </Link>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
        </>
      )}
    </div>
  )
}
