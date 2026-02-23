'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getRemainingUsage } from '@/lib/usage'

interface UsageData {
  tier: 'free' | 'pro'
  assessments: { used: number; limit: number; remaining: number }
  chat: { used: number; limit: number; remaining: number }
  plans: { used: number; limit: number; remaining: number }
  resumes: { used: number; limit: number; remaining: number }
  resetDate: string
}

export default function UsageDashboard({ userId }: { userId: string }) {
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUsage()
  }, [userId])

  const loadUsage = async () => {
    const data = await getRemainingUsage(userId)
    setUsage(data)
    setLoading(false)
  }

  if (loading) {
    return (
      <div style={{
        background: '#151921',
        border: '1px solid #1e2530',
        borderRadius: '8px',
        padding: '1.5rem',
      }}>
        <div style={{ color: '#8b949e', textAlign: 'center' }}>Loading usage...</div>
      </div>
    )
  }

  if (!usage) return null

  const isFree = usage.tier === 'free'

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return '#ff4444'
    if (percentage >= 75) return '#ffaa00'
    return '#00ff88'
  }

  const UsageBar = ({ label, used, limit }: { label: string; used: number; limit: number }) => {
    const percentage = (used / limit) * 100
    const color = getProgressColor(percentage)

    return (
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ color: '#8b949e', fontSize: '0.85rem', fontWeight: 500 }}>{label}</span>
          <span style={{ color: '#e6edf3', fontSize: '0.85rem', fontWeight: 600 }}>
            {used}/{limit}
          </span>
        </div>
        <div style={{
          width: '100%',
          height: '6px',
          background: '#1e2530',
          borderRadius: '3px',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${Math.min(percentage, 100)}%`,
            height: '100%',
            background: color,
            transition: 'width 0.3s',
          }} />
        </div>
      </div>
    )
  }

  return (
    <div style={{
      background: '#151921',
      border: '1px solid #1e2530',
      borderRadius: '8px',
      padding: '1.5rem',
      position: 'relative',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h3 style={{
            color: '#e6edf3',
            fontSize: '1.1rem',
            fontWeight: 700,
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}>
            Monthly Usage
          </h3>
          <span style={{
            background: isFree ? '#1e2530' : 'linear-gradient(135deg, #00ff88, #00aaff)',
            color: isFree ? '#8b949e' : '#0a0e14',
            padding: '0.25rem 0.75rem',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.05em',
          }}>
            {isFree ? 'FREE' : 'PRO'}
          </span>
        </div>
        <p style={{ color: '#6e7681', fontSize: '0.8rem' }}>
          Resets 1st of each month
        </p>
      </div>

      {/* Usage Bars */}
      <div>
        <UsageBar label="Assessments" used={usage.assessments.used} limit={usage.assessments.limit} />
        <UsageBar label="Chat Messages" used={usage.chat.used} limit={usage.chat.limit} />
        <UsageBar label="90-Day Plans" used={usage.plans.used} limit={usage.plans.limit} />
        <UsageBar label="Resume Uploads" used={usage.resumes.used} limit={usage.resumes.limit} />
      </div>

      {/* Upgrade CTA (only for free users) */}
      {isFree && (
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: 'rgba(0, 255, 136, 0.05)',
          border: '1px solid rgba(0, 255, 136, 0.2)',
          borderRadius: '6px',
        }}>
          <p style={{ color: '#e6edf3', fontSize: '0.9rem', marginBottom: '0.75rem', fontWeight: 600 }}>
            Need more? Upgrade to Pro
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1rem 0', fontSize: '0.85rem', color: '#8b949e' }}>
            <li style={{ marginBottom: '0.25rem' }}>✓ 50 assessments/month</li>
            <li style={{ marginBottom: '0.25rem' }}>✓ 500 chat messages/month</li>
            <li style={{ marginBottom: '0.25rem' }}>✓ 5 90-day plans/month</li>
            <li>✓ Unlimited offer comparisons</li>
          </ul>
          <Link
            href="/pricing"
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #00ff88, #00aaff)',
              color: '#0a0e14',
              textDecoration: 'none',
              fontSize: '0.9rem',
              boxShadow: '0 0 15px rgba(0, 255, 136, 0.3)',
            }}
          >
            Upgrade for $19/mo →
          </Link>
        </div>
      )}
    </div>
  )
}
