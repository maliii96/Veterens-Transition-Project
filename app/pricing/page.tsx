'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Check } from 'lucide-react'

export default function PricingPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
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
    <div
      style={{
        minHeight: '100vh',
        background: '#060A12',
        fontFamily: 'var(--font-dm-sans), sans-serif',
        color: '#F8FAFC',
      }}
    >
      {/* Grid Background */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage:
            'linear-gradient(rgba(251,191,36,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(251,191,36,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Navigation */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: scrolled ? 'rgba(6,10,18,0.95)' : 'rgba(6,10,18,0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          transition: 'background 0.2s',
        }}
      >
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '1rem 1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                background: '#FBBF24',
                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-space-grotesk), sans-serif',
                fontWeight: 700,
                fontSize: '1.2rem',
                color: '#F8FAFC',
                letterSpacing: '0.02em',
              }}
            >
              Vet<strong style={{ color: '#FBBF24' }}>SITREP</strong>
            </span>
          </Link>

          {/* Nav links */}
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <Link
              href="/dashboard"
              style={{ color: '#94A3B8', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}
            >
              Dashboard
            </Link>
            {user ? (
              <Link
                href="/dashboard"
                style={{
                  padding: '0.6rem 1.25rem',
                  borderRadius: '8px',
                  fontWeight: 600,
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#F8FAFC',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                }}
              >
                My Account
              </Link>
            ) : (
              <Link
                href="/login"
                style={{
                  padding: '0.6rem 1.25rem',
                  borderRadius: '8px',
                  fontWeight: 600,
                  background: '#FBBF24',
                  color: '#060A12',
                  boxShadow: '0 0 16px rgba(251,191,36,0.3)',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                }}
              >
                Log In
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <div style={{ position: 'relative', zIndex: 1, padding: '3rem 1.5rem 5rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 1rem',
              border: '1px solid rgba(251,191,36,0.3)',
              background: 'rgba(251,191,36,0.08)',
              borderRadius: '50px',
              fontSize: '0.78rem',
              color: '#FBBF24',
              marginBottom: '1.25rem',
              fontWeight: 600,
              letterSpacing: '0.08em',
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                background: '#FBBF24',
                borderRadius: '50%',
                display: 'inline-block',
              }}
            />
            SIMPLE PRICING
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-space-grotesk), sans-serif',
              fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
              fontWeight: 700,
              color: '#F8FAFC',
              marginBottom: '1rem',
              letterSpacing: '-0.01em',
            }}
          >
            Choose Your Plan
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '1.05rem' }}>
            Start free, upgrade when you need more
          </p>
        </div>

        {/* Pricing Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            maxWidth: '860px',
            margin: '0 auto',
          }}
        >
          {/* Free Tier */}
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '2rem',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <h3
              style={{
                fontFamily: 'var(--font-space-grotesk), sans-serif',
                color: '#F8FAFC',
                fontSize: '1.4rem',
                fontWeight: 700,
                marginBottom: '0.4rem',
              }}
            >
              Free
            </h3>
            <p style={{ color: '#64748B', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Get started with the basics
            </p>

            <div style={{ marginBottom: '2rem' }}>
              <div
                style={{
                  fontFamily: 'var(--font-space-grotesk), sans-serif',
                  fontSize: '3rem',
                  fontWeight: 700,
                  color: '#F8FAFC',
                }}
              >
                $0
                <span style={{ fontSize: '1rem', color: '#94A3B8', fontWeight: 400 }}>/month</span>
              </div>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem', flex: 1 }}>
              {[
                '3 job assessments/month',
                '10 AI chat messages/month',
                '1 90-day plan/month',
                '3 resume uploads',
                'Company stability scores',
                'Financial runway calculator',
                '1 callback diagnostic/month',
                '1 role clarity analysis/month',
              ].map((item, i) => (
                <li
                  key={i}
                  style={{
                    color: '#F8FAFC',
                    marginBottom: '0.75rem',
                    display: 'flex',
                    gap: '0.6rem',
                    alignItems: 'flex-start',
                    fontSize: '0.95rem',
                  }}
                >
                  <Check size={16} color="#FBBF24" style={{ marginTop: '2px', flexShrink: 0 }} />
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href="/signup"
              style={{
                display: 'block',
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                fontWeight: 600,
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#F8FAFC',
                textDecoration: 'none',
                textAlign: 'center',
                fontSize: '0.95rem',
                transition: 'border-color 0.2s',
              }}
            >
              Get Started
            </Link>
          </div>

          {/* Pro Tier */}
          <div
            style={{
              background: 'rgba(251,191,36,0.06)',
              border: '1px solid rgba(251,191,36,0.3)',
              borderRadius: '16px',
              padding: '2rem',
              position: 'relative',
              boxShadow: '0 0 40px rgba(251,191,36,0.08)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* POPULAR badge */}
            <div
              style={{
                position: 'absolute',
                top: '-13px',
                right: '1.5rem',
                background: '#FBBF24',
                color: '#060A12',
                padding: '0.25rem 0.9rem',
                borderRadius: '20px',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
              }}
            >
              POPULAR
            </div>

            <h3
              style={{
                fontFamily: 'var(--font-space-grotesk), sans-serif',
                color: '#F8FAFC',
                fontSize: '1.4rem',
                fontWeight: 700,
                marginBottom: '0.4rem',
              }}
            >
              Pro
            </h3>
            <p style={{ color: '#64748B', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              For serious job seekers
            </p>

            <div style={{ marginBottom: '2rem' }}>
              <div
                style={{
                  fontFamily: 'var(--font-space-grotesk), sans-serif',
                  fontSize: '3rem',
                  fontWeight: 700,
                  color: '#F8FAFC',
                }}
              >
                $15
                <span style={{ fontSize: '1rem', color: '#94A3B8', fontWeight: 400 }}>/month</span>
              </div>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem', flex: 1 }}>
              {[
                <><strong>25</strong> job assessments/month</>,
                <><strong>100</strong> AI chat messages/month</>,
                <><strong>3</strong> 90-day plans/month</>,
                <><strong>10</strong> resume uploads/month</>,
                <><strong>10</strong> callback diagnostics/month</>,
                <><strong>10</strong> role clarity analyses/month</>,
                <><strong>5</strong> application strategies/month</>,
                <>All Free features</>,
              ].map((item, i) => (
                <li
                  key={i}
                  style={{
                    color: '#F8FAFC',
                    marginBottom: '0.75rem',
                    display: 'flex',
                    gap: '0.6rem',
                    alignItems: 'flex-start',
                    fontSize: '0.95rem',
                  }}
                >
                  <Check size={16} color="#FBBF24" style={{ marginTop: '2px', flexShrink: 0 }} />
                  {item}
                </li>
              ))}
            </ul>

            <button
              onClick={handleUpgrade}
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                fontWeight: 700,
                background: loading ? 'rgba(255,255,255,0.06)' : '#FBBF24',
                border: 'none',
                color: loading ? '#64748B' : '#060A12',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '0.95rem',
                boxShadow: loading ? 'none' : '0 0 24px rgba(251,191,36,0.35)',
                transition: 'opacity 0.2s',
                fontFamily: 'var(--font-dm-sans), sans-serif',
              }}
            >
              {loading ? 'Loading...' : user ? 'Upgrade to Pro →' : 'Sign Up for Pro →'}
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div style={{ maxWidth: '700px', margin: '3.5rem auto 0', textAlign: 'center' }}>
          <p style={{ color: '#94A3B8', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            All plans reset usage limits on the 1st of each month
          </p>
          <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>
            Questions?{' '}
            <Link href="/about" style={{ color: '#FBBF24', textDecoration: 'none' }}>
              Learn more
            </Link>{' '}
            or{' '}
            <a href="mailto:support@sitrep.com" style={{ color: '#FBBF24', textDecoration: 'none' }}>
              contact us
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
