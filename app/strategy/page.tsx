'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import UpgradeModal from '@/components/UpgradeModal'

interface PriorityTier {
  tier: string
  description: string
  customizationLevel: string
  exampleRoles: string[]
}

interface PlatformStrategy {
  platform: string
  approach: string
  timePerWeek: string
}

interface Strategy {
  summary: string
  weeklyTargets: {
    applicationsPerWeek: number
    networkingContactsPerWeek: number
    followUpsPerWeek: number
  }
  priorityTiers: PriorityTier[]
  weeklySchedule: Record<string, string>
  platformStrategy: PlatformStrategy[]
  trackingFramework: {
    columns: string[]
    instructions: string
  }
  urgencyNote: string
}

const DAY_LABELS: Record<string, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  weekend: 'Weekend',
}

const TIER_COLORS = ['#00ff88', '#00aaff', '#ffaa00']

export default function StrategyPage() {
  const router = useRouter()
  const [strategy, setStrategy] = useState<Strategy | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPro, setIsPro] = useState<boolean | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [upgradeInfo, setUpgradeInfo] = useState({ current: 0, limit: 0 })

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/login')
        return
      }
      // Check subscription tier
      supabase.from('profiles').select('subscription_tier').eq('id', user.id).single()
        .then(({ data }) => {
          setIsPro(data?.subscription_tier === 'pro')
        })
    })
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const buildStrategy = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const response = await fetch('/api/strategy', {
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
        throw new Error(data.error || data.message || 'Failed to build strategy')
      }

      setStrategy(data.strategy)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
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
            <Link href="/role-clarity" style={{ color: '#8b949e', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>Role Clarity</Link>
            <Link href="/strategy" style={{ color: '#a78bfa', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>Strategy</Link>
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
            <Link href="/role-clarity" style={{ color: '#8b949e', textDecoration: 'none', fontWeight: 500, padding: '0.75rem 0' }}>Role Clarity</Link>
            <Link href="/strategy" style={{ color: '#a78bfa', textDecoration: 'none', fontWeight: 500, padding: '0.75rem 0' }}>Strategy</Link>
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
        feature="strategy"
        currentUsage={upgradeInfo.current}
        limit={upgradeInfo.limit}
      />

      <div className="page-content" style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
            <h1 className="page-heading" style={{ fontSize: '1.75rem', fontWeight: 700, color: '#e6edf3', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Application Strategy
            </h1>
            <span style={{
              background: 'linear-gradient(135deg, #a78bfa, #00aaff)',
              color: '#0a0e14', padding: '0.2rem 0.6rem', borderRadius: '4px',
              fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em'
            }}>
              PRO
            </span>
          </div>
          <p style={{ color: '#8b949e', fontSize: '0.9rem' }}>
            AI builds a structured weekly job application game plan tailored to your goals
          </p>
        </div>

        {error && (
          <div style={{ marginBottom: '1.5rem', background: '#2d1515', border: '1px solid #5c2626', color: '#ff6b6b', padding: '1rem 1.5rem', borderRadius: '8px' }}>
            {error}
          </div>
        )}

        {/* Pro Gate */}
        {isPro === false && !strategy ? (
          <div style={{
            background: '#151921', border: '1px solid #1e2530', borderRadius: '8px',
            padding: '4rem 2rem', textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
            <h2 style={{ color: '#e6edf3', fontWeight: 600, marginBottom: '0.75rem', fontSize: '1.5rem' }}>
              Pro Feature
            </h2>
            <p style={{ color: '#8b949e', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem', lineHeight: '1.6' }}>
              The Application Strategy Builder is exclusive to Pro subscribers. Get a personalized weekly game plan with priority tiers, daily schedules, and platform-specific strategies.
            </p>
            <Link href="/pricing" style={{
              display: 'inline-block',
              padding: '1rem 2.5rem',
              borderRadius: '6px',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #a78bfa, #00aaff)',
              color: '#0a0e14',
              textDecoration: 'none',
              fontSize: '1rem'
            }}>
              Upgrade to Pro — $15/mo
            </Link>
          </div>
        ) : !strategy ? (
          /* CTA for Pro users */
          <div style={{
            background: '#151921', border: '1px solid #1e2530', borderRadius: '8px',
            padding: '4rem 2rem', textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
            <h2 style={{ color: '#e6edf3', fontWeight: 600, marginBottom: '0.75rem', fontSize: '1.5rem' }}>
              Build Your Application Strategy
            </h2>
            <p style={{ color: '#8b949e', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem', lineHeight: '1.6' }}>
              AI will create a structured weekly job application plan — how many roles to apply to, how to prioritize and customize applications, and a daily schedule to stay on track.
            </p>
            <button
              onClick={buildStrategy}
              disabled={loading}
              style={{
                padding: '1rem 2.5rem',
                borderRadius: '6px',
                fontWeight: 600,
                background: loading ? '#1e2530' : 'linear-gradient(135deg, #a78bfa, #00aaff)',
                border: 'none',
                color: loading ? '#6e7681' : '#0a0e14',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '1rem'
              }}
            >
              {loading ? 'Building Strategy...' : 'Build My Strategy'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Summary */}
            <div style={{ background: '#151921', border: '1px solid #1e2530', borderRadius: '8px', padding: '1.5rem' }}>
              <p style={{ color: '#8b949e', lineHeight: '1.7', fontSize: '0.95rem' }}>{strategy.summary}</p>
            </div>

            {/* Weekly Targets */}
            <div className="three-col-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              {[
                { label: 'Applications/Week', value: strategy.weeklyTargets.applicationsPerWeek, color: '#00ff88' },
                { label: 'Networking Contacts/Week', value: strategy.weeklyTargets.networkingContactsPerWeek, color: '#00aaff' },
                { label: 'Follow-Ups/Week', value: strategy.weeklyTargets.followUpsPerWeek, color: '#a78bfa' },
              ].map((metric, i) => (
                <div key={i} style={{
                  background: '#151921', border: '1px solid #1e2530', borderRadius: '8px',
                  padding: '1.5rem', textAlign: 'center'
                }}>
                  <p style={{ color: metric.color, fontSize: '2.5rem', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", marginBottom: '0.25rem' }}>
                    {metric.value}
                  </p>
                  <p style={{ color: '#8b949e', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {metric.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Priority Tiers */}
            <div style={{ background: '#151921', border: '1px solid #1e2530', borderRadius: '8px', padding: '1.5rem' }}>
              <h3 style={{ color: '#a78bfa', fontWeight: 600, marginBottom: '1rem', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Priority Tiers
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {strategy.priorityTiers.map((tier, i) => {
                  const color = TIER_COLORS[i] || '#8b949e'
                  return (
                    <div key={i} style={{
                      background: '#0d1117', border: '1px solid #1e2530', borderRadius: '6px',
                      padding: '1.25rem', borderLeft: `3px solid ${color}`
                    }}>
                      <p style={{ color, fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                        {tier.tier}
                      </p>
                      <p style={{ color: '#8b949e', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '0.5rem' }}>
                        {tier.description}
                      </p>
                      <p style={{ color: '#6e7681', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                        <strong style={{ color: '#8b949e' }}>Customization:</strong> {tier.customizationLevel}
                      </p>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        {tier.exampleRoles.map((role, j) => (
                          <span key={j} style={{
                            background: `${color}15`, border: `1px solid ${color}40`,
                            color, padding: '0.2rem 0.6rem', borderRadius: '4px',
                            fontSize: '0.8rem'
                          }}>
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Weekly Schedule */}
            <div style={{ background: '#151921', border: '1px solid #1e2530', borderRadius: '8px', padding: '1.5rem' }}>
              <h3 style={{ color: '#00aaff', fontWeight: 600, marginBottom: '1rem', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Weekly Schedule
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {Object.entries(strategy.weeklySchedule).map(([day, tasks]) => (
                  <div key={day} className="schedule-row" style={{
                    display: 'grid', gridTemplateColumns: '120px 1fr',
                    gap: '1rem', alignItems: 'flex-start',
                    padding: '0.75rem 0',
                    borderBottom: '1px solid #1e2530'
                  }}>
                    <span style={{ color: '#00aaff', fontWeight: 600, fontSize: '0.85rem', fontFamily: "'JetBrains Mono', monospace" }}>
                      {DAY_LABELS[day] || day}
                    </span>
                    <span style={{ color: '#8b949e', fontSize: '0.9rem', lineHeight: '1.5' }}>
                      {tasks}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform Strategy */}
            <div style={{ background: '#151921', border: '1px solid #1e2530', borderRadius: '8px', padding: '1.5rem' }}>
              <h3 style={{ color: '#00ff88', fontWeight: 600, marginBottom: '1rem', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Platform Strategy
              </h3>
              <div className="two-col-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {strategy.platformStrategy.map((platform, i) => (
                  <div key={i} style={{
                    background: '#0d1117', border: '1px solid #1e2530', borderRadius: '6px',
                    padding: '1.25rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <p style={{ color: '#e6edf3', fontWeight: 600, fontSize: '0.95rem' }}>
                        {platform.platform}
                      </p>
                      <span style={{
                        background: '#00ff8815', color: '#00ff88',
                        padding: '0.2rem 0.5rem', borderRadius: '4px',
                        fontSize: '0.75rem', fontWeight: 600
                      }}>
                        {platform.timePerWeek}
                      </span>
                    </div>
                    <p style={{ color: '#8b949e', fontSize: '0.85rem', lineHeight: '1.5' }}>
                      {platform.approach}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tracking Framework */}
            <div style={{ background: '#151921', border: '1px solid #1e2530', borderRadius: '8px', padding: '1.5rem' }}>
              <h3 style={{ color: '#ffaa00', fontWeight: 600, marginBottom: '1rem', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Tracking Framework
              </h3>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                {strategy.trackingFramework.columns.map((col, i) => (
                  <span key={i} style={{
                    background: '#ffaa0015', border: '1px solid #ffaa0040',
                    color: '#ffaa00', padding: '0.3rem 0.75rem', borderRadius: '4px',
                    fontSize: '0.85rem', fontWeight: 600
                  }}>
                    {col}
                  </span>
                ))}
              </div>
              <p style={{ color: '#8b949e', fontSize: '0.9rem', lineHeight: '1.6' }}>
                {strategy.trackingFramework.instructions}
              </p>
            </div>

            {/* Urgency Note */}
            {strategy.urgencyNote && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(167,139,250,0.1), rgba(0,170,255,0.1))',
                border: '1px solid rgba(167,139,250,0.3)',
                borderRadius: '8px', padding: '1.25rem 1.5rem'
              }}>
                <p style={{ color: '#a78bfa', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Timeline Note
                </p>
                <p style={{ color: '#8b949e', fontSize: '0.9rem', lineHeight: '1.5' }}>
                  {strategy.urgencyNote}
                </p>
              </div>
            )}

            {/* Run Again */}
            <div style={{ textAlign: 'center', paddingTop: '1rem' }}>
              <button
                onClick={buildStrategy}
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
                {loading ? 'Building...' : 'Rebuild Strategy'}
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
          .three-col-grid {
            grid-template-columns: 1fr !important;
          }
          .two-col-grid {
            grid-template-columns: 1fr !important;
          }
          .schedule-row {
            grid-template-columns: 1fr !important;
            gap: 0.25rem !important;
          }
        }
      `}</style>
    </div>
  )
}
