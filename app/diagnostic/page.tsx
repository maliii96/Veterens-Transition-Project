'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import AppNav from '@/components/AppNav'
import UpgradeModal from '@/components/UpgradeModal'

interface Issue {
  category: string
  severity: 'critical' | 'moderate' | 'minor'
  finding: string
  fix: string
}

interface Diagnostic {
  overallScore: number
  verdict: string
  issues: Issue[]
  missingKeywords: string[]
  strongPoints: string[]
  quickWins: string[]
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#ff6b6b',
  moderate: '#ffaa00',
  minor: '#8b949e',
}

export default function DiagnosticPage() {
  const router = useRouter()
  const [diagnostic, setDiagnostic] = useState<Diagnostic | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [upgradeInfo, setUpgradeInfo] = useState({ current: 0, limit: 0 })

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/login')
    })
  }, [router])

  const runDiagnostic = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const response = await fetch('/api/diagnostic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.upgrade) {
          setUpgradeInfo({ current: data.current, limit: data.limit })
          setShowUpgrade(true)
          return
        }
        throw new Error(data.error || data.message || 'Failed to run diagnostic')
      }

      setDiagnostic(data.diagnostic)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return '#00ff88'
    if (score >= 5) return '#ffaa00'
    return '#ff6b6b'
  }

  return (
    <div className="min-h-screen" style={{ background: '#0a0e14' }}>
      {/* Grid Background */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'linear-gradient(#1e2530 1px, transparent 1px), linear-gradient(90deg, #1e2530 1px, transparent 1px)',
        backgroundSize: '50px 50px', opacity: 0.3, pointerEvents: 'none', zIndex: 0
      }} />

      <AppNav current="/diagnostic" />

      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        feature="diagnostic"
        currentUsage={upgradeInfo.current}
        limit={upgradeInfo.limit}
      />

      <div className="page-content">
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 className="page-heading" style={{ fontSize: '1.75rem', fontWeight: 700, color: '#e6edf3', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            Zero Callback Diagnostic
          </h1>
          <p style={{ color: '#8b949e', fontSize: '0.9rem' }}>
            Find out why you&apos;re not getting interview callbacks — AI analyzes your resume like a senior recruiter
          </p>
        </div>

        {error && (
          <div style={{ marginBottom: '1.5rem', background: '#2d1515', border: '1px solid #5c2626', color: '#ff6b6b', padding: '1rem 1.5rem', borderRadius: '8px' }}>
            {error}
          </div>
        )}

        {!diagnostic ? (
          /* CTA */
          <div style={{
            background: '#151921', border: '1px solid #1e2530', borderRadius: '8px',
            padding: '4rem 2rem', textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <h2 style={{ color: '#e6edf3', fontWeight: 600, marginBottom: '0.75rem', fontSize: '1.5rem' }}>
              Diagnose Your Application
            </h2>
            <p style={{ color: '#8b949e', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem', lineHeight: '1.6' }}>
              AI will analyze your resume against your target role and identify positioning issues, keyword gaps, weak experience framing, and role mismatches that may be preventing callbacks.
            </p>
            <button
              onClick={runDiagnostic}
              disabled={loading}
              style={{
                padding: '1rem 2.5rem',
                borderRadius: '6px',
                fontWeight: 600,
                background: loading ? '#1e2530' : 'linear-gradient(135deg, #ff6b6b, #ff8e53)',
                border: 'none',
                color: loading ? '#6e7681' : '#0a0e14',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '1rem'
              }}
            >
              {loading ? 'Analyzing Resume...' : 'Run Diagnostic'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Score & Verdict */}
            <div className="score-verdict" style={{
              background: '#151921', border: '1px solid #1e2530', borderRadius: '8px',
              padding: '2rem', display: 'flex', gap: '2rem', alignItems: 'center'
            }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%',
                background: `${getScoreColor(diagnostic.overallScore)}15`,
                border: `3px solid ${getScoreColor(diagnostic.overallScore)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
              }}>
                <span style={{ color: getScoreColor(diagnostic.overallScore), fontSize: '2rem', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
                  {diagnostic.overallScore}
                </span>
              </div>
              <div>
                <p style={{ color: '#8b949e', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  Competitiveness Score
                </p>
                <p style={{ color: '#e6edf3', fontSize: '1.1rem', lineHeight: '1.5' }}>
                  {diagnostic.verdict}
                </p>
              </div>
            </div>

            {/* Issues */}
            <div style={{ background: '#151921', border: '1px solid #1e2530', borderRadius: '8px', padding: '1.5rem' }}>
              <h3 style={{ color: '#ff6b6b', fontWeight: 600, marginBottom: '1rem', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Issues Found ({diagnostic.issues.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {diagnostic.issues.map((issue, i) => (
                  <div key={i} style={{
                    background: '#0d1117', border: '1px solid #1e2530', borderRadius: '6px',
                    padding: '1.25rem', borderLeft: `3px solid ${SEVERITY_COLORS[issue.severity]}`
                  }}>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{
                        background: `${SEVERITY_COLORS[issue.severity]}20`,
                        color: SEVERITY_COLORS[issue.severity],
                        padding: '0.2rem 0.6rem', borderRadius: '4px',
                        fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase'
                      }}>
                        {issue.severity}
                      </span>
                      <span style={{ color: '#e6edf3', fontWeight: 600, fontSize: '0.9rem' }}>
                        {issue.category}
                      </span>
                    </div>
                    <p style={{ color: '#8b949e', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '0.75rem' }}>
                      {issue.finding}
                    </p>
                    <div style={{ background: '#151921', padding: '0.75rem 1rem', borderRadius: '4px' }}>
                      <p style={{ color: '#00ff88', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Fix:</p>
                      <p style={{ color: '#8b949e', fontSize: '0.85rem', lineHeight: '1.5' }}>{issue.fix}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Missing Keywords & Strong Points */}
            <div className="two-col-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ background: '#151921', border: '1px solid #1e2530', borderRadius: '8px', padding: '1.5rem' }}>
                <h3 style={{ color: '#ffaa00', fontWeight: 600, marginBottom: '1rem', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Missing Keywords
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {diagnostic.missingKeywords.map((kw, i) => (
                    <span key={i} style={{
                      background: '#ffaa0015', border: '1px solid #ffaa0040',
                      color: '#ffaa00', padding: '0.3rem 0.75rem', borderRadius: '20px',
                      fontSize: '0.85rem'
                    }}>
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ background: '#151921', border: '1px solid #1e2530', borderRadius: '8px', padding: '1.5rem' }}>
                <h3 style={{ color: '#00ff88', fontWeight: 600, marginBottom: '1rem', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Strong Points
                </h3>
                <ul style={{ listStyleType: 'disc', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {diagnostic.strongPoints.map((point, i) => (
                    <li key={i} style={{ color: '#8b949e', fontSize: '0.9rem', lineHeight: '1.5' }}>{point}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Quick Wins */}
            <div style={{ background: '#151921', border: '1px solid #1e2530', borderRadius: '8px', padding: '1.5rem' }}>
              <h3 style={{ color: '#00aaff', fontWeight: 600, marginBottom: '1rem', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Quick Wins — Do These First
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {diagnostic.quickWins.map((win, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <span style={{ color: '#00aaff', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', flexShrink: 0 }}>
                      {i + 1}.
                    </span>
                    <span style={{ color: '#8b949e', fontSize: '0.9rem', lineHeight: '1.5' }}>{win}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Run Again */}
            <div style={{ textAlign: 'center', paddingTop: '1rem' }}>
              <button
                onClick={runDiagnostic}
                disabled={loading}
                style={{
                  padding: '0.75rem 2rem',
                  borderRadius: '6px',
                  fontWeight: 600,
                  background: 'transparent',
                  border: '1px solid #1e2530',
                  color: '#8b949e',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                {loading ? 'Analyzing...' : 'Run Again'}
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .page-content {
            padding: 1rem !important;
          }
          .page-heading {
            font-size: 1.25rem !important;
          }
          .score-verdict {
            flex-direction: column !important;
            text-align: center !important;
            gap: 1rem !important;
          }
          .two-col-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
