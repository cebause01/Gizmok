import { useState, useEffect } from 'react'
import { Trophy, Medal, Award, GraduationCap } from 'lucide-react'
import { storage, LeaderboardEntry } from '../utils/storage'
import './Leaderboard.css'

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [selectedUniversity, setSelectedUniversity] = useState<string>('')
  const [universities, setUniversities] = useState<string[]>([])
  const currentUser = storage.getCurrentUser()

  useEffect(() => {
    loadLeaderboard()
  }, [selectedUniversity])

  const loadLeaderboard = () => {
    const entries = storage.getLeaderboard(selectedUniversity || undefined)
    setLeaderboard(entries)
  }

  useEffect(() => {
    const users = storage.getUsers()
    const uniqueUnis = Array.from(new Set(users.map(u => u.university)))
    setUniversities(uniqueUnis.sort())
    
    if (currentUser && !selectedUniversity) {
      setSelectedUniversity(currentUser.university)
    }
  }, [])

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="rank-icon gold" />
    if (rank === 2) return <Medal className="rank-icon silver" />
    if (rank === 3) return <Award className="rank-icon bronze" />
    return <span className="rank-number">{rank}</span>
  }

  const currentUserEntry = leaderboard.find(e => e.userId === currentUser?.id)

  return (
    <div className="leaderboard-page">
      <div className="leaderboard-header">
        <h1>
          <Trophy className="header-icon" />
          Leaderboard
        </h1>
        <p>Compete with students from your university</p>
      </div>

      <div className="leaderboard-controls">
        <div className="filter-group">
          <label>Filter by University:</label>
          <select
            value={selectedUniversity}
            onChange={(e) => setSelectedUniversity(e.target.value)}
            className="university-select"
          >
            <option value="">All Universities</option>
            {universities.map(uni => (
              <option key={uni} value={uni}>{uni}</option>
            ))}
          </select>
        </div>
      </div>

      {currentUserEntry && (
        <div className="user-rank-card">
          <h3>Your Rank</h3>
          <div className="rank-display">
            {getRankIcon(currentUserEntry.rank)}
            <div className="rank-info">
              <h4>{currentUserEntry.userName}</h4>
              <p>{currentUserEntry.university}</p>
            </div>
            <div className="rank-points">
              <span className="points-value">{currentUserEntry.points}</span>
              <span className="points-label">points</span>
            </div>
          </div>
        </div>
      )}

      <div className="leaderboard-list">
        {leaderboard.length === 0 ? (
          <div className="empty-leaderboard">
            <Trophy size={64} className="empty-icon" />
            <h3>No rankings yet</h3>
            <p>Start studying to earn points and climb the leaderboard!</p>
          </div>
        ) : (
          <>
            {leaderboard.slice(0, 3).map((entry) => (
              <div key={entry.userId} className={`leaderboard-item top-three rank-${entry.rank}`}>
                <div className="item-rank">{getRankIcon(entry.rank)}</div>
                <div className="item-user">
                  <div className="user-avatar">
                    {entry.userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-info">
                    <h4>{entry.userName}</h4>
                    <div className="user-university">
                      <GraduationCap size={14} />
                      <span>{entry.university}</span>
                    </div>
                  </div>
                </div>
                <div className="item-points">
                  <span className="points-badge-large">{entry.points}</span>
                  <span className="points-text">points</span>
                </div>
              </div>
            ))}
            {leaderboard.slice(3).map(entry => (
              <div 
                key={entry.userId} 
                className={`leaderboard-item ${entry.userId === currentUser?.id ? 'current-user' : ''}`}
              >
                <div className="item-rank">{getRankIcon(entry.rank)}</div>
                <div className="item-user">
                  <div className="user-avatar">
                    {entry.userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-info">
                    <h4>{entry.userName}</h4>
                    <div className="user-university">
                      <GraduationCap size={14} />
                      <span>{entry.university}</span>
                    </div>
                  </div>
                </div>
                <div className="item-points">
                  <span className="points-value">{entry.points}</span>
                  <span className="points-label">points</span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
