import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Plus, RotateCcw, CheckCircle, Folder, FileText, File, 
  Trash2, Upload, ChevronRight,
  FileSpreadsheet, Presentation
} from 'lucide-react'
import { storage, FlashcardDeck, Quiz, FileItem, Folder as FolderType } from '../utils/storage'
import './Home.css'

interface DeckWithStatus extends FlashcardDeck {
  isCompleted?: boolean
  completedQuiz?: Quiz
}

type ViewMode = 'decks' | 'files'

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>('files')
  const [allDecks, setAllDecks] = useState<DeckWithStatus[]>([])
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active')
  const [files, setFiles] = useState<FileItem[]>([])
  const [folders, setFolders] = useState<FolderType[]>([])
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(undefined)
  const [folderPath, setFolderPath] = useState<FolderType[]>([])
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [draggedItem, setDraggedItem] = useState<{type: 'file' | 'folder' | 'note', id: string} | null>(null)
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const currentUser = storage.getCurrentUser()

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 2000)
    return () => clearInterval(interval)
  }, [currentFolderId])

  useEffect(() => {
    // Listen for note drops from Notes page
    const handleDragOver = (e: DragEvent) => {
      if (viewMode === 'files') {
        e.preventDefault()
        setIsDraggingOver(true)
      }
    }

    const handleDragLeave = () => {
      setIsDraggingOver(false)
    }

    const handleWindowDrop = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDraggingOver(false)
      
      const noteId = e.dataTransfer?.getData('text/plain')
      if (noteId && currentUser) {
        const note = storage.getNote(noteId)
        if (note) {
          const existingFiles = storage.getFiles(currentUser.id)
          const existingFile = existingFiles.find(f => f.noteId === note.id)
          
          if (existingFile) {
            existingFile.parentId = currentFolderId
            existingFile.updatedAt = Date.now()
            storage.saveFile(existingFile)
          } else {
            const noteData = note.handwriting || note.content || ''
            const fileItem: FileItem = {
              id: `file-note-${note.id}`,
              name: `${note.title || 'Untitled Note'}.note`,
              type: 'note',
              mimeType: 'application/json',
              data: JSON.stringify(note),
              size: noteData.length,
              parentId: currentFolderId,
              userId: currentUser.id,
              noteId: note.id,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            }
            storage.saveFile(fileItem)
          }
          loadData()
        }
      }
    }

    if (viewMode === 'files') {
      window.addEventListener('dragover', handleDragOver)
      window.addEventListener('dragleave', handleDragLeave)
      window.addEventListener('drop', handleWindowDrop)
      
      return () => {
        window.removeEventListener('dragover', handleDragOver)
        window.removeEventListener('dragleave', handleDragLeave)
        window.removeEventListener('drop', handleWindowDrop)
      }
    }
  }, [viewMode, currentFolderId, currentUser])

  const loadData = () => {
    if (currentUser) {
      // Load decks
      const allUserDecks = storage.getDecks().filter(d => d.userId === currentUser.id)
      const allQuizzes = storage.getQuizzes().filter(q => q.userId === currentUser.id)
      
      const decksWithStatus: DeckWithStatus[] = allUserDecks.map(deck => {
        const completedQuiz = allQuizzes.find(q => q.deckId === deck.id && q.completedAt)
        return {
          ...deck,
          isCompleted: !!completedQuiz,
          completedQuiz,
        }
      })
      setAllDecks(decksWithStatus)

      // Load files and folders
      const userFiles = storage.getFiles(currentUser.id, currentFolderId)
      const userFolders = storage.getFolders(currentUser.id, currentFolderId)
      setFiles(userFiles)
      setFolders(userFolders)

      // Build folder path
      if (currentFolderId) {
        const path: FolderType[] = []
        let current = storage.getFolder(currentFolderId)
        while (current) {
          path.unshift(current)
          current = current.parentId ? storage.getFolder(current.parentId) : undefined
        }
        setFolderPath(path)
      } else {
        setFolderPath([])
      }
    }
  }

  const decks = activeTab === 'completed' 
    ? allDecks.filter(d => d.isCompleted)
    : allDecks.filter(d => !d.isCompleted)

  const handleCreateFolder = () => {
    if (!newFolderName.trim() || !currentUser) return
    
    const folder: FolderType = {
      id: `folder-${Date.now()}`,
      name: newFolderName.trim(),
      parentId: currentFolderId,
      userId: currentUser.id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    
    storage.saveFolder(folder)
    setShowNewFolder(false)
    setNewFolderName('')
    loadData()
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !currentUser) return

    const reader = new FileReader()
    reader.onload = () => {
      const base64Data = reader.result as string
      const fileType = getFileType(file.name)
      
      const fileItem: FileItem = {
        id: `file-${Date.now()}`,
        name: file.name,
        type: fileType,
        mimeType: file.type,
        data: base64Data,
        size: file.size,
        parentId: currentFolderId,
        userId: currentUser.id,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      
      storage.saveFile(fileItem)
      loadData()
    }
    reader.readAsDataURL(file)
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getFileType = (fileName: string): FileItem['type'] => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    if (ext === 'pdf') return 'pdf'
    if (['pptx', 'ppt'].includes(ext || '')) return 'pptx'
    if (['xlsx', 'xls'].includes(ext || '')) return 'xlsx'
    return 'other'
  }

  const handleDragStart = (type: 'file' | 'folder' | 'note', id: string) => {
    setDraggedItem({ type, id })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (targetFolderId: string | undefined) => {
    if (!draggedItem) return
    
    if (draggedItem.type === 'file') {
      const file = storage.getFile(draggedItem.id)
      if (file && file.parentId !== targetFolderId) {
        file.parentId = targetFolderId
        file.updatedAt = Date.now()
        storage.saveFile(file)
        loadData()
      }
    } else if (draggedItem.type === 'folder') {
      const folder = storage.getFolder(draggedItem.id)
      if (folder && folder.parentId !== targetFolderId && folder.id !== targetFolderId) {
        folder.parentId = targetFolderId
        folder.updatedAt = Date.now()
        storage.saveFolder(folder)
        loadData()
      }
    } else if (draggedItem.type === 'note') {
      const note = storage.getNote(draggedItem.id)
      if (note && currentUser) {
        const existingFiles = storage.getFiles(currentUser.id)
        const existingFile = existingFiles.find(f => f.noteId === note.id)
        
        if (existingFile) {
          // Update existing file location
          existingFile.parentId = targetFolderId
          existingFile.updatedAt = Date.now()
          storage.saveFile(existingFile)
        } else {
          // Create new file from note
          const noteData = note.handwriting || note.content || ''
          const fileItem: FileItem = {
            id: `file-note-${note.id}`,
            name: `${note.title || 'Untitled Note'}.note`,
            type: 'note',
            mimeType: 'application/json',
            data: JSON.stringify(note),
            size: noteData.length,
            parentId: targetFolderId,
            userId: currentUser.id,
            noteId: note.id,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }
          storage.saveFile(fileItem)
        }
        loadData()
      }
    }
    
    setDraggedItem(null)
  }

  const handleDeleteFile = (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this file?')) {
      storage.deleteFile(fileId)
      loadData()
    }
  }

  const handleDeleteFolder = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this folder and all its contents?')) {
      storage.deleteFolder(folderId)
      loadData()
    }
  }

  const handleFileClick = (file: FileItem) => {
    if (file.type === 'note' && file.noteId) {
      navigate(`/notes/edit/${file.noteId}`)
    } else if (file.type === 'deck' && file.deckId) {
      navigate(`/flashcards/edit/${file.deckId}`)
    } else {
      // Open file in new window
      const blob = base64ToBlob(file.data, file.mimeType)
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
    }
  }

  const base64ToBlob = (base64: string, mimeType: string): Blob => {
    const byteCharacters = atob(base64.split(',')[1])
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    return new Blob([byteArray], { type: mimeType })
  }

  const getFileIcon = (file: FileItem) => {
    switch (file.type) {
      case 'pdf':
        return <FileText size={24} className="file-icon pdf" />
      case 'pptx':
        return <Presentation size={24} className="file-icon pptx" />
      case 'xlsx':
        return <FileSpreadsheet size={24} className="file-icon xlsx" />
      case 'note':
        return <FileText size={24} className="file-icon note" />
      case 'deck':
        return <FileText size={24} className="file-icon deck" />
      default:
        return <File size={24} className="file-icon" />
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const handleRedoQuiz = (deckId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const allQuizzes = storage.getQuizzes()
    const completedQuizzes = allQuizzes.filter(q => 
      q.deckId === deckId && q.userId === currentUser?.id && q.completedAt
    )
    
    completedQuizzes.forEach(quiz => {
      const updatedQuizzes = allQuizzes.filter(q => q.id !== quiz.id)
      localStorage.setItem('gizmok_quizzes', JSON.stringify(updatedQuizzes))
    })
    
    navigate(`/flashcards/quiz/${deckId}`)
  }

  const getDeckColor = (name: string): string => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#FFD93D', '#6BCF7F']
    const hash = name.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0)
    return colors[hash % colors.length]
  }

  return (
    <div className="home-decks-page">
      <div className="decks-header">
        <h1>My Files</h1>
        <div className="header-actions">
          <div className="view-mode-toggle">
            <button
              className={`view-mode-btn ${viewMode === 'files' ? 'active' : ''}`}
              onClick={() => setViewMode('files')}
            >
              Files
            </button>
            <button
              className={`view-mode-btn ${viewMode === 'decks' ? 'active' : ''}`}
              onClick={() => setViewMode('decks')}
            >
              Decks
            </button>
          </div>
          {viewMode === 'files' ? (
            <>
              <button 
                className="btn-add-deck" 
                onClick={() => setShowNewFolder(true)}
              >
                <Folder size={18} />
                New Folder
              </button>
              <button 
                className="btn-add-deck" 
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={18} />
                Upload File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                accept=".pdf,.pptx,.ppt,.xlsx,.xls"
                style={{ display: 'none' }}
              />
            </>
          ) : (
            <>
              <button className="btn-add-deck" onClick={() => navigate('/flashcards')}>
                <Plus size={18} />
                Add deck
              </button>
              <button className="btn-learn-header" onClick={() => {
                const firstDeck = decks.find(d => d.cards.length > 0)
                if (firstDeck) navigate(`/flashcards/study/${firstDeck.id}`)
                else navigate('/flashcards')
              }}>
                Learn
              </button>
            </>
          )}
        </div>
      </div>

      {viewMode === 'files' ? (
        <>
          {/* Breadcrumb Navigation */}
          {folderPath.length > 0 && (
            <div className="breadcrumb-nav">
              <button 
                className="breadcrumb-item" 
                onClick={() => setCurrentFolderId(undefined)}
              >
                Home
              </button>
              {folderPath.map((folder) => (
                <div key={folder.id} className="breadcrumb-separator">
                  <ChevronRight size={16} />
                  <button
                    className="breadcrumb-item"
                    onClick={() => setCurrentFolderId(folder.id)}
                  >
                    {folder.name}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* New Folder Input */}
          {showNewFolder && (
            <div className="new-folder-input">
              <input
                type="text"
                placeholder="Folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                autoFocus
              />
              <button onClick={handleCreateFolder}>Create</button>
              <button onClick={() => {
                setShowNewFolder(false)
                setNewFolderName('')
              }}>Cancel</button>
            </div>
          )}

          {/* Files and Folders Grid */}
          {(folders.length > 0 || files.length > 0) ? (
            <div className="files-grid">
              {folders.map(folder => (
                <div
                  key={folder.id}
                  className="file-item folder-item"
                  draggable
                  onDragStart={(e) => {
                    handleDragStart('folder', folder.id)
                    e.stopPropagation()
                  }}
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    const noteId = e.dataTransfer?.getData('text/plain')
                    if (noteId && currentUser) {
                      const note = storage.getNote(noteId)
                      if (note) {
                        const existingFiles = storage.getFiles(currentUser.id)
                        const existingFile = existingFiles.find(f => f.noteId === note.id)
                        
                        if (existingFile) {
                          existingFile.parentId = folder.id
                          existingFile.updatedAt = Date.now()
                          storage.saveFile(existingFile)
                        } else {
                          const noteData = note.handwriting || note.content || ''
                          const fileItem: FileItem = {
                            id: `file-note-${note.id}`,
                            name: `${note.title || 'Untitled Note'}.note`,
                            type: 'note',
                            mimeType: 'application/json',
                            data: JSON.stringify(note),
                            size: noteData.length,
                            parentId: folder.id,
                            userId: currentUser.id,
                            noteId: note.id,
                            createdAt: Date.now(),
                            updatedAt: Date.now(),
                          }
                          storage.saveFile(fileItem)
                        }
                        loadData()
                      }
                    } else {
                      handleDrop(folder.id)
                    }
                  }}
                  onClick={() => setCurrentFolderId(folder.id)}
                >
                  <Folder size={48} className="folder-icon" />
                  <div className="file-name">{folder.name}</div>
                  <button
                    className="file-action-btn"
                    onClick={(e) => handleDeleteFolder(folder.id, e)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              
              {files.map(file => (
                <div
                  key={file.id}
                  className="file-item"
                  draggable
                  onDragStart={() => handleDragStart('file', file.id)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(currentFolderId)}
                  onClick={() => handleFileClick(file)}
                >
                  {getFileIcon(file)}
                  <div className="file-name">{file.name}</div>
                  <div className="file-size">{formatFileSize(file.size)}</div>
                  <button
                    className="file-action-btn"
                    onClick={(e) => handleDeleteFile(file.id, e)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-decks">
              <p>No files or folders. Upload files or create a folder to get started!</p>
              <div className="empty-actions">
                <button className="btn-add-deck-empty" onClick={() => setShowNewFolder(true)}>
                  <Folder size={18} />
                  Create Folder
                </button>
                <button className="btn-add-deck-empty" onClick={() => fileInputRef.current?.click()}>
                  <Upload size={18} />
                  Upload File
                </button>
              </div>
            </div>
          )}

          {/* Drop Zone */}
          {(draggedItem || isDraggingOver) && (
            <div
              className="drop-zone"
              onDragOver={(e) => {
                e.preventDefault()
                handleDragOver(e)
              }}
              onDrop={(e) => {
                e.preventDefault()
                e.stopPropagation()
                const noteId = e.dataTransfer?.getData('text/plain')
                if (noteId && currentUser) {
                  const note = storage.getNote(noteId)
                  if (note) {
                    const existingFiles = storage.getFiles(currentUser.id)
                    const existingFile = existingFiles.find(f => f.noteId === note.id)
                    
                    if (existingFile) {
                      existingFile.parentId = currentFolderId
                      existingFile.updatedAt = Date.now()
                      storage.saveFile(existingFile)
                    } else {
                      const noteData = note.handwriting || note.content || ''
                      const fileItem: FileItem = {
                        id: `file-note-${note.id}`,
                        name: `${note.title || 'Untitled Note'}.note`,
                        type: 'note',
                        mimeType: 'application/json',
                        data: JSON.stringify(note),
                        size: noteData.length,
                        parentId: currentFolderId,
                        userId: currentUser.id,
                        noteId: note.id,
                        createdAt: Date.now(),
                        updatedAt: Date.now(),
                      }
                      storage.saveFile(fileItem)
                    }
                    loadData()
                  }
                } else {
                  handleDrop(currentFolderId)
                }
              }}
            >
              Drop here to {draggedItem?.type === 'note' || isDraggingOver ? 'save note to' : 'move to'} {currentFolderId ? 'this folder' : 'root'}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'active' ? 'active' : ''}`}
              onClick={() => setActiveTab('active')}
            >
              Active
            </button>
            <button
              className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
              onClick={() => setActiveTab('completed')}
            >
              Completed
            </button>
          </div>

          {decks.length === 0 ? (
            <div className="empty-decks">
              <p>No decks yet. Add your first deck to get started!</p>
              <button className="btn-add-deck-empty" onClick={() => navigate('/flashcards')}>
                <Plus size={18} />
                Add deck
              </button>
            </div>
          ) : (
            <div className="decks-grid-new">
              {decks.map(deck => (
                <div key={deck.id} className="deck-card-wrapper">
                  <Link to={`/flashcards/edit/${deck.id}`} className="deck-card-new">
                    <div 
                      className="deck-card-color" 
                      style={{ backgroundColor: getDeckColor(deck.name) }}
                    />
                    <div className="deck-card-content">
                      <h3>{deck.name || 'Untitled'}</h3>
                      {deck.isCompleted && (
                        <div className="completed-badge">
                          <CheckCircle size={14} />
                          <span>Completed</span>
                        </div>
                      )}
                    </div>
                  </Link>
                  {deck.isCompleted && (
                    <button
                      className="redo-quiz-btn"
                      onClick={(e) => handleRedoQuiz(deck.id, e)}
                      title="Redo Quiz"
                    >
                      <RotateCcw size={16} />
                      Redo Quiz
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
