'use client'

import { useState } from 'react'
import Link from 'next/link'

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
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem',
    }}>
      <div style={{
        background: '#151921',
        border: '1px solid #1e2530',
        borderRadius: '12px',
        maxWidth: '500px',
        width: '100%',
        position: 'relative',
      }}>
        {/* Header with gradient accent */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(0,255,136,0.1), rgba(0,170,255,0.1))',
          borderBottom: '1px solid #1e2530',
          padding: '1.5rem',
          borderRadius: '12px 12px 0 0',
        }}>
          <div style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '0.5rem' }}>🚀</div>
          <h2 style={{
            color: '#e6edf3',
            fontSize: '1.5rem',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: '0.5rem',
          }}>
            Limit Reached
          </h2>
          <p style={{
            color: '#8b949e',
            textAlign: 'center',
            fontSize: '0.95rem',
          }}>
            You've used {currentUsage} of {limit} {featureName.toLowerCase()} this month
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: '2rem' }}>
          <div style={{
            background: '#0a0e14',
            border: '1px solid #1e2530',
            borderRadius: '8px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
          }}>
            <p style={{ color: '#00ff88', fontWeight: 600, marginBottom: '1rem', fontSize: '1.1rem' }}>
              Upgrade to Pro and get:
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ color: '#e6edf3', marginBottom: '0.75rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <span style={{ color: '#00ff88', flexShrink: 0 }}>✓</span>
                <span><strong>25</strong> job assessments/month (vs 3)</span>
              </li>
              <li style={{ color: '#e6edf3', marginBottom: '0.75rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <span style={{ color: '#00ff88', flexShrink: 0 }}>✓</span>
                <span><strong>100</strong> AI chat messages/month (vs 10)</span>
              </li>
              <li style={{ color: '#e6edf3', marginBottom: '0.75rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <span style={{ color: '#00ff88', flexShrink: 0 }}>✓</span>
                <span><strong>3</strong> 90-day plans/month (vs 1)</span>
              </li>
              <li style={{ color: '#e6edf3', marginBottom: '0.75rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <span style={{ color: '#00ff88', flexShrink: 0 }}>✓</span>
                <span><strong>10</strong> resume uploads/month (vs 3)</span>
              </li>
              <li style={{ color: '#e6edf3', marginBottom: '0.75rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <span style={{ color: '#00ff88', flexShrink: 0 }}>✓</span>
                <span><strong>10</strong> callback diagnostics/month (vs 1)</span>
              </li>
              <li style={{ color: '#e6edf3', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <span style={{ color: '#00ff88', flexShrink: 0 }}>✓</span>
                <span><strong>5</strong> application strategies/month (Pro exclusive)</span>
              </li>
            </ul>
          </div>

          <div style={{
            background: 'rgba(0, 255, 136, 0.05)',
            border: '1px solid rgba(0, 255, 136, 0.2)',
            borderRadius: '8px',
            padding: '1rem',
            textAlign: 'center',
            marginBottom: '1.5rem',
          }}>
            <div style={{ color: '#e6edf3', fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              $15<span style={{ fontSize: '1rem', color: '#8b949e', fontWeight: 400 }}>/month</span>
            </div>
            <div style={{ color: '#8b949e', fontSize: '0.85rem' }}>
              or $199/year (save $29)
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', flexDirection: 'column' }}>
            <Link
              href="/pricing"
              style={{
                padding: '1rem',
                borderRadius: '6px',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #00ff88, #00aaff)',
                color: '#0a0e14',
                textDecoration: 'none',
                textAlign: 'center',
                fontSize: '1rem',
                boxShadow: '0 0 20px rgba(0, 255, 136, 0.3)',
              }}
            >
              Upgrade to Pro →
            </Link>

            <button
              onClick={onClose}
              style={{
                padding: '0.75rem',
                borderRadius: '6px',
                fontWeight: 600,
                background: 'transparent',
                border: '1px solid #1e2530',
                color: '#8b949e',
                cursor: 'pointer',
                fontSize: '0.95rem',
              }}
            >
              Maybe Later
            </button>
          </div>

          <p style={{
            color: '#6e7681',
            fontSize: '0.75rem',
            textAlign: 'center',
            marginTop: '1rem',
          }}>
            Your usage resets on the 1st of each month
          </p>
        </div>
      </div>
    </div>
  )
}
