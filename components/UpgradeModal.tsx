'use client'

import Link from 'next/link'
import { Rocket, Check } from 'lucide-react'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  feature: 'assessments' | 'assessment' | 'chat' | 'plans' | 'plan' | 'resumes' | 'resume' | 'job_parse' | 'diagnostic' | 'role_clarity' | 'strategy'
  currentUsage: number
  limit: number
}

const FEATURE_NAMES: Record<string, string> = {
  assessments: 'Job Assessments',
  assessment: 'Job Assessments',
  chat: 'AI Chat Messages',
  plans: '90-Day Plans',
  plan: '90-Day Plans',
  resumes: 'Resume Uploads',
  resume: 'Resume Uploads',
  job_parse: 'Job Parses',
  diagnostic: 'Callback Diagnostics',
  role_clarity: 'Role Clarity Analyses',
  strategy: 'Application Strategies',
}

const PRO_LIMITS: Record<string, number> = {
  assessments: 25,
  assessment: 25,
  chat: 100,
  plans: 3,
  plan: 3,
  resumes: 10,
  resume: 10,
  job_parse: 50,
  diagnostic: 10,
  role_clarity: 10,
  strategy: 5,
}

const proBenefits = [
  { text: <><strong>25</strong> job assessments/month (vs 3)</> },
  { text: <><strong>100</strong> AI chat messages/month (vs 10)</> },
  { text: <><strong>3</strong> 90-day plans/month (vs 1)</> },
  { text: <><strong>10</strong> resume uploads/month (vs 3)</> },
  { text: <><strong>10</strong> callback diagnostics/month (vs 1)</> },
  { text: <><strong>5</strong> application strategies/month (Pro exclusive)</> },
]

export default function UpgradeModal({ isOpen, onClose, feature, currentUsage, limit }: UpgradeModalProps) {
  if (!isOpen) return null

  const featureName = FEATURE_NAMES[feature]
  const proLimit = PRO_LIMITS[feature]

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem',
    }}>
      <div style={{
        background: 'rgba(10,15,26,0.98)',
        border: '1px solid rgba(251,191,36,0.2)',
        borderRadius: '16px',
        maxWidth: '480px',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Amber accent strip */}
        <div style={{
          height: '4px',
          background: '#FBBF24',
          width: '100%',
        }} />

        {/* Header */}
        <div style={{
          background: 'rgba(251,191,36,0.04)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          padding: '1.5rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <Rocket size={36} color="#FBBF24" />
          </div>
          <h2 style={{
            color: '#F1F5F9',
            fontSize: '1.5rem',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: '0.5rem',
            fontFamily: 'var(--font-space-grotesk), sans-serif',
          }}>
            Limit Reached
          </h2>
          <p style={{
            color: '#94A3B8',
            textAlign: 'center',
            fontSize: '0.95rem',
            fontFamily: 'var(--font-dm-sans), sans-serif',
          }}>
            You've used {currentUsage} of {limit} {featureName.toLowerCase()} this month
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: '1.75rem' }}>
          {/* Benefits list card */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            padding: '1.25rem',
            marginBottom: '1.25rem',
          }}>
            <p style={{
              color: '#FBBF24',
              fontWeight: 600,
              marginBottom: '1rem',
              fontSize: '1rem',
              fontFamily: 'var(--font-space-grotesk), sans-serif',
            }}>
              Upgrade to Pro and get:
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {proBenefits.map((benefit, i) => (
                <li
                  key={i}
                  style={{
                    color: '#F1F5F9',
                    marginBottom: i < proBenefits.length - 1 ? '0.65rem' : 0,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.5rem',
                    fontSize: '0.9rem',
                    fontFamily: 'var(--font-dm-sans), sans-serif',
                  }}
                >
                  <Check size={16} color="#FBBF24" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{benefit.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Price block */}
          <div style={{
            background: 'rgba(251,191,36,0.06)',
            border: '1px solid rgba(251,191,36,0.25)',
            borderRadius: '12px',
            padding: '1rem',
            textAlign: 'center',
            marginBottom: '1.25rem',
            boxShadow: '0 0 24px rgba(251,191,36,0.08)',
          }}>
            <div style={{
              color: '#FBBF24',
              fontSize: '2.25rem',
              fontWeight: 700,
              marginBottom: '0.2rem',
              fontFamily: 'var(--font-space-grotesk), sans-serif',
            }}>
              $15<span style={{ fontSize: '1rem', color: '#94A3B8', fontWeight: 400 }}>/month</span>
            </div>
            <div style={{
              color: '#64748B',
              fontSize: '0.85rem',
              fontFamily: 'var(--font-dm-sans), sans-serif',
            }}>
              or $199/year (save $29)
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', flexDirection: 'column' }}>
            <Link
              href="/pricing"
              style={{
                padding: '0.9rem 1rem',
                borderRadius: '10px',
                fontWeight: 600,
                background: '#FBBF24',
                color: '#000',
                textDecoration: 'none',
                textAlign: 'center',
                fontSize: '1rem',
                fontFamily: 'var(--font-space-grotesk), sans-serif',
                display: 'block',
              }}
            >
              Upgrade to Pro →
            </Link>

            <button
              onClick={onClose}
              style={{
                padding: '0.75rem',
                borderRadius: '10px',
                fontWeight: 500,
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#64748B',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontFamily: 'var(--font-dm-sans), sans-serif',
              }}
            >
              Maybe Later
            </button>
          </div>

          <p style={{
            color: '#64748B',
            fontSize: '0.75rem',
            textAlign: 'center',
            marginTop: '1rem',
            fontFamily: 'var(--font-dm-sans), sans-serif',
          }}>
            Your usage resets on the 1st of each month
          </p>
        </div>
      </div>
    </div>
  )
}
