import { useState, useEffect } from 'react'
import { GraduationCap, Award, BookOpen, Edit2, Save, X, Layers, LogOut } from 'lucide-react'
import { storage, User } from '../utils/storage'
import './Profile.css'

export default function Profile() {
  const [user, setUser] = useState<User | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState('')
  const [editedMajor, setEditedMajor] = useState('')
  const [bgColor, setBgColor] = useState('#ede9fe')
  const [textColor, setTextColor] = useState('#4c1d95')
  const [accentColor, setAccentColor] = useState('#4c1d95')

  useEffect(() => {
    const currentUser = storage.getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
      setEditedName(currentUser.name)
      setEditedMajor(currentUser.major || '')
      if (currentUser.studentCardTheme) {
        setBgColor(currentUser.studentCardTheme.backgroundColor)
        setTextColor(currentUser.studentCardTheme.textColor)
        setAccentColor(currentUser.studentCardTheme.accentColor)
      }
    }
  }, [])

  const handleSave = () => {
    if (!user) return

    const updatedUser: User = {
      ...user,
      name: editedName,
      major: editedMajor,
      studentCardTheme: {
        backgroundColor: bgColor,
        textColor: textColor,
        accentColor: accentColor,
      },
    }

    storage.saveUser(updatedUser)
    setUser(updatedUser)
    setIsEditing(false)
  }

  const handleCancel = () => {
    if (user) {
      setEditedName(user.name)
      setEditedMajor(user.major || '')
      if (user.studentCardTheme) {
        setBgColor(user.studentCardTheme.backgroundColor)
        setTextColor(user.studentCardTheme.textColor)
        setAccentColor(user.studentCardTheme.accentColor)
      }
    }
    setIsEditing(false)
  }

  const handleLogout = () => {
    storage.clearCurrentUser()
    window.location.href = '/landing'
  }

  if (!user) {
    return <div className="profile-page">Loading...</div>
  }

  const decks = storage.getDecks().filter(d => d.userId === user.id)
  const totalCards = decks.reduce((sum, deck) => sum + deck.cards.length, 0)

  return (
    <div className="profile-page">
      <h1>My Profile</h1>

      <div className="profile-content">
        <div className="student-card-container">
          <div
            className="student-card"
            style={{
              background: user.studentCardTheme?.backgroundColor || bgColor,
              color: user.studentCardTheme?.textColor || textColor,
            }}
          >
            <div className="card-header">
              <div 
                className="card-avatar"
                style={{ 
                  background: user.studentCardTheme?.accentColor || accentColor,
                  color: 'white'
                }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="card-info">
                <h2>{user.name}</h2>
                <div className="card-university">
                  <GraduationCap size={18} />
                  <span>{user.university}</span>
                </div>
                {user.major && (
                  <p className="card-major">{user.major}</p>
                )}
              </div>
            </div>
            <div className="card-stats">
              <div className="quick-stat-card">
                <Award size={20} />
                <div>
                  <div className="quick-stat-value">{user.points}</div>
                  <div className="quick-stat-label">Points</div>
                </div>
              </div>
              <div className="quick-stat-card">
                <BookOpen size={20} />
                <div>
                  <div className="quick-stat-value">{decks.length}</div>
                  <div className="quick-stat-label">Decks</div>
                </div>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="card-customization">
              <h3>Customize Card</h3>
              <div className="color-pickers">
                <div className="color-picker-group">
                  <label>Background Color</label>
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                  />
                </div>
                <div className="color-picker-group">
                  <label>Text Color</label>
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                  />
                </div>
                <div className="color-picker-group">
                  <label>Accent Color</label>
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                  />
                </div>
              </div>
              <div className="customization-actions">
                <button className="btn-secondary" onClick={handleCancel}>
                  <X size={18} />
                  Cancel
                </button>
                <button className="btn-primary" onClick={handleSave}>
                  <Save size={18} />
                  Save
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="profile-details">
          <div className="profile-section">
            <div className="section-header">
              <h2>Profile Information</h2>
              {!isEditing && (
                <button
                  className="edit-btn"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 size={18} />
                  Edit
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="edit-form">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Major (optional)</label>
                  <input
                    type="text"
                    value={editedMajor}
                    onChange={(e) => setEditedMajor(e.target.value)}
                    placeholder="e.g., Computer Science"
                  />
                </div>
                <div className="form-group">
                  <label>University</label>
                  <input
                    type="text"
                    value={user.university}
                    disabled
                    className="disabled-input"
                  />
                </div>
              </div>
            ) : (
              <div className="info-grid">
                <div className="info-item">
                  <label>Name</label>
                  <p>{user.name}</p>
                </div>
                <div className="info-item">
                  <label>University</label>
                  <p>{user.university}</p>
                </div>
                {user.major && (
                  <div className="info-item">
                    <label>Major</label>
                    <p>{user.major}</p>
                  </div>
                )}
                <div className="info-item">
                  <label>Member Since</label>
                  <p>{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            )}
          </div>

          <div className="profile-section">
            <h2>Statistics</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <Award className="stat-icon" />
                <div className="stat-value-large">{user.points}</div>
                <div className="stat-label">Total Points</div>
              </div>
              <div className="stat-card">
                <BookOpen className="stat-icon" />
                <div className="stat-value-large">{decks.length}</div>
                <div className="stat-label">Flashcard Decks</div>
              </div>
              <div className="stat-card">
                <Layers className="stat-icon" />
                <div className="stat-value-large">{totalCards}</div>
                <div className="stat-label">Total Cards</div>
              </div>
            </div>
          </div>

          <div className="profile-section logout-section">
            <button className="btn-logout" onClick={handleLogout}>
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
