'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import UpgradeModal from '@/components/UpgradeModal'

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

const PHASE_COLORS = ['#00ff88', '#00aaff', '#a78bfa']

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

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

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
            <Link href="/chat" style={{ color: '#8b949e', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>Advisor</Link>
            <Link href="/plan" style={{ color: '#00ff88', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>90-Day Plan</Link>
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

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#e6edf3', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            90-Day Transition Plan
          </h1>
          <p style={{ color: '#8b949e', fontSize: '0.9rem' }}>
            AI-generated milestone roadmap based on your profile and timeline
          </p>
        </div>

        {error && (
          <div style={{ marginBottom: '1.5rem', background: '#2d1515', border: '1px solid #5c2626', color: '#ff6b6b', padding: '1rem 1.5rem', borderRadius: '8px' }}>
            {error}
          </div>
        )}

        {!plan ? (
          /* Generate Plan CTA */
          <div style={{
            background: '#151921', border: '1px solid #1e2530', borderRadius: '8px',
            padding: '4rem 2rem', textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
            <h2 style={{ color: '#e6edf3', fontWeight: 600, marginBottom: '0.75rem', fontSize: '1.5rem' }}>
              Build Your Personalized Plan
            </h2>
            <p style={{ color: '#8b949e', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem', lineHeight: '1.6' }}>
              Claude will analyze your profile — branch, MOS, separation date, finances, and clearance — to generate a week-by-week action plan tailored to your situation.
            </p>
            <button
              onClick={generatePlan}
              disabled={loading}
              style={{
                padding: '1rem 2.5rem',
                borderRadius: '6px',
                fontWeight: 600,
                background: loading ? '#1e2530' : 'linear-gradient(135deg, #00ff88, #00aaff)',
                border: 'none',
                color: loading ? '#6e7681' : '#0a0e14',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '1rem'
              }}
            >
              {loading ? 'Generating Plan...' : 'Generate My 90-Day Plan'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Top Priority Banner */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(0,255,136,0.15), rgba(0,170,255,0.15))',
              border: '1px solid rgba(0,255,136,0.3)',
              borderRadius: '8px',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              gap: '1rem',
              alignItems: 'flex-start'
            }}>
              <span style={{ fontSize: '1.25rem' }}>🎯</span>
              <div>
                <p style={{ color: '#00ff88', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                  Top Priority
                </p>
                <p style={{ color: '#e6edf3', fontSize: '0.95rem' }}>{plan.topPriority}</p>
              </div>
            </div>

            {/* Summary */}
            <div style={{ background: '#151921', border: '1px solid #1e2530', borderRadius: '8px', padding: '1.5rem' }}>
              <p style={{ color: '#8b949e', lineHeight: '1.7', fontSize: '0.95rem' }}>{plan.summary}</p>
            </div>

            {/* Progress Bar */}
            {completedTasks.size > 0 && (
              <div style={{ background: '#151921', border: '1px solid #1e2530', borderRadius: '8px', padding: '1.25rem 1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ color: '#8b949e', fontSize: '0.9rem' }}>Overall Progress</span>
                  <span style={{ color: '#00ff88', fontWeight: 600, fontSize: '0.9rem' }}>
                    {completedTasks.size}/{getTotalTasks()} tasks ({getProgress()}%)
                  </span>
                </div>
                <div style={{ width: '100%', height: '6px', background: '#1e2530', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${getProgress()}%`, height: '100%', background: 'linear-gradient(90deg, #00ff88, #00aaff)', transition: 'width 0.3s' }} />
                </div>
              </div>
            )}

            {/* Phases */}
            {plan.phases.map((phase, pi) => {
              const color = PHASE_COLORS[pi] || '#00ff88'
              const isExpanded = expandedPhase === phase.phase
              const phaseTaskKeys = phase.weeks.flatMap(w =>
                w.tasks.map((_, ti) => `p${phase.phase}-w${w.week}-t${ti}`)
              )
              const phaseDone = phaseTaskKeys.filter(k => completedTasks.has(k)).length

              return (
                <div key={phase.phase} style={{ background: '#151921', border: `1px solid #1e2530`, borderRadius: '8px', overflow: 'hidden' }}>
                  {/* Phase Header */}
                  <button
                    onClick={() => setExpandedPhase(isExpanded ? null : phase.phase)}
                    style={{
                      width: '100%', textAlign: 'left',
                      padding: '1.5rem',
                      background: 'transparent', border: 'none',
                      cursor: 'pointer',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      borderBottom: isExpanded ? '1px solid #1e2530' : 'none'
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
                        <p style={{ color: '#e6edf3', fontWeight: 600, fontSize: '1rem', marginBottom: '0.2rem', fontFamily: "'JetBrains Mono', monospace" }}>
                          {phase.title}
                        </p>
                        <p style={{ color: '#6e7681', fontSize: '0.85rem' }}>{phase.focus}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <span style={{ color, fontSize: '0.85rem', fontWeight: 600 }}>
                        {phaseDone}/{phaseTaskKeys.length}
                      </span>
                      <span style={{ color: '#6e7681', fontSize: '1.2rem' }}>{isExpanded ? '▲' : '▼'}</span>
                    </div>
                  </button>

                  {/* Phase Content */}
                  {isExpanded && (
                    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      {phase.weeks.map((week) => (
                        <div key={week.week}>
                          <p style={{ color, fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', fontFamily: "'JetBrains Mono', monospace" }}>
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
                                    color: done ? '#6e7681' : '#8b949e',
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
                        borderRadius: '6px'
                      }}>
                        <p style={{ color, fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                          Phase Milestone
                        </p>
                        <p style={{ color: '#8b949e', fontSize: '0.9rem' }}>{phase.milestone}</p>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            {/* Key Resources & Financial Plan */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ background: '#151921', border: '1px solid #1e2530', borderRadius: '8px', padding: '1.5rem' }}>
                <h3 style={{ color: '#00aaff', fontWeight: 600, marginBottom: '1rem', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Key Resources
                </h3>
                <ul style={{ listStyleType: 'disc', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {plan.keyResources.map((r, i) => (
                    <li key={i} style={{ color: '#8b949e', fontSize: '0.9rem', lineHeight: '1.5' }}>{r}</li>
                  ))}
                </ul>
              </div>

              <div style={{ background: '#151921', border: '1px solid #1e2530', borderRadius: '8px', padding: '1.5rem' }}>
                <h3 style={{ color: '#a78bfa', fontWeight: 600, marginBottom: '1rem', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Financial Plan
                </h3>
                <p style={{ color: '#8b949e', fontSize: '0.9rem', lineHeight: '1.7' }}>{plan.financialPlan}</p>
              </div>
            </div>

            {/* Regenerate */}
            <div style={{ textAlign: 'center', paddingTop: '1rem' }}>
              <button
                onClick={generatePlan}
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
