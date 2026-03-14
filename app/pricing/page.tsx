'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function PricingPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })
  }, [])

  const handleUpgrade = async () => {
    if (!user) {
      router.push('/login?redirect=/pricing')
      return
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ plan: 'monthly' }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `API returned ${response.status}`)
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert(`Failed to start checkout: ${error instanceof Error ? error.message : 'Please try again.'}`)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: '#0a0e14' }}>
      {/* Grid Background */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'linear-gradient(#1e2530 1px, transparent 1px), linear-gradient(90deg, #1e2530 1px, transparent 1px)',
        backgroundSize: '50px 50px',
        opacity: 0.3,
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* Navigation */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(10, 14, 20, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #1e2530',
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #00ff88, #00aaff)',
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
            }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: '1.25rem', letterSpacing: '0.05em', color: '#e6edf3' }}>
              SITREP
            </span>
          </Link>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link href="/dashboard" style={{ color: '#8b949e', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>
              Dashboard
            </Link>
            {user ? (
              <Link href="/dashboard" style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '6px',
                fontWeight: 600,
                background: 'transparent',
                border: '2px solid #1e2530',
                color: '#e6edf3',
                textDecoration: 'none',
                fontSize: '0.95rem',
              }}>
                My Account
              </Link>
            ) : (
              <Link href="/login" style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '6px',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #00ff88, #00cc6a)',
                color: '#0a0e14',
                boxShadow: '0 0 20px rgba(0, 255, 136, 0.3)',
                textDecoration: 'none',
                fontSize: '0.95rem',
              }}>
                Log In
              </Link>
            )}
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 700,
            color: '#e6edf3',
            marginBottom: '1rem',
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: '0.05em',
          }}>
            Choose Your Plan
          </h1>
          <p style={{ color: '#8b949e', fontSize: '1.1rem' }}>
            Start free, upgrade when you need more
          </p>
        </div>

        {/* Pricing Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', maxWidth: '900px', margin: '0 auto' }}>
          {/* Free Tier */}
          <div style={{
            background: '#151921',
            border: '1px solid #1e2530',
            borderRadius: '12px',
            padding: '2rem',
            position: 'relative',
          }}>
            <h3 style={{ color: '#e6edf3', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Free
            </h3>
            <p style={{ color: '#8b949e', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Get started with the basics
            </p>

            <div style={{ marginBottom: '2rem' }}>
              <div style={{ fontSize: '3rem', fontWeight: 700, color: '#e6edf3' }}>
                $0
                <span style={{ fontSize: '1rem', color: '#8b949e', fontWeight: 400 }}>/month</span>
              </div>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem' }}>
              <li style={{ color: '#e6edf3', marginBottom: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                <span style={{ color: '#00ff88' }}>✓</span> 3 job assessments/month
              </li>
              <li style={{ color: '#e6edf3', marginBottom: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                <span style={{ color: '#00ff88' }}>✓</span> 10 AI chat messages/month
              </li>
              <li style={{ color: '#e6edf3', marginBottom: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                <span style={{ color: '#00ff88' }}>✓</span> 1 90-day plan/month
              </li>
              <li style={{ color: '#e6edf3', marginBottom: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                <span style={{ color: '#00ff88' }}>✓</span> 3 resume uploads
              </li>
              <li style={{ color: '#e6edf3', marginBottom: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                <span style={{ color: '#00ff88' }}>✓</span> Company stability scores
              </li>
              <li style={{ color: '#e6edf3', marginBottom: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                <span style={{ color: '#00ff88' }}>✓</span> Financial runway calculator
              </li>
              <li style={{ color: '#e6edf3', marginBottom: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                <span style={{ color: '#00ff88' }}>✓</span> 1 callback diagnostic/month
              </li>
              <li style={{ color: '#e6edf3', marginBottom: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                <span style={{ color: '#00ff88' }}>✓</span> 1 role clarity analysis/month
              </li>
            </ul>

            <Link
              href="/signup"
              style={{
                display: 'block',
                padding: '1rem',
                borderRadius: '6px',
                fontWeight: 600,
                background: 'transparent',
                border: '2px solid #1e2530',
                color: '#e6edf3',
                textDecoration: 'none',
                textAlign: 'center',
                fontSize: '1rem',
              }}
            >
              Get Started
            </Link>
          </div>

          {/* Pro Tier */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(0,255,136,0.05), rgba(0,170,255,0.05))',
            border: '2px solid',
            borderImage: 'linear-gradient(135deg, #00ff88, #00aaff) 1',
            borderRadius: '12px',
            padding: '2rem',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute',
              top: '-12px',
              right: '1.5rem',
              background: 'linear-gradient(135deg, #00ff88, #00aaff)',
              color: '#0a0e14',
              padding: '0.25rem 1rem',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
            }}>
              POPULAR
            </div>

            <h3 style={{ color: '#e6edf3', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Pro
            </h3>
            <p style={{ color: '#8b949e', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              For serious job seekers
            </p>

            <div style={{ marginBottom: '2rem' }}>
              <div style={{ fontSize: '3rem', fontWeight: 700, color: '#e6edf3' }}>
                $15
                <span style={{ fontSize: '1rem', color: '#8b949e', fontWeight: 400 }}>/month</span>
              </div>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem' }}>
              <li style={{ color: '#e6edf3', marginBottom: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                <span style={{ color: '#00ff88' }}>✓</span> <strong>50</strong> job assessments/month
              </li>
              <li style={{ color: '#e6edf3', marginBottom: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                <span style={{ color: '#00ff88' }}>✓</span> <strong>500</strong> AI chat messages/month
              </li>
              <li style={{ color: '#e6edf3', marginBottom: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                <span style={{ color: '#00ff88' }}>✓</span> <strong>5</strong> 90-day plans/month
              </li>
              <li style={{ color: '#e6edf3', marginBottom: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                <span style={{ color: '#00ff88' }}>✓</span> <strong>5</strong> resume uploads
              </li>
              <li style={{ color: '#e6edf3', marginBottom: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                <span style={{ color: '#00ff88' }}>✓</span> <strong>Unlimited</strong> offer comparisons
              </li>
              <li style={{ color: '#e6edf3', marginBottom: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                <span style={{ color: '#00ff88' }}>✓</span> Priority support
              </li>
              <li style={{ color: '#e6edf3', marginBottom: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                <span style={{ color: '#00ff88' }}>✓</span> <strong>10</strong> callback diagnostics/month
              </li>
              <li style={{ color: '#e6edf3', marginBottom: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                <span style={{ color: '#00ff88' }}>✓</span> <strong>10</strong> role clarity analyses/month
              </li>
              <li style={{ color: '#e6edf3', marginBottom: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                <span style={{ color: '#00ff88' }}>✓</span> <strong>5</strong> application strategies/month
              </li>
              <li style={{ color: '#e6edf3', marginBottom: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                <span style={{ color: '#00ff88' }}>✓</span> All Free features
              </li>
            </ul>

            <button
              onClick={handleUpgrade}
              disabled={loading}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '6px',
                fontWeight: 600,
                background: loading ? '#1e2530' : 'linear-gradient(135deg, #00ff88, #00aaff)',
                border: 'none',
                color: loading ? '#6e7681' : '#0a0e14',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                boxShadow: '0 0 20px rgba(0, 255, 136, 0.3)',
              }}
            >
              {loading ? 'Loading...' : user ? 'Upgrade to Pro →' : 'Sign Up for Pro →'}
            </button>
          </div>
        </div>

        {/* FAQ / Additional Info */}
        <div style={{ maxWidth: '700px', margin: '4rem auto 0', textAlign: 'center' }}>
          <p style={{ color: '#8b949e', fontSize: '0.9rem', marginBottom: '1rem' }}>
            All plans reset usage limits on the 1st of each month
          </p>
          <p style={{ color: '#8b949e', fontSize: '0.9rem' }}>
            Questions? <Link href="/about" style={{ color: '#00ff88', textDecoration: 'none' }}>Learn more</Link> or{' '}
            <a href="mailto:support@sitrep.com" style={{ color: '#00ff88', textDecoration: 'none' }}>contact us</a>
          </p>
        </div>
      </div>
    </div>
  )
}
