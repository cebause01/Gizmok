import { Link, useLocation, useNavigate } from 'react-router-dom'
import { BookOpen, TrendingUp, User, Grid, Plus, StickyNote, PanelLeftClose, PanelLeft } from 'lucide-react'
import { storage } from '../utils/storage'
import './Sidebar.css'

interface SidebarProps {
  onAddDeck?: () => void
  onLearn?: () => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

export default function Sidebar({ onAddDeck, onLearn, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const currentUser = storage.getCurrentUser()
  const decks = storage.getDecks(currentUser?.id)

  const handleLearn = () => {
    if (decks.length > 0) {
      const firstDeck = decks.find(d => d.cards.length > 0)
      if (firstDeck) {
        navigate(`/flashcards/study/${firstDeck.id}`)
      } else {
        navigate('/flashcards')
      }
    } else {
      navigate('/flashcards')
    }
  }

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <Link to="/" className="sidebar-logo" title={isCollapsed ? 'Gizmok' : undefined}>
          <img src="/logo.png" alt="Gizmok" className="logo-img" />
        </Link>
        <button
          type="button"
          className="sidebar-toggle"
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        <Link
          to="/"
          className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
          title={isCollapsed ? 'My decks' : undefined}
        >
          <BookOpen size={20} />
          <span className="nav-item-label">My decks</span>
        </Link>
        <Link
          to="/notes"
          className={`nav-item ${location.pathname.startsWith('/notes') ? 'active' : ''}`}
          title={isCollapsed ? 'Notes' : undefined}
        >
          <StickyNote size={20} />
          <span className="nav-item-label">Notes</span>
        </Link>
        <Link
          to="/progress"
          className={`nav-item ${location.pathname === '/progress' ? 'active' : ''}`}
          title={isCollapsed ? 'Progress' : undefined}
        >
          <TrendingUp size={20} />
          <span className="nav-item-label">Progress</span>
        </Link>
        <Link
          to="/public-decks"
          className={`nav-item ${location.pathname === '/public-decks' ? 'active' : ''}`}
          title={isCollapsed ? 'Public decks' : undefined}
        >
          <Grid size={20} />
          <span className="nav-item-label">Public decks</span>
        </Link>
        <Link
          to="/profile"
          className={`nav-item ${location.pathname === '/profile' ? 'active' : ''}`}
          title={isCollapsed ? 'Profile' : undefined}
        >
          <User size={20} />
          <span className="nav-item-label">Profile</span>
        </Link>
      </nav>

      <div className="sidebar-actions">
        <button className="btn-learn" onClick={onLearn || handleLearn} title={isCollapsed ? 'Learn' : undefined}>
          <BookOpen size={20} className="btn-learn-icon" />
          <span className="btn-learn-text">Learn</span>
        </button>
        <button className="btn-add" onClick={onAddDeck} title={isCollapsed ? 'Add' : undefined}>
          <Plus size={20} />
          <span className="btn-add-text">Add</span>
        </button>
      </div>

      <div className="sidebar-decks-section">
        <div className="decks-section-header">
          <span className="decks-section-title">Recent Decks</span>
        </div>
        <div className="decks-list">
          {decks.slice(0, 5).map(deck => (
            <Link
              key={deck.id}
              to={`/flashcards/edit/${deck.id}`}
              className="deck-list-item"
            >
              <div className="deck-color-indicator" style={{ backgroundColor: getDeckColor(deck.name) }} />
              <span className="deck-list-name">{deck.name || 'Untitled'}</span>
            </Link>
          ))}
          {decks.length === 0 && (
            <p className="no-decks-text">No decks yet</p>
          )}
        </div>
      </div>
    </aside>
  )
}

function getDeckColor(name: string): string {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F']
  const hash = name.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0)
  return colors[hash % colors.length]
}
