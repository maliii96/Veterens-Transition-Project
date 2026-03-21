'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import UpgradeModal from '@/components/UpgradeModal'
import AppNav from '@/components/AppNav'
import { CalendarClock, Target } from 'lucide-react'

interface Week {
  week: number
  title: string
  tasks: string[]
}

interface Phase {
  phase: number
  title: string
  focus: string
  weeks: Week[]
  milestone: string
}

interface Plan {
  summary: string
  phases: Phase[]
  keyResources: string[]
  financialPlan: string
  topPriority: string
}

const PHASE_COLORS = ['#FBBF24', '#60A5FA', '#A78BFA']

export default function PlanPage() {
  const router = useRouter()
  const [plan, setPlan] = useState<Plan | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [upgradeInfo, setUpgradeInfo] = useState({ current: 0, limit: 0 })
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set())
  const [expandedPhase, setExpandedPhase] = useState<number | null>(1)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/login')
    })
    // Load saved progress from localStorage
    const saved = localStorage.getItem('plan-completed-tasks')
    if (saved) setCompletedTasks(new Set(JSON.parse(saved)))
  }, [router])

  const generatePlan = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const response = await fetch('/api/plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      const data = await response.json()

      if (data.upgrade) {
        setUpgradeInfo({ current: data.current, limit: data.limit })
        setShowUpgrade(true)
        return
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate plan')
      }

      setPlan(data.plan)
      setExpandedPhase(1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const toggleTask = (taskKey: string) => {
    setCompletedTasks(prev => {
      const next = new Set(prev)
      if (next.has(taskKey)) {
        next.delete(taskKey)
      } else {
        next.add(taskKey)
      }
      localStorage.setItem('plan-completed-tasks', JSON.stringify([...next]))
      return next
    })
  }

  const getTotalTasks = () => {
    if (!plan) return 0
    return plan.phases.reduce((sum, phase) =>
      sum + phase.weeks.reduce((ws, week) => ws + week.tasks.length, 0), 0)
  }

  const getProgress = () => {
    const total = getTotalTasks()
    return total > 0 ? Math.round((completedTasks.size / total) * 100) : 0
  }

  return (
    <div className="min-h-screen" style={{ background: '#060A12' }}>
      {/* Grid Background */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'linear-gradient(rgba(251,191,36,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(251,191,36,0.03) 1px, transparent 1px)',
        backgroundSize: '60px 60px', pointerEvents: 'none', zIndex: 0
      }} />

      <AppNav current="/plan" />

      <div className="page-content">
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#F8FAFC', fontFamily: 'var(--font-space-grotesk), sans-serif', marginBottom: '0.25rem' }}>
            90-Day Transition Plan
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>
            AI-generated milestone roadmap based on your profile and timeline
          </p>
        </div>

        {error && (
          <div style={{ marginBottom: '1.5rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#FCA5A5', padding: '1rem 1.5rem', borderRadius: '8px' }}>
            {error}
          </div>
        )}

        {!plan ? (
          /* Generate Plan CTA */
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '4rem 2rem',
            textAlign: 'center'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              background: 'rgba(251,191,36,0.12)',
              border: '1px solid rgba(251,191,36,0.25)',
              borderRadius: '16px',
              marginBottom: '1.5rem',
              color: '#FBBF24'
            }}>
              <CalendarClock size={28} />
            </div>
            <h2 style={{ color: '#F8FAFC', fontWeight: 600, marginBottom: '0.75rem', fontSize: '1.5rem', fontFamily: 'var(--font-space-grotesk), sans-serif' }}>
              Build Your Personalized Plan
            </h2>
            <p style={{ color: '#94A3B8', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem', lineHeight: '1.6' }}>
              Claude will analyze your profile — branch, MOS, separation date, finances, and clearance — to generate a week-by-week action plan tailored to your situation.
            </p>
            <button
              onClick={generatePlan}
              disabled={loading}
              style={{
                padding: '1rem 2.5rem',
                borderRadius: '8px',
                fontWeight: 600,
                background: loading ? 'rgba(255,255,255,0.06)' : '#FBBF24',
                border: 'none',
                color: loading ? '#64748B' : '#000',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                transition: 'all 0.2s'
              }}
            >
              {loading ? 'Generating Plan...' : 'Generate My 90-Day Plan'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Top Priority Banner */}
            <div style={{
              background: 'rgba(251,191,36,0.08)',
              border: '1px solid rgba(251,191,36,0.2)',
              borderRadius: '12px',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              gap: '1rem',
              alignItems: 'flex-start'
            }}>
              <div style={{ color: '#FBBF24', flexShrink: 0, marginTop: '1px' }}>
                <Target size={20} />
              </div>
              <div>
                <p style={{ color: '#FBBF24', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                  Top Priority
                </p>
                <p style={{ color: '#F8FAFC', fontSize: '0.95rem' }}>{plan.topPriority}</p>
              </div>
            </div>

            {/* Summary */}
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '1.5rem'
            }}>
              <p style={{ color: '#94A3B8', lineHeight: '1.7', fontSize: '0.95rem' }}>{plan.summary}</p>
            </div>

            {/* Progress Bar */}
            {completedTasks.size > 0 && (
              <div style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '1.25rem 1.5rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ color: '#94A3B8', fontSize: '0.9rem' }}>Overall Progress</span>
                  <span style={{ color: '#FBBF24', fontWeight: 600, fontSize: '0.9rem' }}>
                    {completedTasks.size}/{getTotalTasks()} tasks ({getProgress()}%)
                  </span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${getProgress()}%`, height: '100%', background: 'linear-gradient(90deg, #FBBF24, #60A5FA)', transition: 'width 0.3s' }} />
                </div>
              </div>
            )}

            {/* Phases */}
            {plan.phases.map((phase, pi) => {
              const color = PHASE_COLORS[pi] || '#FBBF24'
              const isExpanded = expandedPhase === phase.phase
              const phaseTaskKeys = phase.weeks.flatMap(w =>
                w.tasks.map((_, ti) => `p${phase.phase}-w${w.week}-t${ti}`)
              )
              const phaseDone = phaseTaskKeys.filter(k => completedTasks.has(k)).length

              return (
                <div key={phase.phase} style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  overflow: 'hidden'
                }}>
                  {/* Phase Header */}
                  <button
                    onClick={() => setExpandedPhase(isExpanded ? null : phase.phase)}
                    style={{
                      width: '100%', textAlign: 'left',
                      padding: '1.5rem',
                      background: 'transparent', border: 'none',
                      cursor: 'pointer',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      borderBottom: isExpanded ? '1px solid rgba(255,255,255,0.08)' : 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = `${color}40`
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = isExpanded ? 'rgba(255,255,255,0.08)' : 'transparent'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        background: `${color}20`, border: `2px solid ${color}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color, fontWeight: 700, fontSize: '0.9rem', flexShrink: 0
                      }}>
                        {phase.phase}
                      </div>
                      <div>
                        <p style={{ color: '#F8FAFC', fontWeight: 600, fontSize: '1rem', marginBottom: '0.2rem', fontFamily: 'var(--font-space-grotesk), sans-serif' }}>
                          {phase.title}
                        </p>
                        <p style={{ color: '#64748B', fontSize: '0.85rem' }}>{phase.focus}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <span style={{ color, fontSize: '0.85rem', fontWeight: 600 }}>
                        {phaseDone}/{phaseTaskKeys.length}
                      </span>
                      <span style={{ color: '#64748B', fontSize: '1.2rem' }}>{isExpanded ? '▲' : '▼'}</span>
                    </div>
                  </button>

                  {/* Phase Content */}
                  {isExpanded && (
                    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      {phase.weeks.map((week) => (
                        <div key={week.week}>
                          <p style={{ color, fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', fontFamily: 'var(--font-space-grotesk), sans-serif' }}>
                            Week {week.week}: {week.title}
                          </p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {week.tasks.map((task, ti) => {
                              const key = `p${phase.phase}-w${week.week}-t${ti}`
                              const done = completedTasks.has(key)
                              return (
                                <label key={ti} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', cursor: 'pointer' }}>
                                  <input
                                    type="checkbox"
                                    checked={done}
                                    onChange={() => toggleTask(key)}
                                    style={{ marginTop: '2px', accentColor: color, flexShrink: 0, width: '16px', height: '16px' }}
                                  />
                                  <span style={{
                                    color: done ? '#64748B' : '#94A3B8',
                                    fontSize: '0.9rem',
                                    lineHeight: '1.5',
                                    textDecoration: done ? 'line-through' : 'none'
                                  }}>
                                    {task}
                                  </span>
                                </label>
                              )
                            })}
                          </div>
                        </div>
                      ))}

                      {/* Milestone */}
                      <div style={{
                        marginTop: '0.5rem',
                        padding: '1rem',
                        background: `${color}10`,
                        border: `1px solid ${color}30`,
                        borderRadius: '8px'
                      }}>
                        <p style={{ color, fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                          Phase Milestone
                        </p>
                        <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>{phase.milestone}</p>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            {/* Key Resources & Financial Plan */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '1.5rem'
              }}>
                <h3 style={{ color: '#60A5FA', fontWeight: 600, marginBottom: '1rem', fontFamily: 'var(--font-space-grotesk), sans-serif', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Key Resources
                </h3>
                <ul style={{ listStyleType: 'disc', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {plan.keyResources.map((r, i) => (
                    <li key={i} style={{ color: '#94A3B8', fontSize: '0.9rem', lineHeight: '1.5' }}>{r}</li>
                  ))}
                </ul>
              </div>

              <div style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '1.5rem'
              }}>
                <h3 style={{ color: '#A78BFA', fontWeight: 600, marginBottom: '1rem', fontFamily: 'var(--font-space-grotesk), sans-serif', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Financial Plan
                </h3>
                <p style={{ color: '#94A3B8', fontSize: '0.9rem', lineHeight: '1.7' }}>{plan.financialPlan}</p>
              </div>
            </div>

            {/* Regenerate */}
            <div style={{ textAlign: 'center', paddingTop: '1rem' }}>
              <button
                onClick={generatePlan}
                disabled={loading}
                style={{
                  padding: '0.75rem 2rem',
                  borderRadius: '8px',
                  fontWeight: 600,
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#94A3B8',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(251,191,36,0.4)'
                    ;(e.currentTarget as HTMLButtonElement).style.color = '#FBBF24'
                  }
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)'
                  ;(e.currentTarget as HTMLButtonElement).style.color = '#94A3B8'
                }}
              >
                {loading ? 'Regenerating...' : 'Regenerate Plan'}
              </button>
            </div>
          </div>
        )}
      </div>

      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        feature="plan"
        currentUsage={upgradeInfo.current}
        limit={upgradeInfo.limit}
      />
    </div>
  )
}
