const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.1-8b-instant'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error: 'GROQ_API_KEY is not configured. Add it in Vercel Project Settings → Environment Variables.',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const body = await req.json()
    const { action, text, count = action === 'flashcards' ? 10 : 5 } = body

    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid text' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'flashcards') {
      const flashcards = await generateFlashcards(apiKey, text, count)
      return new Response(JSON.stringify(flashcards), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'quiz') {
      const quiz = await generateQuiz(apiKey, text, count)
      return new Response(JSON.stringify(quiz), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action. Use "flashcards" or "quiz".' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('AI API error:', err)
    const message =
      err instanceof Error ? err.message : typeof err === 'object' && err && 'message' in err ? String((err as { message: unknown }).message) : 'Failed to generate content'
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function groqChat(apiKey: string, messages: { role: string; content: string }[]): Promise<string> {
  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 1,
      max_completion_tokens: 1024,
      top_p: 1,
      stream: false,
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(errText || `Groq API error: ${res.status}`)
  }

  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> }
  return data.choices?.[0]?.message?.content?.trim() ?? ''
}

async function generateFlashcards(
  apiKey: string,
  text: string,
  count: number
): Promise<Array<{ front: string; back: string }>> {
  const truncatedText = text.slice(0, 12000)
  const content = await groqChat(apiKey, [
    {
      role: 'system',
      content: `You are a helpful study assistant. Generate flashcard pairs from the given text.
Return ONLY a valid JSON array of objects with "front" and "back" keys. No other text.
Example: [{"front":"What is X?","back":"X is..."},{"front":"What is Y?","back":"Y is..."}]`,
    },
    {
      role: 'user',
      content: `From this text, create exactly ${count} flashcards. Each flashcard should have a "front" (question) and "back" (answer). Focus on key concepts, definitions, and important facts.\n\nText:\n${truncatedText}`,
    },
  ])

  const parsed = parseJsonArray(content || '[]')
  return parsed.slice(0, count).map((item: { front?: string; back?: string }) => ({
    front: String(item?.front ?? 'Question'),
    back: String(item?.back ?? 'Answer'),
  }))
}

async function generateQuiz(
  apiKey: string,
  text: string,
  count: number
): Promise<
  Array<{
    question: string
    options: string[]
    correctAnswer: number
  }>
> {
  const truncatedText = text.slice(0, 12000)
  const content = await groqChat(apiKey, [
    {
      role: 'system',
      content: `You are a helpful quiz generator. Generate multiple-choice questions from the given text.
Return ONLY a valid JSON array. Each object must have: "question" (string), "options" (array of 4 strings), "correctAnswer" (number 0-3 for the index of the correct option).
Example: [{"question":"What is X?","options":["A","B","C","D"],"correctAnswer":0}]`,
    },
    {
      role: 'user',
      content: `From this text, create exactly ${count} multiple-choice questions. Each question must have 4 options. Put the correct answer first or indicate its index in correctAnswer.\n\nText:\n${truncatedText}`,
    },
  ])

  const parsed = parseJsonArray(content || '[]')
  return parsed.slice(0, count).map((item: { question?: string; options?: string[]; correctAnswer?: number }) => ({
    question: String(item?.question ?? 'Question'),
    options: Array.isArray(item?.options) ? item.options.map(String) : ['A', 'B', 'C', 'D'],
    correctAnswer: typeof item?.correctAnswer === 'number' ? Math.min(3, Math.max(0, item.correctAnswer)) : 0,
  }))
}

function parseJsonArray(content: string): unknown[] {
  const cleaned = content.replace(/```json?\s*/g, '').replace(/```\s*/g, '').trim()
  try {
    const parsed = JSON.parse(cleaned)
    return Array.isArray(parsed) ? parsed : [parsed]
  } catch {
    return []
  }
}
