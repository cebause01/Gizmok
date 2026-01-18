import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Lock, User as UserIcon, GraduationCap, Search, ChevronDown, ArrowLeft } from 'lucide-react'
import { storage, User } from '../utils/storage'
import './Auth.css'

const MALAYSIAN_UNIVERSITIES = [
  // Public Universities
  'Universiti Malaya (UM)',
  'Universiti Kebangsaan Malaysia (UKM)',
  'Universiti Putra Malaysia (UPM)',
  'Universiti Sains Malaysia (USM)',
  'Universiti Teknologi Malaysia (UTM)',
  'Universiti Teknologi MARA (UiTM)',
  'Universiti Islam Antarabangsa Malaysia (UIAM)',
  'Universiti Utara Malaysia (UUM)',
  'Universiti Malaysia Sarawak (UNIMAS)',
  'Universiti Malaysia Sabah (UMS)',
  'Universiti Pendidikan Sultan Idris (UPSI)',
  'Universiti Sains Islam Malaysia (USIM)',
  'Universiti Teknikal Malaysia Melaka (UTeM)',
  'Universiti Malaysia Terengganu (UMT)',
  'Universiti Tun Hussein Onn Malaysia (UTHM)',
  'Universiti Malaysia Pahang Al-Sultan Abdullah (UMPSA)',
  'Universiti Malaysia Perlis (UniMAP)',
  'Universiti Malaysia Kelantan (UMK)',
  'Universiti Sultan Zainal Abidin (UniSZA)',
  'Universiti Pertahanan Nasional Malaysia (UPNM)',
  // Private Universities
  'Taylor\'s University',
  'Sunway University',
  'Monash University Malaysia',
  'University of Nottingham Malaysia',
  'Heriot-Watt University Malaysia',
  'UCSI University',
  'Asia Pacific University (APU)',
  'Multimedia University (MMU)',
  'HELP University',
  'INTI International University',
  'SEGi University',
  'Limkokwing University',
  'Management and Science University (MSU)',
  'Universiti Tunku Abdul Rahman (UTAR)',
  'Tunku Abdul Rahman University of Management and Technology (TAR UMT)',
  'Xiamen University Malaysia',
  'University of Reading Malaysia',
  'Curtin University Malaysia',
  'Swinburne University of Technology Sarawak',
  'Newcastle University Medicine Malaysia',
  'International Medical University (IMU)',
  'Perdana University',
  'MAHSA University',
  'Manipal International University',
  'Quest International University',
  'AIMST University',
  'Universiti Tenaga Nasional (UNITEN)',
  'Universiti Kuala Lumpur (UniKL)',
  'Binary University',
  'Nilai University',
  // Colleges
  'Kolej Universiti Tunku Abdul Rahman',
  'Kolej MDIS Malaysia',
  'Raffles University',
]

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [university, setUniversity] = useState('')
  const [customUniversity, setCustomUniversity] = useState('')
  const [showUniversityDropdown, setShowUniversityDropdown] = useState(false)
  const [universitySearch, setUniversitySearch] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Filter universities based on search
  const filteredUniversities = MALAYSIAN_UNIVERSITIES.filter(uni =>
    uni.toLowerCase().includes(universitySearch.toLowerCase())
  )

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUniversityDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleUniversitySelect = (uni: string) => {
    setUniversity(uni)
    setUniversitySearch('')
    setShowUniversityDropdown(false)
    if (uni !== 'Others') {
      setCustomUniversity('')
    }
  }

  const getActualUniversity = () => {
    return university === 'Others' ? customUniversity : university
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (isLogin) {
      // Login
      const users = storage.getUsers()
      const user = users.find(u => u.email === email)
      
      if (!user || user.email !== email) {
        setError('Invalid email or password')
        setLoading(false)
        return
      }

      storage.setCurrentUser(user.id)
      // Reload to trigger authentication check
      window.location.href = '/'
    } else {
      // Sign up
      const actualUniversity = getActualUniversity()
      if (!name || !email || !password || !actualUniversity) {
        setError('Please fill in all fields')
        setLoading(false)
        return
      }

      if (university === 'Others' && !customUniversity.trim()) {
        setError('Please enter your university name')
        setLoading(false)
        return
      }

      const users = storage.getUsers()
      if (users.some(u => u.email === email)) {
        setError('Email already registered')
        setLoading(false)
        return
      }

      const newUser: User = {
        id: Date.now().toString(),
        email,
        name,
        university: actualUniversity,
        points: 0,
        studentCardTheme: {
          backgroundColor: '#1a1a2e',
          textColor: '#ffffff',
          accentColor: '#667eea',
        },
        createdAt: Date.now(),
      }

      storage.saveUser(newUser)
      storage.setCurrentUser(newUser.id)
      // Reload to trigger authentication check
      window.location.href = '/'
    }

    setLoading(false)
  }

  return (
    <div className="auth-page">
      <Link to="/landing" className="back-to-landing">
        <ArrowLeft size={18} />
        <span>Back to Home</span>
      </Link>
      
      <div className="auth-container">
        <div className="auth-header">
          <img src="/logo.png" alt="Gizmok" className="auth-logo-img" />
          <p>AI-Powered Learning Platform</p>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(true)}
          >
            Sign In
          </button>
          <button
            className={`auth-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(false)}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <>
              <div className="input-group">
                <span className="input-icon"><UserIcon size={18} /></span>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                />
              </div>
              
              <div className="input-group university-selector" ref={dropdownRef}>
                <span className="input-icon"><GraduationCap size={18} /></span>
                <input
                  type="text"
                  placeholder="Select university..."
                  value={showUniversityDropdown ? universitySearch : (university || '')}
                  onChange={(e) => {
                    setUniversitySearch(e.target.value)
                    setShowUniversityDropdown(true)
                  }}
                  onClick={() => setShowUniversityDropdown(true)}
                  onFocus={() => setShowUniversityDropdown(true)}
                  readOnly={!showUniversityDropdown}
                />
                <ChevronDown size={16} className="dropdown-chevron" />
                
                {showUniversityDropdown && (
                  <div className="university-dropdown">
                    <div className="dropdown-search-header">
                      <Search size={14} />
                      <input
                        type="text"
                        placeholder="Type to search..."
                        value={universitySearch}
                        onChange={(e) => setUniversitySearch(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <div className="dropdown-options">
                      {filteredUniversities.map(uni => (
                        <div
                          key={uni}
                          className={`dropdown-option ${university === uni ? 'selected' : ''}`}
                          onClick={() => handleUniversitySelect(uni)}
                        >
                          {uni}
                        </div>
                      ))}
                      <div
                        className={`dropdown-option others-option ${university === 'Others' ? 'selected' : ''}`}
                        onClick={() => handleUniversitySelect('Others')}
                      >
                        Others (Enter manually)
                      </div>
                      {filteredUniversities.length === 0 && universitySearch && (
                        <div className="dropdown-no-results">
                          No match found. Select "Others" to enter manually.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {university === 'Others' && (
                <div className="input-group">
                  <span className="input-icon"><GraduationCap size={18} /></span>
                  <input
                    type="text"
                    placeholder="Enter your university name"
                    value={customUniversity}
                    onChange={(e) => setCustomUniversity(e.target.value)}
                    required
                  />
                </div>
              )}
            </>
          )}

          <div className="input-group">
            <span className="input-icon"><Mail size={18} /></span>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <span className="input-icon"><Lock size={18} /></span>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  )
}
