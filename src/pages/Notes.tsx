import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Trash2, FileText, FolderPlus, GripVertical } from 'lucide-react'
import { storage, Note, FileItem } from '../utils/storage'
import './Notes.css'

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [draggedNote, setDraggedNote] = useState<string | null>(null)
  const currentUser = storage.getCurrentUser()

  useEffect(() => {
    loadNotes()
  }, [])

  const loadNotes = () => {
    const currentUser = storage.getCurrentUser()
    const userNotes = storage.getNotes(currentUser?.id)
    const sortedNotes = userNotes.sort((a, b) => b.updatedAt - a.updatedAt)
    setNotes(sortedNotes)
  }

  const deleteNote = (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this note?')) {
      storage.deleteNote(noteId)
      // Also delete associated file if exists
      const files = storage.getFiles(currentUser?.id)
      const file = files.find(f => f.noteId === noteId)
      if (file) {
        storage.deleteFile(file.id)
      }
      loadNotes()
    }
  }

  const saveNoteToFiles = (note: Note, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    
    if (!currentUser) return

    // Check if file already exists
    const existingFiles = storage.getFiles(currentUser.id)
    const existingFile = existingFiles.find(f => f.noteId === note.id)
    
    if (existingFile) {
      alert('This note is already saved to My Files')
      return
    }

    // Create file item from note
    const noteData = note.handwriting || note.content || ''
    const fileItem: FileItem = {
      id: `file-note-${note.id}`,
      name: `${note.title || 'Untitled Note'}.note`,
      type: 'note',
      mimeType: 'application/json',
      data: JSON.stringify(note),
      size: noteData.length,
      userId: currentUser.id,
      noteId: note.id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    storage.saveFile(fileItem)
    alert('Note saved to My Files!')
  }

  const handleDragStart = (noteId: string, e: React.DragEvent) => {
    setDraggedNote(noteId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', noteId)
  }

  const handleDragEnd = () => {
    setDraggedNote(null)
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="notes-page">
      <div className="page-header">
        <h1>My Notes</h1>
        <Link to="/notes/new" className="btn-primary">
          <Plus size={20} />
          New Note
        </Link>
      </div>

      {notes.length === 0 ? (
        <div className="empty-state">
          <FileText size={64} className="empty-icon" />
          <h2>No notes yet</h2>
          <p>Create your first note to start writing and drawing!</p>
          <Link to="/notes/new" className="btn-primary">
            Create Your First Note
          </Link>
        </div>
      ) : (
        <div className="notes-grid">
          {notes.map(note => {
            const isInFiles = currentUser && storage.getFiles(currentUser.id).some(f => f.noteId === note.id)
            
            return (
              <div
                key={note.id}
                className={`note-card-wrapper ${draggedNote === note.id ? 'dragging' : ''}`}
                draggable
                onDragStart={(e) => {
                  handleDragStart(note.id, e)
                  e.stopPropagation()
                }}
                onDragEnd={handleDragEnd}
              >
                <Link
                  to={`/notes/edit/${note.id}`}
                  className="note-card"
                  draggable={false}
                  onClick={(e) => {
                    if (draggedNote === note.id) {
                      e.preventDefault()
                    }
                  }}
                >
                  <div className="note-card-header">
                    <div className="drag-handle">
                      <GripVertical size={16} />
                    </div>
                    <h3>{note.title || 'Untitled Note'}</h3>
                    <div className="note-actions">
                      <button
                        className={`icon-button ${isInFiles ? 'saved' : ''}`}
                        onClick={(e) => saveNoteToFiles(note, e)}
                        aria-label="Save to Files"
                        title={isInFiles ? 'Already in My Files' : 'Save to My Files'}
                      >
                        <FolderPlus size={18} />
                      </button>
                      <button
                        className="icon-button danger"
                        onClick={(e) => deleteNote(note.id, e)}
                        aria-label="Delete note"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="note-preview">
                    {note.handwriting ? (
                      <img 
                        src={note.handwriting} 
                        alt="Note preview" 
                        className="handwriting-preview"
                      />
                    ) : (
                      <div className="text-preview">
                        {note.content.substring(0, 150) || 'Empty note...'}
                        {note.content.length > 150 && '...'}
                      </div>
                    )}
                  </div>
                  <div className="note-meta">
                    <span className="template-badge">{note.template}</span>
                    <span className="note-date">{formatDate(note.updatedAt)}</span>
                    {isInFiles && (
                      <span className="saved-badge">In Files</span>
                    )}
                  </div>
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
