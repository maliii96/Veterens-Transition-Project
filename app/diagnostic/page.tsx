'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import AppNav from '@/components/AppNav'
import UpgradeModal from '@/components/UpgradeModal'
import { AlertTriangle, CheckCircle, Zap, Search, Target, ChevronRight } from 'lucide-react'

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
  critical: '#EF4444',
  moderate: '#F59E0B',
  minor: '#64748B',
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
    if (score >= 8) return '#FBBF24'
    if (score >= 5) return '#F59E0B'
    return '#EF4444'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#060A12', color: '#F1F5F9', fontFamily: 'var(--font-dm-sans), sans-serif' }}>
      {/* Subtle grid background */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '50px 50px', pointerEvents: 'none', zIndex: 0
      }} />

      <AppNav />

      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        feature="diagnostic"
        currentUsage={upgradeInfo.current}
        limit={upgradeInfo.limit}
      />

      <div className="page-content" style={{ position: 'relative', zIndex: 1, maxWidth: '860px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 className="page-heading" style={{
            fontSize: '1.75rem', fontWeight: 700, color: '#F1F5F9',
            fontFamily: 'var(--font-space-grotesk), sans-serif',
            letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '0.375rem'
          }}>
            Zero Callback Diagnostic
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', lineHeight: '1.6' }}>
            Find out why you&apos;re not getting interview callbacks — AI analyzes your resume like a senior recruiter
          </p>
        </div>

        {error && (
          <div style={{
            marginBottom: '1.5rem',
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.2)',
            color: '#EF4444',
            padding: '1rem 1.5rem',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', gap: '0.75rem'
          }}>
            <AlertTriangle size={16} style={{ flexShrink: 0 }} />
            {error}
          </div>
        )}

        {!diagnostic ? (
          /* CTA */
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '4rem 2rem',
            textAlign: 'center'
          }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '16px',
              background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}>
              <Search size={28} style={{ color: '#FBBF24' }} />
            </div>
            <h2 style={{
              color: '#F1F5F9', fontWeight: 600, marginBottom: '0.75rem', fontSize: '1.5rem',
              fontFamily: 'var(--font-space-grotesk), sans-serif'
            }}>
              Diagnose Your Application
            </h2>
            <p style={{ color: '#94A3B8', maxWidth: '500px', margin: '0 auto 2rem', lineHeight: '1.7', fontSize: '0.95rem' }}>
              AI will analyze your resume against your target role and identify positioning issues, keyword gaps, weak experience framing, and role mismatches that may be preventing callbacks.
            </p>
            <button
              onClick={runDiagnostic}
              disabled={loading}
              style={{
                padding: '0.875rem 2.5rem',
                borderRadius: '10px',
                fontWeight: 600,
                background: loading ? 'rgba(255,255,255,0.06)' : '#FBBF24',
                border: 'none',
                color: loading ? '#64748B' : '#000000',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontFamily: 'var(--font-dm-sans), sans-serif',
                transition: 'background 0.15s ease'
              }}
            >
              {loading ? 'Analyzing Resume...' : 'Run Diagnostic'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Score & Verdict */}
            <div className="score-verdict" style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '14px',
              padding: '2rem',
              display: 'flex', gap: '2rem', alignItems: 'center'
            }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%',
                background: `${getScoreColor(diagnostic.overallScore)}18`,
                border: `2px solid ${getScoreColor(diagnostic.overallScore)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
              }}>
                <span style={{
                  color: getScoreColor(diagnostic.overallScore),
                  fontSize: '2rem', fontWeight: 700,
                  fontFamily: 'var(--font-space-grotesk), sans-serif'
                }}>
                  {diagnostic.overallScore}
                </span>
              </div>
              <div>
                <p style={{ color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
                  Competitiveness Score
                </p>
                <p style={{ color: '#F1F5F9', fontSize: '1.05rem', lineHeight: '1.6' }}>
                  {diagnostic.verdict}
                </p>
              </div>
            </div>

            {/* Issues */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '14px',
              padding: '1.5rem'
            }}>
              <h3 style={{
                color: '#EF4444', fontWeight: 600, marginBottom: '1.25rem',
                fontFamily: 'var(--font-space-grotesk), sans-serif',
                fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em',
                display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}>
                <AlertTriangle size={14} />
                Issues Found ({diagnostic.issues.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {diagnostic.issues.map((issue, i) => (
                  <div key={i} style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '10px',
                    padding: '1.25rem',
                    borderLeft: `3px solid ${SEVERITY_COLORS[issue.severity]}`
                  }}>
                    <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{
                        background: `${SEVERITY_COLORS[issue.severity]}18`,
                        color: SEVERITY_COLORS[issue.severity],
                        padding: '0.2rem 0.6rem', borderRadius: '6px',
                        fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em'
                      }}>
                        {issue.severity}
                      </span>
                      <span style={{ color: '#F1F5F9', fontWeight: 600, fontSize: '0.9rem' }}>
                        {issue.category}
                      </span>
                    </div>
                    <p style={{ color: '#94A3B8', fontSize: '0.875rem', lineHeight: '1.6', marginBottom: '0.875rem' }}>
                      {issue.finding}
                    </p>
                    <div style={{
                      background: 'rgba(251,191,36,0.06)',
                      border: '1px solid rgba(251,191,36,0.15)',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px'
                    }}>
                      <p style={{ color: '#FBBF24', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Fix:</p>
                      <p style={{ color: '#94A3B8', fontSize: '0.85rem', lineHeight: '1.6' }}>{issue.fix}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Missing Keywords & Strong Points */}
            <div className="two-col-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '14px',
                padding: '1.5rem'
              }}>
                <h3 style={{
                  color: '#F59E0B', fontWeight: 600, marginBottom: '1rem',
                  fontFamily: 'var(--font-space-grotesk), sans-serif',
                  fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em'
                }}>
                  Missing Keywords
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {diagnostic.missingKeywords.map((kw, i) => (
                    <span key={i} style={{
                      background: 'rgba(245,158,11,0.1)',
                      border: '1px solid rgba(245,158,11,0.25)',
                      color: '#F59E0B',
                      padding: '0.3rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.82rem'
                    }}>
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '14px',
                padding: '1.5rem'
              }}>
                <h3 style={{
                  color: '#FBBF24', fontWeight: 600, marginBottom: '1rem',
                  fontFamily: 'var(--font-space-grotesk), sans-serif',
                  fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em',
                  display: 'flex', alignItems: 'center', gap: '0.4rem'
                }}>
                  <CheckCircle size={13} />
                  Strong Points
                </h3>
                <ul style={{ listStyleType: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {diagnostic.strongPoints.map((point, i) => (
                    <li key={i} style={{ color: '#94A3B8', fontSize: '0.875rem', lineHeight: '1.6', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                      <span style={{ color: '#FBBF24', marginTop: '0.3rem', flexShrink: 0 }}>
                        <ChevronRight size={12} />
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Quick Wins */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '14px',
              padding: '1.5rem'
            }}>
              <h3 style={{
                color: '#60A5FA', fontWeight: 600, marginBottom: '1.25rem',
                fontFamily: 'var(--font-space-grotesk), sans-serif',
                fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em',
                display: 'flex', alignItems: 'center', gap: '0.4rem'
              }}>
                <Zap size={14} />
                Quick Wins — Do These First
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {diagnostic.quickWins.map((win, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: '1rem', alignItems: 'flex-start',
                    padding: '0.75rem 1rem',
                    background: 'rgba(96,165,250,0.05)',
                    border: '1px solid rgba(96,165,250,0.12)',
                    borderRadius: '8px'
                  }}>
                    <span style={{
                      color: '#60A5FA', fontWeight: 700,
                      fontFamily: 'var(--font-space-grotesk), sans-serif',
                      fontSize: '0.8rem', flexShrink: 0,
                      width: '20px', height: '20px',
                      background: 'rgba(96,165,250,0.12)',
                      borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {i + 1}
                    </span>
                    <span style={{ color: '#94A3B8', fontSize: '0.875rem', lineHeight: '1.6' }}>{win}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Run Again */}
            <div style={{ textAlign: 'center', paddingTop: '0.5rem' }}>
              <button
                onClick={runDiagnostic}
                disabled={loading}
                style={{
                  padding: '0.75rem 2rem',
                  borderRadius: '10px',
                  fontWeight: 600,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#F1F5F9',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '0.9rem',
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                  transition: 'background 0.15s ease, border-color 0.15s ease'
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
