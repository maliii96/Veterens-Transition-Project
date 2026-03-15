'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import UpgradeModal from '@/components/UpgradeModal'

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [upgradeInfo, setUpgradeInfo] = useState({ current: 0, limit: 0 })

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/login')
    })
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

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
    if (score >= 8) return '#00ff88'
    if (score >= 6) return '#00aaff'
    if (score >= 4) return '#ffaa00'
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

      {/* Navigation */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(10, 14, 20, 0.95)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #1e2530'
      }}>
        <div className="nav-container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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

          {/* Desktop Navigation */}
          <div className="desktop-nav" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <Link href="/dashboard" style={{ color: '#8b949e', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>Dashboard</Link>
            <Link href="/profile" style={{ color: '#8b949e', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>Profile</Link>
            <Link href="/assessment" style={{ color: '#8b949e', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>Assessment</Link>
            <Link href="/chat" style={{ color: '#8b949e', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>Advisor</Link>
            <Link href="/plan" style={{ color: '#8b949e', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>90-Day Plan</Link>
            <Link href="/diagnostic" style={{ color: '#8b949e', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>Diagnostic</Link>
            <Link href="/role-clarity" style={{ color: '#00aaff', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>Role Clarity</Link>
            <Link href="/strategy" style={{ color: '#8b949e', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>Strategy</Link>
            <button onClick={handleLogout} style={{
              padding: '0.75rem 1.5rem', borderRadius: '6px', fontWeight: 600,
              background: 'transparent', border: '2px solid #1e2530', color: '#e6edf3',
              cursor: 'pointer', fontSize: '0.95rem'
            }}>Logout</button>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'none', flexDirection: 'column', gap: '4px',
              background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem'
            }}
          >
            <div style={{ width: '24px', height: '2px', background: '#e6edf3' }} />
            <div style={{ width: '24px', height: '2px', background: '#e6edf3' }} />
            <div style={{ width: '24px', height: '2px', background: '#e6edf3' }} />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="mobile-menu" style={{
            display: 'none', flexDirection: 'column', gap: '0.5rem',
            padding: '1rem 2rem', background: '#0a0e14', borderTop: '1px solid #1e2530'
          }}>
            <Link href="/dashboard" style={{ color: '#8b949e', textDecoration: 'none', fontWeight: 500, padding: '0.75rem 0' }}>Dashboard</Link>
            <Link href="/profile" style={{ color: '#8b949e', textDecoration: 'none', fontWeight: 500, padding: '0.75rem 0' }}>Profile</Link>
            <Link href="/assessment" style={{ color: '#8b949e', textDecoration: 'none', fontWeight: 500, padding: '0.75rem 0' }}>Assessment</Link>
            <Link href="/chat" style={{ color: '#8b949e', textDecoration: 'none', fontWeight: 500, padding: '0.75rem 0' }}>Advisor</Link>
            <Link href="/plan" style={{ color: '#8b949e', textDecoration: 'none', fontWeight: 500, padding: '0.75rem 0' }}>90-Day Plan</Link>
            <Link href="/diagnostic" style={{ color: '#8b949e', textDecoration: 'none', fontWeight: 500, padding: '0.75rem 0' }}>Diagnostic</Link>
            <Link href="/role-clarity" style={{ color: '#00aaff', textDecoration: 'none', fontWeight: 500, padding: '0.75rem 0' }}>Role Clarity</Link>
            <Link href="/strategy" style={{ color: '#8b949e', textDecoration: 'none', fontWeight: 500, padding: '0.75rem 0' }}>Strategy</Link>
            <button onClick={handleLogout} style={{
              padding: '0.75rem', borderRadius: '6px', fontWeight: 600,
              background: 'transparent', border: '2px solid #1e2530', color: '#e6edf3',
              cursor: 'pointer', marginTop: '0.5rem', width: '100%'
            }}>Logout</button>
          </div>
        )}
      </nav>

      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        feature="role_clarity"
        currentUsage={upgradeInfo.current}
        limit={upgradeInfo.limit}
      />

      <div className="page-content" style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 className="page-heading" style={{ fontSize: '1.75rem', fontWeight: 700, color: '#e6edf3', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            Target Role Clarity
          </h1>
          <p style={{ color: '#8b949e', fontSize: '0.9rem' }}>
            AI identifies the most realistic civilian job titles for your military background
          </p>
        </div>

        {error && (
          <div style={{ marginBottom: '1.5rem', background: '#2d1515', border: '1px solid #5c2626', color: '#ff6b6b', padding: '1rem 1.5rem', borderRadius: '8px' }}>
            {error}
          </div>
        )}

        {!roleClarity ? (
          /* CTA */
          <div style={{
            background: '#151921', border: '1px solid #1e2530', borderRadius: '8px',
            padding: '4rem 2rem', textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
            <h2 style={{ color: '#e6edf3', fontWeight: 600, marginBottom: '0.75rem', fontSize: '1.5rem' }}>
              Find Your Target Roles
            </h2>
            <p style={{ color: '#8b949e', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem', lineHeight: '1.6' }}>
              Based on your MOS, clearance, skills, and experience, AI will identify the best civilian job titles to target — and which ones to avoid wasting time on.
            </p>
            <button
              onClick={analyzeRoles}
              disabled={loading}
              style={{
                padding: '1rem 2.5rem',
                borderRadius: '6px',
                fontWeight: 600,
                background: loading ? '#1e2530' : 'linear-gradient(135deg, #00aaff, #a78bfa)',
                border: 'none',
                color: loading ? '#6e7681' : '#0a0e14',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '1rem'
              }}
            >
              {loading ? 'Analyzing Your Background...' : 'Find My Roles'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Focus Statement */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(0,170,255,0.15), rgba(167,139,250,0.15))',
              border: '1px solid rgba(0,170,255,0.3)',
              borderRadius: '8px',
              padding: '1.25rem 1.5rem',
              display: 'flex', gap: '1rem', alignItems: 'flex-start'
            }}>
              <span style={{ fontSize: '1.25rem' }}>🎯</span>
              <div>
                <p style={{ color: '#00aaff', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                  Your Focus Statement
                </p>
                <p style={{ color: '#e6edf3', fontSize: '0.95rem' }}>{roleClarity.focusStatement}</p>
              </div>
            </div>

            {/* Summary */}
            <div style={{ background: '#151921', border: '1px solid #1e2530', borderRadius: '8px', padding: '1.5rem' }}>
              <p style={{ color: '#8b949e', lineHeight: '1.7', fontSize: '0.95rem' }}>{roleClarity.summary}</p>
            </div>

            {/* Top Roles */}
            <div>
              <h3 style={{ color: '#00aaff', fontWeight: 600, marginBottom: '1rem', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Target These Roles
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {roleClarity.topRoles.map((role, i) => (
                  <div key={i} style={{
                    background: '#151921', border: '1px solid #1e2530', borderRadius: '8px',
                    padding: '1.5rem'
                  }}>
                    <div className="role-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div>
                        <h4 style={{ color: '#e6edf3', fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                          {role.title}
                        </h4>
                        <p style={{ color: '#8b949e', fontSize: '0.85rem' }}>{role.salaryRange}</p>
                      </div>
                      <div style={{
                        background: `${getFitColor(role.fitScore)}15`,
                        border: `2px solid ${getFitColor(role.fitScore)}`,
                        borderRadius: '50%', width: '48px', height: '48px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                      }}>
                        <span style={{ color: getFitColor(role.fitScore), fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
                          {role.fitScore}
                        </span>
                      </div>
                    </div>
                    <p style={{ color: '#8b949e', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '1rem' }}>
                      {role.whyFit}
                    </p>
                    <div className="tags-row" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                      <div>
                        <p style={{ color: '#6e7681', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Search Terms</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                          {role.searchTerms.map((term, j) => (
                            <span key={j} style={{
                              background: '#00aaff15', border: '1px solid #00aaff40',
                              color: '#00aaff', padding: '0.2rem 0.6rem', borderRadius: '4px',
                              fontSize: '0.8rem'
                            }}>
                              {term}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p style={{ color: '#6e7681', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Top Employers</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                          {role.topEmployers.map((emp, j) => (
                            <span key={j} style={{
                              background: '#a78bfa15', border: '1px solid #a78bfa40',
                              color: '#a78bfa', padding: '0.2rem 0.6rem', borderRadius: '4px',
                              fontSize: '0.8rem'
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
            <div className="two-col-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ background: '#151921', border: '1px solid #1e2530', borderRadius: '8px', padding: '1.5rem' }}>
                <h3 style={{ color: '#ff6b6b', fontWeight: 600, marginBottom: '1rem', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Avoid These Roles
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {roleClarity.avoidRoles.map((role, i) => (
                    <div key={i}>
                      <p style={{ color: '#e6edf3', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                        {role.title}
                      </p>
                      <p style={{ color: '#8b949e', fontSize: '0.85rem', lineHeight: '1.4' }}>{role.reason}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: '#151921', border: '1px solid #1e2530', borderRadius: '8px', padding: '1.5rem' }}>
                <h3 style={{ color: '#ffaa00', fontWeight: 600, marginBottom: '1rem', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Skill Gaps to Close
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {roleClarity.skillGaps.map((gap, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                      <span style={{ color: '#ffaa00', fontWeight: 700, flexShrink: 0 }}>→</span>
                      <span style={{ color: '#8b949e', fontSize: '0.9rem', lineHeight: '1.5' }}>{gap}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Run Again */}
            <div style={{ textAlign: 'center', paddingTop: '1rem' }}>
              <button
                onClick={analyzeRoles}
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
          .nav-container {
            padding: 1rem !important;
          }
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-btn {
            display: flex !important;
          }
          .mobile-menu {
            display: flex !important;
          }
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
        }
      `}</style>
    </div>
  )
}
