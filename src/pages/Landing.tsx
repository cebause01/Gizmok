import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, TrendingUp, Users, Upload, BookOpen, Zap, 
  FileText, Calendar, Search, GraduationCap, Brain,
  ClipboardList, Bell, Send } from 'lucide-react'
import './Landing.css'

export default function Landing() {
  const [formSubmitted, setFormSubmitted] = useState(false)

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormSubmitted(true)
    setTimeout(() => setFormSubmitted(false), 3000)
  }

  return (
    <div className="landing-page">
      {/* SVG Gradient Definitions */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="icon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#667eea" />
            <stop offset="50%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#764ba2" />
          </linearGradient>
        </defs>
      </svg>

      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-container">
          <Link to="/landing" className="nav-brand">
            <img src="/logo.png" alt="Gizmok" className="brand-logo" />
          </Link>
          <div className="nav-links">
            <Link to="/auth" className="nav-link-btn secondary">Login</Link>
            <Link to="/auth" className="nav-link-btn primary">Start learning</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-grid">
            <div className="hero-content">
              <h1 className="hero-title">Gizmok</h1>
              <p className="hero-subtitle">
                Gizmok is a student-friendly and mobile-centric learning solution. 
                AI-powered flashcards and study tools that make learning easy and effective.
              </p>
              <div className="hero-buttons">
                <Link to="/auth" className="cta-button primary-btn">Get Started</Link>
                <Link to="/auth" className="cta-button secondary-btn">Learn More</Link>
              </div>
            </div>
            <div className="hero-preview">
              <div className="preview-frame">
                <div className="preview-header">
                  <div className="preview-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
                <img 
                  src="/dashboard-preview.png" 
                  alt="Gizmok Dashboard" 
                  className="preview-image"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Student-Teacher Synergy */}
      <section className="synergy-section">
        <div className="container">
          <h2 className="synergy-title">Student-Teacher Synergy</h2>
          <p className="synergy-description">
            Gizmok provides a seamless way for students to collaborate with teachers, 
            share study materials, track progress, and get personalized feedback. 
            Empower your learning journey.
          </p>
        </div>
      </section>

      {/* For Students Section */}
      <section className="for-section">
        <div className="container">
          <div className="for-header">
            <h2 className="for-label">For Student</h2>
            <p className="for-intro">Gizmok is the FIRST ever student-friendly and mobile-centric learning solution.</p>
          </div>
          
          <h3 className="for-title">Gizmok can help you</h3>
          
          <div className="feature-cards">
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <Sparkles className="feature-icon" />
              </div>
              <h3>Empower.</h3>
              <p className="feature-description">
                Gizmok lets students communicate with teachers, submit assignments, 
                receive reminders and track study progress.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <GraduationCap className="feature-icon" />
              </div>
              <h3>Educate.</h3>
              <p className="feature-description">
                Gizmok app aims to educate students by giving them knowledge and 
                information about everything they need to know for effective learning.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <Zap className="feature-icon" />
              </div>
              <h3>Easy.</h3>
              <p className="feature-description">
                Gizmok app provides a fast, easy, and free way of keeping track of 
                all the information required to help manage your studies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* For Teachers Section */}
      <section className="for-section for-teachers">
        <div className="container">
          <div className="for-header">
            <h2 className="for-label">For Teacher</h2>
            <p className="for-intro">Easy-Monitoring, high-performing.</p>
          </div>
          
          <h3 className="for-title">Gizmok can help you</h3>
          
          <div className="feature-cards">
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <TrendingUp className="feature-icon" />
              </div>
              <h3>Live-Tracking</h3>
              <p className="feature-description">
                Real-time data input by students
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <Brain className="feature-icon" />
              </div>
              <h3>AI-Powered</h3>
              <p className="feature-description">
                Advanced AI integration for better student management
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <Users className="feature-icon" />
              </div>
              <h3>Effortless</h3>
              <p className="feature-description">
                Minimal input from teachers
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section className="modules-section">
        <div className="container">
          <h2 className="section-title">Holistic Learning & Study Management</h2>
          <p className="section-subtitle">
            Gizmok offers a complete solution for student care, study management, 
            progress tracking, and education while enabling teachers to monitor student 
            progress and key learning indicators for better outcomes.
          </p>
          
          <div className="modules-grid">
            <div className="module-item">
              <div className="module-icon-wrapper">
                <Upload className="module-icon" />
              </div>
              <h4>PDF to Flashcards</h4>
              <p>Import PDF documents and automatically convert them into study flashcards.</p>
            </div>

            <div className="module-item">
              <div className="module-icon-wrapper">
                <TrendingUp className="module-icon" />
              </div>
              <h4>Dashboard</h4>
              <p>A smart user experience focusing on activities based on time of day and previous activity status.</p>
            </div>

            <div className="module-item">
              <div className="module-icon-wrapper">
                <Calendar className="module-icon" />
              </div>
              <h4>Study Schedule</h4>
              <p>Keep track of your study sessions and book study time. Stay informed on your learning schedule.</p>
            </div>

            <div className="module-item">
              <div className="module-icon-wrapper">
                <Search className="module-icon" />
              </div>
              <h4>Search Decks</h4>
              <p>An assistant which helps you search for study decks, simply enter the deck name or topic.</p>
            </div>

            <div className="module-item">
              <div className="module-icon-wrapper">
                <BookOpen className="module-icon" />
              </div>
              <h4>Study Guide</h4>
              <p>Gizmok app is created to educate students about effective learning, with information on study techniques and their benefits.</p>
            </div>

            <div className="module-item">
              <div className="module-icon-wrapper">
                <Users className="module-icon" />
              </div>
              <h4>My Students</h4>
              <p>An easier way for teachers to find student progress history with features including Study Report, Assessment, Profile and Progress Record.</p>
            </div>

            <div className="module-item">
              <div className="module-icon-wrapper">
                <ClipboardList className="module-icon" />
              </div>
              <h4>Study Plan</h4>
              <p>Gizmok app helps teachers easily create study plans, so students can manage ongoing learning without missing important topics.</p>
            </div>

            <div className="module-item">
              <div className="module-icon-wrapper">
                <FileText className="module-icon" />
              </div>
              <h4>My Study Portfolio</h4>
              <p>Provides student reports and progress records categorized under Study Sessions, Tests, Notes, and Achievements.</p>
            </div>

            <div className="module-item">
              <div className="module-icon-wrapper">
                <Bell className="module-icon" />
              </div>
              <h4>My Notifications</h4>
              <p>Gizmok will notify any log activities that take place when you are studying or have an upcoming session.</p>
            </div>
          </div>
        </div>
      </section>


      {/* Contact Section */}
      <section className="contact-section">
        <div className="container">
          <h2 className="section-title">Contact Us</h2>
          <p className="contact-subtitle">
            Have a question, comment, or concern? Fill out the form below and we'll get back to you as soon as possible.
          </p>
          {formSubmitted ? (
            <div className="form-success">
              <p>Thank you for your message! We'll get back to you soon.</p>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleContactSubmit}>
              <div className="form-group">
                <input type="text" placeholder="Name" className="form-input" required />
              </div>
              <div className="form-group">
                <input type="email" placeholder="Email" className="form-input" required />
              </div>
              <div className="form-group">
                <textarea placeholder="Message" className="form-textarea" rows={5} required></textarea>
              </div>
              <button type="submit" className="form-submit-btn">
                <Send className="submit-icon" />
                Submit
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>Features</h4>
              <ul>
                <li><Link to="/auth">Flashcard Maker</Link></li>
                <li><Link to="/auth">PDF to Flashcards</Link></li>
                <li><Link to="/auth">Study Notes</Link></li>
                <li><Link to="/auth">Quiz Mode</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Get Started</h4>
              <ul>
                <li><Link to="/auth">Sign Up</Link></li>
                <li><Link to="/auth">Login</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Contact</h4>
              <ul>
                <li><a href="mailto:support@gizmok.com">support@gizmok.com</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 Gizmok. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
