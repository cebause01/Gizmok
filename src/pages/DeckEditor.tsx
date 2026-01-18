import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react'
import { storage, FlashcardDeck, Flashcard } from '../utils/storage'
import './DeckEditor.css'

export default function DeckEditor() {
  const { deckId } = useParams<{ deckId: string }>()
  const navigate = useNavigate()
  const [deck, setDeck] = useState<FlashcardDeck | null>(null)
  const [cards, setCards] = useState<Flashcard[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [newCardFront, setNewCardFront] = useState('')
  const [newCardBack, setNewCardBack] = useState('')
  const [editingCardId, setEditingCardId] = useState<string | null>(null)
  const [editFront, setEditFront] = useState('')
  const [editBack, setEditBack] = useState('')

  useEffect(() => {
    if (!deckId) return
    const decks = storage.getDecks()
    const foundDeck = decks.find(d => d.id === deckId)
    if (foundDeck) {
      setDeck(foundDeck)
      setCards(foundDeck.cards)
    }
  }, [deckId])

  const addCard = () => {
    if (!newCardFront.trim() || !newCardBack.trim()) return

    const newCard: Flashcard = {
      id: Date.now().toString(),
      front: newCardFront,
      back: newCardBack,
      difficulty: 'medium',
    }

    const updatedCards = [...cards, newCard]
    setCards(updatedCards)
    setNewCardFront('')
    setNewCardBack('')
    setShowAddModal(false)
  }

  const deleteCard = (cardId: string) => {
    if (confirm('Are you sure you want to delete this card?')) {
      setCards(cards.filter(c => c.id !== cardId))
    }
  }

  const startEdit = (card: Flashcard) => {
    setEditingCardId(card.id)
    setEditFront(card.front)
    setEditBack(card.back)
  }

  const saveEdit = () => {
    if (!editingCardId || !editFront.trim() || !editBack.trim()) return

    const updatedCards = cards.map(c =>
      c.id === editingCardId
        ? { ...c, front: editFront, back: editBack }
        : c
    )
    setCards(updatedCards)
    setEditingCardId(null)
    setEditFront('')
    setEditBack('')
  }

  const cancelEdit = () => {
    setEditingCardId(null)
    setEditFront('')
    setEditBack('')
  }

  const saveDeck = () => {
    if (!deck) return

    const updatedDeck: FlashcardDeck = {
      ...deck,
      cards,
      updatedAt: Date.now(),
    }

    storage.saveDeck(updatedDeck)
    navigate('/flashcards')
  }

  if (!deck) {
    return (
      <div className="deck-editor">
        <div className="loading">Loading...</div>
      </div>
    )
  }

  return (
    <div className="deck-editor">
      <div className="editor-header">
        <button className="back-button" onClick={() => navigate('/flashcards')}>
          <ArrowLeft size={20} />
          Back
        </button>
        <h1>{deck.name}</h1>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={18} />
            Add Card
          </button>
          <button className="btn-primary" onClick={saveDeck}>
            <Save size={18} />
            Save
          </button>
        </div>
      </div>

      <div className="cards-list">
        {cards.length === 0 ? (
          <div className="empty-state">
            <p>No cards in this deck yet. Add your first card!</p>
          </div>
        ) : (
          cards.map((card) => (
            <div key={card.id} className="card-item">
              {editingCardId === card.id ? (
                <div className="card-edit-form">
                  <div className="form-group">
                    <label>Front</label>
                    <textarea
                      value={editFront}
                      onChange={(e) => setEditFront(e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div className="form-group">
                    <label>Back</label>
                    <textarea
                      value={editBack}
                      onChange={(e) => setEditBack(e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div className="card-edit-actions">
                    <button className="btn-secondary" onClick={cancelEdit}>
                      Cancel
                    </button>
                    <button className="btn-primary" onClick={saveEdit}>
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="card-content">
                    <div className="card-side">
                      <div className="card-label">Front</div>
                      <div className="card-text">{card.front}</div>
                    </div>
                    <div className="card-divider" />
                    <div className="card-side">
                      <div className="card-label">Back</div>
                      <div className="card-text">{card.back}</div>
                    </div>
                  </div>
                  <div className="card-actions">
                    <button
                      className="icon-button"
                      onClick={() => startEdit(card)}
                      aria-label="Edit card"
                    >
                      Edit
                    </button>
                    <button
                      className="icon-button danger"
                      onClick={() => deleteCard(card.id)}
                      aria-label="Delete card"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add New Card</h2>
            <div className="form-group">
              <label>Front</label>
              <textarea
                value={newCardFront}
                onChange={(e) => setNewCardFront(e.target.value)}
                placeholder="Question or term..."
                rows={3}
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>Back</label>
              <textarea
                value={newCardBack}
                onChange={(e) => setNewCardBack(e.target.value)}
                placeholder="Answer or definition..."
                rows={3}
              />
            </div>
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button className="btn-primary" onClick={addCard}>
                Add Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
