import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import './Layout.css'

interface LayoutProps {
  children: React.ReactNode
  setIsAuthenticated?: (auth: boolean) => void
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const handleAddDeck = () => {
    navigate('/flashcards')
    // Scroll to upload section will be handled by Flashcards component
  }

  return (
    <div className={`layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar
        onAddDeck={handleAddDeck}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
      />
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}
