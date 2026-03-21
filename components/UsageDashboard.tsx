'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Check } from 'lucide-react'
import { getRemainingUsage } from '@/lib/usage'

interface UsageData {
  tier: 'free' | 'pro'
  assessments: { used: number; limit: number; remaining: number }
  chat: { used: number; limit: number; remaining: number }
  plans: { used: number; limit: number; remaining: number }
  resumes: { used: number; limit: number; remaining: number }
  diagnostic: { used: number; limit: number; remaining: number }
  role_clarity: { used: number; limit: number; remaining: number }
  strategy: { used: number; limit: number; remaining: number }
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
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        padding: '1.5rem',
      }}>
        <div style={{
          color: '#94A3B8',
          textAlign: 'center',
          fontFamily: 'var(--font-dm-sans), sans-serif',
        }}>
          Loading usage...
        </div>
      </div>
    )
  }

  if (!usage) return null

  const isFree = usage.tier === 'free'

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return '#EF4444'
    if (percentage >= 75) return '#F97316'
    return '#FBBF24'
  }

  const UsageBar = ({ label, used, limit }: { label: string; used: number; limit: number }) => {
    const percentage = (used / limit) * 100
    const color = getProgressColor(percentage)

    return (
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <span style={{
            color: '#94A3B8',
            fontSize: '0.85rem',
            fontWeight: 500,
            fontFamily: 'var(--font-dm-sans), sans-serif',
          }}>
            {label}
          </span>
          <span style={{
            color: '#F1F5F9',
            fontSize: '0.85rem',
            fontWeight: 600,
            fontFamily: 'var(--font-dm-sans), sans-serif',
          }}>
            {used}/{limit}
          </span>
        </div>
        <div style={{
          width: '100%',
          height: '6px',
          background: 'rgba(251,191,36,0.1)',
          borderRadius: '3px',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${Math.min(percentage, 100)}%`,
            height: '100%',
            background: color,
            borderRadius: '3px',
            transition: 'width 0.3s',
          }} />
        </div>
      </div>
    )
  }

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '16px',
      padding: '1.5rem',
      position: 'relative',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.35rem',
        }}>
          <h3 style={{
            color: '#F1F5F9',
            fontSize: '1.1rem',
            fontWeight: 700,
            fontFamily: 'var(--font-space-grotesk), sans-serif',
            margin: 0,
          }}>
            Monthly Usage
          </h3>
          <span style={{
            background: isFree ? 'rgba(255,255,255,0.06)' : 'rgba(251,191,36,0.15)',
            color: isFree ? '#94A3B8' : '#FBBF24',
            border: isFree ? 'none' : '1px solid rgba(251,191,36,0.3)',
            padding: '0.2rem 0.65rem',
            borderRadius: '20px',
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.06em',
            fontFamily: 'var(--font-space-grotesk), sans-serif',
          }}>
            {isFree ? 'FREE' : 'PRO'}
          </span>
        </div>
        <p style={{
          color: '#64748B',
          fontSize: '0.8rem',
          margin: 0,
          fontFamily: 'var(--font-dm-sans), sans-serif',
        }}>
          Resets 1st of each month
        </p>
      </div>

      {/* Usage Bars */}
      <div>
        <UsageBar label="Assessments" used={usage.assessments.used} limit={usage.assessments.limit} />
        <UsageBar label="Chat Messages" used={usage.chat.used} limit={usage.chat.limit} />
        <UsageBar label="90-Day Plans" used={usage.plans.used} limit={usage.plans.limit} />
        <UsageBar label="Resume Uploads" used={usage.resumes.used} limit={usage.resumes.limit} />
        {usage.diagnostic.limit > 0 && (
          <UsageBar label="Callback Diagnostics" used={usage.diagnostic.used} limit={usage.diagnostic.limit} />
        )}
        {usage.role_clarity.limit > 0 && (
          <UsageBar label="Role Clarity" used={usage.role_clarity.used} limit={usage.role_clarity.limit} />
        )}
        {usage.strategy.limit > 0 && (
          <UsageBar label="Application Strategy" used={usage.strategy.used} limit={usage.strategy.limit} />
        )}
      </div>

      {/* Upgrade CTA (only for free users) */}
      {isFree && (
        <div style={{
          marginTop: '1.5rem',
          padding: '1.1rem',
          background: 'rgba(251,191,36,0.05)',
          border: '1px solid rgba(251,191,36,0.2)',
          borderRadius: '12px',
        }}>
          <p style={{
            color: '#F1F5F9',
            fontSize: '0.9rem',
            marginBottom: '0.75rem',
            fontWeight: 600,
            fontFamily: 'var(--font-space-grotesk), sans-serif',
          }}>
            Need more? Upgrade to Pro
          </p>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: '0 0 1rem 0',
            fontSize: '0.85rem',
          }}>
            {[
              '25 assessments/month',
              '100 chat messages/month',
              '3 90-day plans/month',
              '10 resume uploads/month',
              '10 callback diagnostics/month',
              '10 role clarity analyses/month',
              '5 application strategies/month',
            ].map((item, i, arr) => (
              <li
                key={i}
                style={{
                  marginBottom: i < arr.length - 1 ? '0.3rem' : 0,
                  color: '#94A3B8',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                }}
              >
                <Check size={13} color="#FBBF24" style={{ flexShrink: 0 }} />
                {item}
              </li>
            ))}
          </ul>
          <Link
            href="/pricing"
            style={{
              display: 'inline-block',
              padding: '0.65rem 1.25rem',
              borderRadius: '10px',
              fontWeight: 600,
              background: '#FBBF24',
              color: '#000',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontFamily: 'var(--font-space-grotesk), sans-serif',
            }}
          >
            Upgrade for $15/mo →
          </Link>
        </div>
      )}
    </div>
  )
}
