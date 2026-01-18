import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Home from './pages/Home'
import Flashcards from './pages/Flashcards'
import DeckEditor from './pages/DeckEditor'
import Notes from './pages/Notes'
import StudyMode from './pages/StudyMode'
import NoteEditor from './pages/NoteEditor'
import Profile from './pages/Profile'
import Leaderboard from './pages/Leaderboard'
import QuizMode from './pages/QuizMode'
import Progress from './pages/Progress'
import PublicDecks from './pages/PublicDecks'
import { storage } from './utils/storage'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = storage.getCurrentUser()
    setIsAuthenticated(!!user)
    // Initialize public decks on app load
    storage.initializePublicDecks()
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#0a0a0f',
        color: '#fff'
      }}>
        Loading...
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/landing" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        
        {/* Protected routes */}
        {isAuthenticated ? (
          <>
            <Route path="/" element={
              <Layout setIsAuthenticated={setIsAuthenticated}>
                <Home />
              </Layout>
            } />
            <Route path="/flashcards" element={
              <Layout setIsAuthenticated={setIsAuthenticated}>
                <Flashcards />
              </Layout>
            } />
            <Route path="/flashcards/study/:deckId" element={
              <Layout setIsAuthenticated={setIsAuthenticated}>
                <StudyMode />
              </Layout>
            } />
            <Route path="/flashcards/edit/:deckId" element={
              <Layout setIsAuthenticated={setIsAuthenticated}>
                <DeckEditor />
              </Layout>
            } />
            <Route path="/flashcards/quiz/:deckId" element={
              <Layout setIsAuthenticated={setIsAuthenticated}>
                <QuizMode />
              </Layout>
            } />
            <Route path="/notes" element={
              <Layout setIsAuthenticated={setIsAuthenticated}>
                <Notes />
              </Layout>
            } />
            <Route path="/notes/new" element={
              <Layout setIsAuthenticated={setIsAuthenticated}>
                <NoteEditor />
              </Layout>
            } />
            <Route path="/notes/edit/:noteId" element={
              <Layout setIsAuthenticated={setIsAuthenticated}>
                <NoteEditor />
              </Layout>
            } />
            <Route path="/profile" element={
              <Layout setIsAuthenticated={setIsAuthenticated}>
                <Profile />
              </Layout>
            } />
            <Route path="/leaderboard" element={
              <Layout setIsAuthenticated={setIsAuthenticated}>
                <Leaderboard />
              </Layout>
            } />
            <Route path="/progress" element={
              <Layout setIsAuthenticated={setIsAuthenticated}>
                <Progress />
              </Layout>
            } />
            <Route path="/public-decks" element={
              <Layout setIsAuthenticated={setIsAuthenticated}>
                <PublicDecks />
              </Layout>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/landing" replace />} />
        )}
      </Routes>
    </BrowserRouter>
  )
}

export default App
