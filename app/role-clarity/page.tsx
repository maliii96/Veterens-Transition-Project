'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import UpgradeModal from '@/components/UpgradeModal'
import AppNav from '@/components/AppNav'
import { Target, AlertTriangle, TrendingUp, ChevronRight } from 'lucide-react'

interface TopRole {
  title: string
  fitScore: number
  salaryRange: string
  whyFit: string
  searchTerms: string[]
  topEmployers: string[]
}

interface AvoidRole {
  title: string
  reason: string
}

interface RoleClarity {
  summary: string
  topRoles: TopRole[]
  avoidRoles: AvoidRole[]
  skillGaps: string[]
  focusStatement: string
}

export default function RoleClarityPage() {
  const router = useRouter()
  const [roleClarity, setRoleClarity] = useState<RoleClarity | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [upgradeInfo, setUpgradeInfo] = useState({ current: 0, limit: 0 })

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/login')
    })
  }, [router])

  const analyzeRoles = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const response = await fetch('/api/role-clarity', {
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
        throw new Error(data.error || data.message || 'Failed to analyze roles')
      }

      setRoleClarity(data.roleClarity)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getFitColor = (score: number) => {
    if (score >= 8) return '#FBBF24'
    if (score >= 6) return '#60A5FA'
    if (score >= 4) return '#F59E0B'
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
        feature="role_clarity"
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
            Target Role Clarity
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', lineHeight: '1.6' }}>
            AI identifies the most realistic civilian job titles for your military background
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

        {!roleClarity ? (
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
              <Target size={28} style={{ color: '#FBBF24' }} />
            </div>
            <h2 style={{
              color: '#F1F5F9', fontWeight: 600, marginBottom: '0.75rem', fontSize: '1.5rem',
              fontFamily: 'var(--font-space-grotesk), sans-serif'
            }}>
              Find Your Target Roles
            </h2>
            <p style={{ color: '#94A3B8', maxWidth: '500px', margin: '0 auto 2rem', lineHeight: '1.7', fontSize: '0.95rem' }}>
              Based on your MOS, clearance, skills, and experience, AI will identify the best civilian job titles to target — and which ones to avoid wasting time on.
            </p>
            <button
              onClick={analyzeRoles}
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
              {loading ? 'Analyzing Your Background...' : 'Find My Roles'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Focus Statement */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(96,165,250,0.08), rgba(167,139,250,0.08))',
              border: '1px solid rgba(96,165,250,0.2)',
              borderRadius: '14px',
              padding: '1.25rem 1.5rem',
              display: 'flex', gap: '1rem', alignItems: 'flex-start'
            }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'rgba(96,165,250,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px'
              }}>
                <Target size={16} style={{ color: '#60A5FA' }} />
              </div>
              <div>
                <p style={{ color: '#60A5FA', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>
                  Your Focus Statement
                </p>
                <p style={{ color: '#F1F5F9', fontSize: '0.95rem', lineHeight: '1.6' }}>{roleClarity.focusStatement}</p>
              </div>
            </div>

            {/* Summary */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '14px',
              padding: '1.5rem'
            }}>
              <p style={{ color: '#94A3B8', lineHeight: '1.75', fontSize: '0.95rem' }}>{roleClarity.summary}</p>
            </div>

            {/* Top Roles */}
            <div>
              <h3 style={{
                color: '#60A5FA', fontWeight: 600, marginBottom: '1rem',
                fontFamily: 'var(--font-space-grotesk), sans-serif',
                fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em',
                display: 'flex', alignItems: 'center', gap: '0.4rem'
              }}>
                <TrendingUp size={14} />
                Target These Roles
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {roleClarity.topRoles.map((role, i) => (
                  <div key={i} style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '14px',
                    padding: '1.5rem',
                    transition: 'border-color 0.15s ease'
                  }}>
                    <div className="role-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem' }}>
                      <div>
                        <h4 style={{
                          color: '#F1F5F9', fontWeight: 600, fontSize: '1.05rem', marginBottom: '0.25rem',
                          fontFamily: 'var(--font-space-grotesk), sans-serif'
                        }}>
                          {role.title}
                        </h4>
                        <p style={{ color: '#64748B', fontSize: '0.82rem' }}>{role.salaryRange}</p>
                      </div>
                      <div style={{
                        background: `${getFitColor(role.fitScore)}15`,
                        border: `2px solid ${getFitColor(role.fitScore)}`,
                        borderRadius: '50%', width: '48px', height: '48px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                      }}>
                        <span style={{
                          color: getFitColor(role.fitScore), fontWeight: 700,
                          fontFamily: 'var(--font-space-grotesk), sans-serif', fontSize: '0.95rem'
                        }}>
                          {role.fitScore}
                        </span>
                      </div>
                    </div>

                    {/* Fit score bar */}
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{
                        height: '4px', background: 'rgba(255,255,255,0.06)',
                        borderRadius: '2px', overflow: 'hidden'
                      }}>
                        <div style={{
                          height: '100%', width: `${role.fitScore * 10}%`,
                          background: getFitColor(role.fitScore),
                          borderRadius: '2px',
                          transition: 'width 0.4s ease'
                        }} />
                      </div>
                    </div>

                    <p style={{ color: '#94A3B8', fontSize: '0.875rem', lineHeight: '1.6', marginBottom: '1.25rem' }}>
                      {role.whyFit}
                    </p>
                    <div className="tags-row" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                      <div>
                        <p style={{ color: '#64748B', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Search Terms</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                          {role.searchTerms.map((term, j) => (
                            <span key={j} style={{
                              background: 'rgba(96,165,250,0.1)',
                              border: '1px solid rgba(96,165,250,0.2)',
                              color: '#60A5FA',
                              padding: '0.2rem 0.6rem', borderRadius: '6px',
                              fontSize: '0.78rem'
                            }}>
                              {term}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p style={{ color: '#64748B', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Top Employers</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                          {role.topEmployers.map((emp, j) => (
                            <span key={j} style={{
                              background: 'rgba(167,139,250,0.1)',
                              border: '1px solid rgba(167,139,250,0.2)',
                              color: '#A78BFA',
                              padding: '0.2rem 0.6rem', borderRadius: '6px',
                              fontSize: '0.78rem'
                            }}>
                              {emp}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Avoid Roles & Skill Gaps */}
            <div className="two-col-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '14px',
                padding: '1.5rem'
              }}>
                <h3 style={{
                  color: '#EF4444', fontWeight: 600, marginBottom: '1rem',
                  fontFamily: 'var(--font-space-grotesk), sans-serif',
                  fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em',
                  display: 'flex', alignItems: 'center', gap: '0.4rem'
                }}>
                  <AlertTriangle size={13} />
                  Avoid These Roles
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  {roleClarity.avoidRoles.map((role, i) => (
                    <div key={i} style={{
                      paddingBottom: i < roleClarity.avoidRoles.length - 1 ? '0.875rem' : 0,
                      borderBottom: i < roleClarity.avoidRoles.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none'
                    }}>
                      <p style={{ color: '#F1F5F9', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                        {role.title}
                      </p>
                      <p style={{ color: '#94A3B8', fontSize: '0.825rem', lineHeight: '1.5' }}>{role.reason}</p>
                    </div>
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
                  color: '#F59E0B', fontWeight: 600, marginBottom: '1rem',
                  fontFamily: 'var(--font-space-grotesk), sans-serif',
                  fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em'
                }}>
                  Skill Gaps to Close
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {roleClarity.skillGaps.map((gap, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                      <span style={{ color: '#F59E0B', flexShrink: 0, marginTop: '3px' }}>
                        <ChevronRight size={13} />
                      </span>
                      <span style={{ color: '#94A3B8', fontSize: '0.875rem', lineHeight: '1.6' }}>{gap}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Run Again */}
            <div style={{ textAlign: 'center', paddingTop: '0.5rem' }}>
              <button
                onClick={analyzeRoles}
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
          .two-col-grid {
            grid-template-columns: 1fr !important;
          }
          .tags-row {
            flex-direction: column !important;
            gap: 1rem !important;
          }
          .role-header {
            flex-direction: column !important;
            gap: 0.75rem !important;
          }
        }
      `}</style>
    </div>
  )
}
