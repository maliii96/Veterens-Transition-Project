'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import AppNav from '@/components/AppNav'
import UpgradeModal from '@/components/UpgradeModal'
import { Lock, LayoutList, Calendar, Globe, BarChart2, AlertCircle, ChevronRight } from 'lucide-react'

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

const TIER_COLORS = ['#FBBF24', '#60A5FA', '#A78BFA']

export default function StrategyPage() {
  const router = useRouter()
  const [strategy, setStrategy] = useState<Strategy | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPro, setIsPro] = useState<boolean | null>(null)
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
        feature="strategy"
        currentUsage={upgradeInfo.current}
        limit={upgradeInfo.limit}
      />

      <div className="page-content" style={{ position: 'relative', zIndex: 1, maxWidth: '860px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem', flexWrap: 'wrap' }}>
            <h1 className="page-heading" style={{
              fontSize: '1.75rem', fontWeight: 700, color: '#F1F5F9',
              fontFamily: 'var(--font-space-grotesk), sans-serif',
              letterSpacing: '0.04em', textTransform: 'uppercase'
            }}>
              Application Strategy
            </h1>
            <span style={{
              background: 'linear-gradient(135deg, #A78BFA, #60A5FA)',
              color: '#000000',
              padding: '0.2rem 0.6rem', borderRadius: '6px',
              fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em'
            }}>
              PRO
            </span>
          </div>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', lineHeight: '1.6' }}>
            AI builds a structured weekly job application game plan tailored to your goals
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
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            {error}
          </div>
        )}

        {/* Pro Gate */}
        {isPro === false && !strategy ? (
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '4rem 2rem',
            textAlign: 'center'
          }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '16px',
              background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}>
              <Lock size={28} style={{ color: '#A78BFA' }} />
            </div>
            <h2 style={{
              color: '#F1F5F9', fontWeight: 600, marginBottom: '0.75rem', fontSize: '1.5rem',
              fontFamily: 'var(--font-space-grotesk), sans-serif'
            }}>
              Pro Feature
            </h2>
            <p style={{ color: '#94A3B8', maxWidth: '500px', margin: '0 auto 2rem', lineHeight: '1.7', fontSize: '0.95rem' }}>
              The Application Strategy Builder is exclusive to Pro subscribers. Get a personalized weekly game plan with priority tiers, daily schedules, and platform-specific strategies.
            </p>
            <Link href="/pricing" style={{
              display: 'inline-block',
              padding: '0.875rem 2.5rem',
              borderRadius: '10px',
              fontWeight: 600,
              background: '#FBBF24',
              color: '#000000',
              textDecoration: 'none',
              fontSize: '1rem',
              fontFamily: 'var(--font-dm-sans), sans-serif',
              transition: 'background 0.15s ease'
            }}>
              Upgrade to Pro — $15/mo
            </Link>
          </div>
        ) : !strategy ? (
          /* CTA for Pro users */
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
              <LayoutList size={28} style={{ color: '#FBBF24' }} />
            </div>
            <h2 style={{
              color: '#F1F5F9', fontWeight: 600, marginBottom: '0.75rem', fontSize: '1.5rem',
              fontFamily: 'var(--font-space-grotesk), sans-serif'
            }}>
              Build Your Application Strategy
            </h2>
            <p style={{ color: '#94A3B8', maxWidth: '500px', margin: '0 auto 2rem', lineHeight: '1.7', fontSize: '0.95rem' }}>
              AI will create a structured weekly job application plan — how many roles to apply to, how to prioritize and customize applications, and a daily schedule to stay on track.
            </p>
            <button
              onClick={buildStrategy}
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
              {loading ? 'Building Strategy...' : 'Build My Strategy'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Summary */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '14px',
              padding: '1.5rem'
            }}>
              <p style={{ color: '#94A3B8', lineHeight: '1.75', fontSize: '0.95rem' }}>{strategy.summary}</p>
            </div>

            {/* Weekly Targets */}
            <div className="three-col-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              {[
                { label: 'Applications/Week', value: strategy.weeklyTargets.applicationsPerWeek, color: '#FBBF24' },
                { label: 'Networking Contacts/Week', value: strategy.weeklyTargets.networkingContactsPerWeek, color: '#60A5FA' },
                { label: 'Follow-Ups/Week', value: strategy.weeklyTargets.followUpsPerWeek, color: '#A78BFA' },
              ].map((metric, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '14px',
                  padding: '1.5rem',
                  textAlign: 'center'
                }}>
                  <p style={{
                    color: metric.color, fontSize: '2.5rem', fontWeight: 700,
                    fontFamily: 'var(--font-space-grotesk), sans-serif',
                    marginBottom: '0.3rem', lineHeight: 1
                  }}>
                    {metric.value}
                  </p>
                  <p style={{ color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', lineHeight: '1.4' }}>
                    {metric.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Priority Tiers */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '14px',
              padding: '1.5rem'
            }}>
              <h3 style={{
                color: '#A78BFA', fontWeight: 600, marginBottom: '1.25rem',
                fontFamily: 'var(--font-space-grotesk), sans-serif',
                fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em',
                display: 'flex', alignItems: 'center', gap: '0.4rem'
              }}>
                <BarChart2 size={14} />
                Priority Tiers
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {strategy.priorityTiers.map((tier, i) => {
                  const color = TIER_COLORS[i] || '#94A3B8'
                  return (
                    <div key={i} style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '10px',
                      padding: '1.25rem',
                      borderLeft: `3px solid ${color}`
                    }}>
                      <p style={{
                        color, fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.5rem',
                        fontFamily: 'var(--font-space-grotesk), sans-serif'
                      }}>
                        {tier.tier}
                      </p>
                      <p style={{ color: '#94A3B8', fontSize: '0.875rem', lineHeight: '1.6', marginBottom: '0.5rem' }}>
                        {tier.description}
                      </p>
                      <p style={{ color: '#64748B', fontSize: '0.82rem', marginBottom: '0.75rem' }}>
                        <strong style={{ color: '#94A3B8' }}>Customization:</strong> {tier.customizationLevel}
                      </p>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        {tier.exampleRoles.map((role, j) => (
                          <span key={j} style={{
                            background: `${color}12`,
                            border: `1px solid ${color}30`,
                            color, padding: '0.2rem 0.6rem', borderRadius: '6px',
                            fontSize: '0.78rem'
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
                <Calendar size={14} />
                Weekly Schedule
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {Object.entries(strategy.weeklySchedule).map(([day, tasks], idx, arr) => (
                  <div key={day} className="schedule-row" style={{
                    display: 'grid', gridTemplateColumns: '120px 1fr',
                    gap: '1rem', alignItems: 'flex-start',
                    padding: '0.875rem 0',
                    borderBottom: idx < arr.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none'
                  }}>
                    <span style={{
                      color: '#60A5FA', fontWeight: 600, fontSize: '0.82rem',
                      fontFamily: 'var(--font-space-grotesk), sans-serif'
                    }}>
                      {DAY_LABELS[day] || day}
                    </span>
                    <span style={{ color: '#94A3B8', fontSize: '0.875rem', lineHeight: '1.6' }}>
                      {tasks}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform Strategy */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '14px',
              padding: '1.5rem'
            }}>
              <h3 style={{
                color: '#FBBF24', fontWeight: 600, marginBottom: '1.25rem',
                fontFamily: 'var(--font-space-grotesk), sans-serif',
                fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em',
                display: 'flex', alignItems: 'center', gap: '0.4rem'
              }}>
                <Globe size={14} />
                Platform Strategy
              </h3>
              <div className="two-col-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {strategy.platformStrategy.map((platform, i) => (
                  <div key={i} style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '10px',
                    padding: '1.25rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <p style={{
                        color: '#F1F5F9', fontWeight: 600, fontSize: '0.9rem',
                        fontFamily: 'var(--font-space-grotesk), sans-serif'
                      }}>
                        {platform.platform}
                      </p>
                      <span style={{
                        background: 'rgba(251,191,36,0.1)',
                        border: '1px solid rgba(251,191,36,0.2)',
                        color: '#FBBF24',
                        padding: '0.15rem 0.5rem', borderRadius: '6px',
                        fontSize: '0.73rem', fontWeight: 600
                      }}>
                        {platform.timePerWeek}
                      </span>
                    </div>
                    <p style={{ color: '#94A3B8', fontSize: '0.85rem', lineHeight: '1.6' }}>
                      {platform.approach}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tracking Framework */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '14px',
              padding: '1.5rem'
            }}>
              <h3 style={{
                color: '#F59E0B', fontWeight: 600, marginBottom: '1.25rem',
                fontFamily: 'var(--font-space-grotesk), sans-serif',
                fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em'
              }}>
                Tracking Framework
              </h3>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                {strategy.trackingFramework.columns.map((col, i) => (
                  <span key={i} style={{
                    background: 'rgba(245,158,11,0.1)',
                    border: '1px solid rgba(245,158,11,0.25)',
                    color: '#F59E0B',
                    padding: '0.3rem 0.75rem', borderRadius: '6px',
                    fontSize: '0.82rem', fontWeight: 600
                  }}>
                    {col}
                  </span>
                ))}
              </div>
              <p style={{ color: '#94A3B8', fontSize: '0.875rem', lineHeight: '1.7' }}>
                {strategy.trackingFramework.instructions}
              </p>
            </div>

            {/* Urgency Note */}
            {strategy.urgencyNote && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(167,139,250,0.07), rgba(96,165,250,0.07))',
                border: '1px solid rgba(167,139,250,0.2)',
                borderRadius: '14px',
                padding: '1.25rem 1.5rem',
                display: 'flex', gap: '1rem', alignItems: 'flex-start'
              }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: 'rgba(167,139,250,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px'
                }}>
                  <AlertCircle size={15} style={{ color: '#A78BFA' }} />
                </div>
                <div>
                  <p style={{ color: '#A78BFA', fontWeight: 600, fontSize: '0.75rem', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Timeline Note
                  </p>
                  <p style={{ color: '#94A3B8', fontSize: '0.875rem', lineHeight: '1.6' }}>
                    {strategy.urgencyNote}
                  </p>
                </div>
              </div>
            )}

            {/* Run Again */}
            <div style={{ textAlign: 'center', paddingTop: '0.5rem' }}>
              <button
                onClick={buildStrategy}
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
                {loading ? 'Building...' : 'Rebuild Strategy'}
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
