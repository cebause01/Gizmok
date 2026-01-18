# Gizmok - AI-Powered Learning Platform

A modern, dark-themed web application combining Gizmo-style flashcard learning with GoodNotes-inspired digital note-taking, powered by AI.

## Features

### 🔐 Authentication & User Profiles
- User sign up and login system
- University selection during registration
- Customizable student card/profile
- User-specific data isolation

### 🤖 AI-Powered Learning
- **PDF Upload**: Upload PDF documents to automatically generate flashcards
- **AI Flashcard Generation**: AI extracts key concepts from PDFs and creates flashcards
- **AI Quiz Generation**: Automatically generate quiz questions from PDF content
- Smart content extraction and question formation

### 📚 Flashcards (Like Gizmo)
- AI-generated flashcard decks from PDFs
- Create and manage custom flashcard decks
- Study mode with card flipping animations
- Spaced repetition system with difficulty ratings
- Progress tracking during study sessions
- Quiz mode for interactive learning

### ✍️ Digital Notes (Like GoodNotes)
- Handwritten notes with canvas drawing
- Multiple paper templates: Blank, Lined, Grid, Dotted
- Text typing support alongside drawings
- Pen tool with customizable colors and sizes
- Eraser tool for corrections
- Export notes as PNG images
- Organized note management

### 🏆 Gamification & Leaderboards
- **Points System**: Earn points for correct quiz answers
- **University Leaderboard**: Compete with students from your university
- **Rankings**: See your position and track your progress
- **Achievements**: Visual badges and trophies for top performers

### 🎨 Modern Dark Theme
- Beautiful dark UI with gradient accents
- Smooth animations and transitions
- Responsive design for all devices
- Modern card-based layouts

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Navigation
- **Lucide React** - Icons
- **LocalStorage** - Data persistence

## Usage

### Getting Started

1. **Sign Up**: Create an account and select your university
2. **Upload PDF**: Go to "Upload PDF" to create AI-generated flashcards
3. **Study**: Use flashcard study mode or take quizzes to earn points
4. **Take Notes**: Create handwritten or typed notes with templates
5. **Compete**: Check the leaderboard to see your university rankings

### Creating AI-Generated Flashcards

1. Navigate to "Upload PDF" in the navigation
2. Select a PDF file from your device
3. Click "Generate Flashcards & Quiz"
4. Wait for AI to process and generate content
5. Edit the generated flashcards if needed
6. Start studying or take a quiz

### Taking Notes

1. Navigate to "Notes" in the navigation
2. Click "New Note" to create a note
3. Use the pen tool to draw/write
4. Switch to text mode to type
5. Choose from different paper templates (Blank, Lined, Grid, Dotted)
6. Customize pen colors and sizes
7. Save your note when done

### Earning Points

- Take quizzes from your flashcard decks
- Answer questions correctly to earn points (10 points per correct answer)
- View your points on your profile card
- Compete on the university leaderboard

## Future Enhancements

- PDF import and annotation
- Handwriting recognition (OCR)
- Audio recording synced to notes
- Cloud sync
- Collaboration features
- AI-powered study assistance
- Math equation recognition
- Templates marketplace

## License

MIT
