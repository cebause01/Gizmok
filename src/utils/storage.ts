export interface Flashcard {
  id: string
  front: string
  back: string
  difficulty: 'easy' | 'medium' | 'hard'
  lastReviewed?: number
  nextReview?: number
}

export interface FlashcardDeck {
  id: string
  name: string
  description: string
  cards: Flashcard[]
  createdAt: number
  updatedAt: number
  userId: string
  pdfSource?: string
  isAIGenerated?: boolean
  isPublic?: boolean
  subject?: string
}

export interface Note {
  id: string
  title: string
  content: string
  handwriting?: string // Base64 encoded canvas data
  template: 'blank' | 'lined' | 'grid' | 'dotted' | 'cornell' | 'music' | 'graph-small' | 'graph-large' | 'todo' | 'wide-ruled' | 'narrow-ruled'
  createdAt: number
  updatedAt: number
  userId: string
  isBookmarked?: boolean
}

export interface User {
  id: string
  email: string
  name: string
  university: string
  major?: string
  profileImage?: string
  points: number
  studentCardTheme?: {
    backgroundColor: string
    textColor: string
    accentColor: string
  }
  createdAt: number
}

export interface Quiz {
  id: string
  deckId: string
  questions: QuizQuestion[]
  createdAt: number
  userId: string
  startedAt?: number
  completedAt?: number
  currentQuestionIndex?: number
  answers?: { questionId: string; selectedAnswer: number }[]
  score?: number
}

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  points: number
}

export interface LeaderboardEntry {
  userId: string
  userName: string
  university: string
  points: number
  rank: number
}

export interface FileItem {
  id: string
  name: string
  type: 'pdf' | 'pptx' | 'xlsx' | 'note' | 'deck' | 'other'
  mimeType: string
  data: string // Base64 encoded file data or reference
  size: number
  parentId?: string // Folder ID if inside a folder
  userId: string
  createdAt: number
  updatedAt: number
  noteId?: string // If type is 'note', reference to note
  deckId?: string // If type is 'deck', reference to deck
}

export interface Folder {
  id: string
  name: string
  parentId?: string // For nested folders
  userId: string
  createdAt: number
  updatedAt: number
}

const STORAGE_KEYS = {
  DECKS: 'gizmok_decks',
  NOTES: 'gizmok_notes',
  USERS: 'gizmok_users',
  CURRENT_USER: 'gizmok_current_user',
  QUIZZES: 'gizmok_quizzes',
  LEADERBOARD: 'gizmok_leaderboard',
  FILES: 'gizmok_files',
  FOLDERS: 'gizmok_folders',
}

export const storage = {
  // Flashcard Decks
  getDecks: (userId?: string): FlashcardDeck[] => {
    const data = localStorage.getItem(STORAGE_KEYS.DECKS)
    const decks = data ? JSON.parse(data) : []
    if (userId) {
      return decks.filter((d: FlashcardDeck) => d.userId === userId)
    }
    return decks
  },

  saveDeck: (deck: FlashcardDeck): void => {
    const decks = storage.getDecks() // Get all decks
    const index = decks.findIndex(d => d.id === deck.id)
    if (index >= 0) {
      decks[index] = deck
    } else {
      decks.push(deck)
    }
    localStorage.setItem(STORAGE_KEYS.DECKS, JSON.stringify(decks))
  },

  deleteDeck: (deckId: string): void => {
    const decks = storage.getDecks() // Get all decks
    const filtered = decks.filter(d => d.id !== deckId)
    localStorage.setItem(STORAGE_KEYS.DECKS, JSON.stringify(filtered))
  },

  // Notes
  getNotes: (userId?: string): Note[] => {
    const data = localStorage.getItem(STORAGE_KEYS.NOTES)
    const notes = data ? JSON.parse(data) : []
    if (userId) {
      return notes.filter((n: Note) => n.userId === userId)
    }
    return notes
  },

  saveNote: (note: Note): void => {
    const notes = storage.getNotes() // Get all notes
    const index = notes.findIndex(n => n.id === note.id)
    if (index >= 0) {
      notes[index] = note
    } else {
      notes.push(note)
    }
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes))
  },

  deleteNote: (noteId: string): void => {
    const notes = storage.getNotes() // Get all notes
    const filtered = notes.filter(n => n.id !== noteId)
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(filtered))
  },

  getNote: (noteId: string): Note | undefined => {
    const notes = storage.getNotes() // Get all notes
    return notes.find(n => n.id === noteId)
  },

  // Users
  getUsers: (): User[] => {
    const data = localStorage.getItem(STORAGE_KEYS.USERS)
    return data ? JSON.parse(data) : []
  },

  saveUser: (user: User): void => {
    const users = storage.getUsers()
    const index = users.findIndex(u => u.id === user.id)
    if (index >= 0) {
      users[index] = user
    } else {
      users.push(user)
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
    // Update leaderboard
    storage.updateLeaderboard()
  },

  getCurrentUser: (): User | null => {
    const userId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER)
    if (!userId) return null
    const users = storage.getUsers()
    return users.find(u => u.id === userId) || null
  },

  setCurrentUser: (userId: string | null): void => {
    if (userId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, userId)
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
    }
  },

  clearCurrentUser: (): void => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
  },

  addPoints: (userId: string, points: number): void => {
    const users = storage.getUsers()
    const user = users.find(u => u.id === userId)
    if (user) {
      user.points += points
      storage.saveUser(user)
    }
  },

  // Leaderboard
  getLeaderboard: (university?: string): LeaderboardEntry[] => {
    const data = localStorage.getItem(STORAGE_KEYS.LEADERBOARD)
    let entries: LeaderboardEntry[] = data ? JSON.parse(data) : []
    
    if (university) {
      entries = entries.filter(e => e.university === university)
    }
    
    return entries.sort((a, b) => b.points - a.points)
  },

  updateLeaderboard: (): void => {
    const users = storage.getUsers()
    const entries: LeaderboardEntry[] = users.map(user => ({
      userId: user.id,
      userName: user.name,
      university: user.university,
      points: user.points,
      rank: 0, // Will be calculated
    }))
    
    // Sort and assign ranks
    entries.sort((a, b) => b.points - a.points)
    entries.forEach((entry, index) => {
      entry.rank = index + 1
    })
    
    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(entries))
  },

  // Quizzes
  getQuizzes: (): Quiz[] => {
    const data = localStorage.getItem(STORAGE_KEYS.QUIZZES)
    return data ? JSON.parse(data) : []
  },

  saveQuiz: (quiz: Quiz): void => {
    const quizzes = storage.getQuizzes()
    const index = quizzes.findIndex(q => q.id === quiz.id)
    if (index >= 0) {
      quizzes[index] = quiz
    } else {
      quizzes.push(quiz)
    }
    localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(quizzes))
  },

  getQuiz: (quizId: string): Quiz | undefined => {
    const quizzes = storage.getQuizzes()
    return quizzes.find(q => q.id === quizId)
  },

  getPublicDecks: (): FlashcardDeck[] => {
    return storage.getDecks().filter(d => d.isPublic === true)
  },

  getPublicQuizzes: (): Quiz[] => {
    return storage.getQuizzes().filter(q => q.userId === 'public')
  },

  initializePublicDecks: (): void => {
    const existingDecks = storage.getDecks()
    const hasPublicDecks = existingDecks.some(d => d.isPublic === true)
    
    if (!hasPublicDecks) {
      // Import and initialize public decks
      import('./publicDecks').then(({ generatePublicDecks, generatePublicQuizzes }) => {
        const publicDecks = generatePublicDecks()
        const publicQuizzes = generatePublicQuizzes(publicDecks)
        
        // Save decks
        publicDecks.forEach(deck => {
          storage.saveDeck(deck)
        })
        
        // Save quizzes
        publicQuizzes.forEach(quiz => {
          storage.saveQuiz(quiz)
        })
      })
    }
  },

  // Files
  getFiles: (userId?: string, parentId?: string): FileItem[] => {
    const data = localStorage.getItem(STORAGE_KEYS.FILES)
    const files = data ? JSON.parse(data) : []
    let filtered = files
    if (userId) {
      filtered = filtered.filter((f: FileItem) => f.userId === userId)
    }
    // Filter by parentId if provided (including undefined for root)
    // Use a special check: if parentId is explicitly undefined when userId is provided,
    // or if both are provided, filter. Otherwise return all.
    // For display purposes, parentId is always provided (undefined for root, string for folder)
    // For internal operations, use direct localStorage access
    if (parentId !== undefined || (userId && parentId === undefined)) {
      // parentId filtering was requested
      if (parentId === undefined) {
        // Root: show files with no parentId
        filtered = filtered.filter((f: FileItem) => f.parentId === undefined)
      } else {
        // Specific folder: show files with matching parentId
        filtered = filtered.filter((f: FileItem) => f.parentId === parentId)
      }
    }
    return filtered
  },

  saveFile: (file: FileItem): void => {
    // Get all files directly from localStorage (don't use getFiles which filters)
    const data = localStorage.getItem(STORAGE_KEYS.FILES)
    const files = data ? JSON.parse(data) : []
    const index = files.findIndex((f: FileItem) => f.id === file.id)
    if (index >= 0) {
      files[index] = file
    } else {
      files.push(file)
    }
    localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(files))
  },

  deleteFile: (fileId: string): void => {
    // Get all files directly from localStorage (don't use getFiles which filters)
    const data = localStorage.getItem(STORAGE_KEYS.FILES)
    const files = data ? JSON.parse(data) : []
    const filtered = files.filter((f: FileItem) => f.id !== fileId)
    localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(filtered))
  },

  getFile: (fileId: string): FileItem | undefined => {
    // Get all files directly from localStorage (don't use getFiles which filters)
    const data = localStorage.getItem(STORAGE_KEYS.FILES)
    const files = data ? JSON.parse(data) : []
    return files.find((f: FileItem) => f.id === fileId)
  },

  // Folders
  getFolders: (userId?: string, parentId?: string): Folder[] => {
    const data = localStorage.getItem(STORAGE_KEYS.FOLDERS)
    const folders = data ? JSON.parse(data) : []
    let filtered = folders
    if (userId) {
      filtered = filtered.filter((f: Folder) => f.userId === userId)
    }
    // Filter by parentId - if undefined, show folders with undefined parentId (root)
    // if defined, show folders with that specific parentId
    filtered = filtered.filter((f: Folder) => {
      if (parentId === undefined) {
        // Root: show folders with no parentId
        return f.parentId === undefined
      } else {
        // Specific folder: show folders with matching parentId
        return f.parentId === parentId
      }
    })
    return filtered
  },

  saveFolder: (folder: Folder): void => {
    const folders = storage.getFolders()
    const index = folders.findIndex(f => f.id === folder.id)
    if (index >= 0) {
      folders[index] = folder
    } else {
      folders.push(folder)
    }
    localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(folders))
  },

  deleteFolder: (folderId: string): void => {
    // Get all folders directly from localStorage (don't use getFolders which filters)
    const data = localStorage.getItem(STORAGE_KEYS.FOLDERS)
    const folders = data ? JSON.parse(data) : []
    // Also delete child folders and files
    const childFolders = storage.getFolders(undefined, folderId)
    childFolders.forEach(cf => storage.deleteFolder(cf.id))
    const childFiles = storage.getFiles(undefined, folderId)
    childFiles.forEach(cf => storage.deleteFile(cf.id))
    const filtered = folders.filter((f: Folder) => f.id !== folderId)
    localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(filtered))
  },

  getFolder: (folderId: string): Folder | undefined => {
    // Get all folders directly from localStorage (don't use getFolders which filters)
    const data = localStorage.getItem(STORAGE_KEYS.FOLDERS)
    const folders = data ? JSON.parse(data) : []
    return folders.find((f: Folder) => f.id === folderId)
  },
}

// Initialize leaderboard if it doesn't exist
if (!localStorage.getItem(STORAGE_KEYS.LEADERBOARD)) {
  storage.updateLeaderboard()
}
