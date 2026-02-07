// AI service for generating flashcards and quizzes - uses Groq API via /api/ai

export interface PDFContent {
  text: string
  pages: number
}

async function callAI<T>(action: string, text: string, count: number): Promise<T> {
  const res = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, text, count }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || 'AI request failed')
  }

  return res.json()
}

export const aiService = {
  // Extract text from PDF (mock - use PDF.js in future for real extraction)
  extractTextFromPDF: async (_file: File): Promise<PDFContent> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          text: `Sample extracted text from PDF. This is a placeholder.
          In production, you would use PDF.js to extract actual text.
          
          Key concepts from the document:
          - Concept 1: Important definition here
          - Concept 2: Another important point
          - Concept 3: Third key concept
          
          Upload a PDF and add real extraction to see AI-generated flashcards from your content.`,
          pages: 10,
        })
      }, 800)
    })
  },

  generateFlashcards: async (
    text: string,
    count: number = 10
  ): Promise<Array<{ front: string; back: string }>> => {
    return callAI<Array<{ front: string; back: string }>>('flashcards', text, count)
  },

  generateQuiz: async (
    text: string,
    count: number = 5
  ): Promise<Array<{ question: string; options: string[]; correctAnswer: number }>> => {
    return callAI<Array<{ question: string; options: string[]; correctAnswer: number }>>('quiz', text, count)
  },
}
