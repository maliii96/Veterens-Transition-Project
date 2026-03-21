'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import UpgradeModal from '@/components/UpgradeModal'
import AppNav from '@/components/AppNav'

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
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [upgradeInfo, setUpgradeInfo] = useState({ current: 0, limit: 0 })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/login')
    })
  }, [router])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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

      if (data.upgrade) {
        setUpgradeInfo({ current: data.current, limit: data.limit })
        setShowUpgrade(true)
        return
      }

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
    <div className="min-h-screen" style={{ background: '#060A12' }}>
      {/* Grid Background */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'linear-gradient(rgba(251,191,36,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(251,191,36,0.03) 1px, transparent 1px)',
        backgroundSize: '60px 60px', pointerEvents: 'none', zIndex: 0
      }} />

      <AppNav current="/chat" />

      <div className="page-content" style={{ maxWidth: '900px', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 73px)' }}>
        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#F8FAFC', fontFamily: 'var(--font-space-grotesk), sans-serif', marginBottom: '0.25rem' }}>
            Transition Advisor
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>
            AI-powered career guidance using your profile and military background
          </p>
        </div>

        {/* Chat Area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {messages.length === 0 && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
              {/* Amber diamond logo icon */}
              <div style={{
                width: '48px',
                height: '48px',
                background: '#FBBF24',
                transform: 'rotate(45deg)',
                borderRadius: '6px',
              }} />
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: '#F8FAFC', fontWeight: 600, marginBottom: '0.5rem' }}>Ask me anything about your transition</p>
                <p style={{ color: '#64748B', fontSize: '0.875rem' }}>I have your profile context and can give personalized guidance</p>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', maxWidth: '600px' }}>
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: 'transparent',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '20px',
                      color: '#94A3B8',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(251,191,36,0.4)'
                      e.currentTarget.style.color = '#FBBF24'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                      e.currentTarget.style.color = '#94A3B8'
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
                  ? '#FBBF24'
                  : 'rgba(255,255,255,0.05)',
                border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.08)',
                color: msg.role === 'user' ? '#000' : '#F8FAFC',
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
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#94A3B8',
                fontSize: '0.95rem'
              }}>
                Analyzing...
              </div>
            </div>
          )}

          {error && (
            <div style={{
              padding: '0.75rem 1rem',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '6px',
              color: '#FCA5A5',
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
              background: '#0A0F1A',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#F8FAFC',
              fontSize: '0.95rem',
              outline: 'none'
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(251,191,36,0.5)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            style={{
              padding: '0.875rem 1.5rem',
              borderRadius: '8px',
              fontWeight: 600,
              background: !input.trim() || loading ? 'rgba(255,255,255,0.06)' : '#FBBF24',
              border: 'none',
              color: !input.trim() || loading ? '#64748B' : '#000',
              cursor: !input.trim() || loading ? 'not-allowed' : 'pointer',
              fontSize: '0.95rem',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s'
            }}
          >
            Send
          </button>
        </form>
      </div>

      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        feature="chat"
        currentUsage={upgradeInfo.current}
        limit={upgradeInfo.limit}
      />
    </div>
  )
}
