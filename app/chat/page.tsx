'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTED_QUESTIONS = [
  'How do I translate my MOS to a civilian resume?',
  'What salary should I expect with my background?',
  'Should I pursue federal or private sector jobs?',
  'How do I use my GI Bill during transition?',
  'What companies are veteran-friendly in my field?',
]

export default function ChatPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/login')
    })
  }, [router])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return

    const userMessage: Message = { role: 'user', content: text }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          message: text,
          history: messages.map(m => ({ role: m.role, content: m.content })),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response')
      }

      setMessages([...updatedMessages, { role: 'assistant', content: data.reply }])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <div className="min-h-screen" style={{ background: '#0a0e14' }}>
      {/* Grid Background */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'linear-gradient(#1e2530 1px, transparent 1px), linear-gradient(90deg, #1e2530 1px, transparent 1px)',
        backgroundSize: '50px 50px', opacity: 0.3, pointerEvents: 'none', zIndex: 0
      }} />

      {/* Navigation */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(10, 14, 20, 0.95)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #1e2530'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px', height: '40px',
              background: 'linear-gradient(135deg, #00ff88, #00aaff)',
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
            }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: '1.25rem', letterSpacing: '0.05em', color: '#e6edf3' }}>
              SITREP
            </span>
          </div>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <Link href="/dashboard" style={{ color: '#8b949e', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>Dashboard</Link>
            <Link href="/profile" style={{ color: '#8b949e', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>Profile</Link>
            <Link href="/assessment" style={{ color: '#8b949e', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>Assessment</Link>
            <Link href="/chat" style={{ color: '#00ff88', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>Advisor</Link>
            <Link href="/diagnostic" style={{ color: '#8b949e', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>Diagnostic</Link>
            <Link href="/role-clarity" style={{ color: '#8b949e', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>Role Clarity</Link>
            <Link href="/strategy" style={{ color: '#8b949e', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>Strategy</Link>
            <button onClick={handleLogout} style={{
              padding: '0.75rem 1.5rem', borderRadius: '6px', fontWeight: 600,
              background: 'transparent', border: '2px solid #1e2530', color: '#e6edf3',
              cursor: 'pointer', fontSize: '0.95rem'
            }}>Logout</button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 73px)' }}>
        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#e6edf3', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            Transition Advisor
          </h1>
          <p style={{ color: '#8b949e', fontSize: '0.9rem' }}>
            AI-powered career guidance using your profile and military background
          </p>
        </div>

        {/* Chat Area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          background: '#151921',
          border: '1px solid #1e2530',
          borderRadius: '8px',
          padding: '1.5rem',
          marginBottom: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {messages.length === 0 && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
              <div style={{
                width: '60px', height: '60px',
                background: 'linear-gradient(135deg, #00ff88, #00aaff)',
                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
              }} />
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: '#e6edf3', fontWeight: 600, marginBottom: '0.5rem' }}>Ask me anything about your transition</p>
                <p style={{ color: '#6e7681', fontSize: '0.875rem' }}>I have your profile context and can give personalized guidance</p>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', maxWidth: '600px' }}>
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: 'transparent',
                      border: '1px solid #1e2530',
                      borderRadius: '20px',
                      color: '#8b949e',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#00ff88'
                      e.currentTarget.style.color = '#00ff88'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#1e2530'
                      e.currentTarget.style.color = '#8b949e'
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}>
              <div style={{
                maxWidth: '80%',
                padding: '1rem 1.25rem',
                borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                background: msg.role === 'user'
                  ? 'linear-gradient(135deg, #00ff88, #00aaff)'
                  : '#0a0e14',
                border: msg.role === 'user' ? 'none' : '1px solid #1e2530',
                color: msg.role === 'user' ? '#0a0e14' : '#e6edf3',
                fontSize: '0.95rem',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap',
              }}>
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{
                padding: '1rem 1.25rem',
                borderRadius: '12px 12px 12px 4px',
                background: '#0a0e14',
                border: '1px solid #1e2530',
                color: '#6e7681',
                fontSize: '0.95rem'
              }}>
                Analyzing...
              </div>
            </div>
          )}

          {error && (
            <div style={{
              padding: '0.75rem 1rem',
              background: '#2d1515',
              border: '1px solid #5c2626',
              borderRadius: '6px',
              color: '#ff6b6b',
              fontSize: '0.9rem'
            }}>
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.75rem' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your transition, salary, job offers, benefits..."
            disabled={loading}
            style={{
              flex: 1,
              padding: '0.875rem 1rem',
              background: '#151921',
              border: '1px solid #1e2530',
              borderRadius: '6px',
              color: '#e6edf3',
              fontSize: '0.95rem',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            style={{
              padding: '0.875rem 1.5rem',
              borderRadius: '6px',
              fontWeight: 600,
              background: !input.trim() || loading ? '#1e2530' : 'linear-gradient(135deg, #00ff88, #00aaff)',
              border: 'none',
              color: !input.trim() || loading ? '#6e7681' : '#0a0e14',
              cursor: !input.trim() || loading ? 'not-allowed' : 'pointer',
              fontSize: '0.95rem',
              whiteSpace: 'nowrap'
            }}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}
