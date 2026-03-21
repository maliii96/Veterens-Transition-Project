'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface AppNavProps {
  current?: string
}

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/profile', label: 'Profile' },
  { href: '/assessment', label: 'Assessment' },
  { href: '/checklist', label: 'Checklist' },
  { href: '/diagnostic', label: 'Diagnostic' },
  { href: '/role-clarity', label: 'Role Clarity' },
  { href: '/strategy', label: 'Strategy' },
]

export default function AppNav({ current }: AppNavProps) {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav
      className="app-nav"
      style={{
        background: 'rgba(6,10,18,0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="app-nav-inner">
        {/* Logo */}
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div style={{
            width: '32px',
            height: '32px',
            background: '#FBBF24',
            transform: 'rotate(45deg)',
            borderRadius: '4px',
            flexShrink: 0,
          }} />
          <span
            style={{
              fontFamily: 'var(--font-space-grotesk), sans-serif',
              fontWeight: 700,
              fontSize: '1.25rem',
              letterSpacing: '0.02em',
              color: '#F8FAFC',
            }}
          >
            Vet<span style={{ color: '#FBBF24' }}>SITREP</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="app-nav-links">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                color: current === link.href ? '#FBBF24' : '#94A3B8',
                textDecoration: 'none',
                fontWeight: 500,
                fontSize: '0.9rem',
                fontFamily: 'var(--font-dm-sans), sans-serif',
              }}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '6px',
              fontWeight: 600,
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#94A3B8',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontFamily: 'var(--font-dm-sans), sans-serif',
              transition: 'border-color 0.2s, color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(251,191,36,0.5)'
              e.currentTarget.style.color = '#FBBF24'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
              e.currentTarget.style.color = '#94A3B8'
            }}
          >
            Logout
          </button>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="app-nav-hamburger"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <div style={{ width: '24px', height: '2px', background: '#F8FAFC', transition: 'all 0.3s', transform: mobileMenuOpen ? 'rotate(45deg) translate(4px, 4px)' : 'none' }} />
          <div style={{ width: '24px', height: '2px', background: '#F8FAFC', transition: 'all 0.3s', opacity: mobileMenuOpen ? 0 : 1 }} />
          <div style={{ width: '24px', height: '2px', background: '#F8FAFC', transition: 'all 0.3s', transform: mobileMenuOpen ? 'rotate(-45deg) translate(4px, -4px)' : 'none' }} />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          className="app-nav-mobile-menu"
          style={{
            background: '#060A12',
            borderTop: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                color: current === link.href ? '#FBBF24' : '#94A3B8',
                textDecoration: 'none',
                fontWeight: 500,
                padding: '0.75rem 0',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                fontSize: '1rem',
                fontFamily: 'var(--font-dm-sans), sans-serif',
              }}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            style={{
              padding: '0.75rem',
              borderRadius: '6px',
              fontWeight: 600,
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#94A3B8',
              cursor: 'pointer',
              marginTop: '0.5rem',
              width: '100%',
              fontSize: '1rem',
              fontFamily: 'var(--font-dm-sans), sans-serif',
              transition: 'border-color 0.2s, color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(251,191,36,0.5)'
              e.currentTarget.style.color = '#FBBF24'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
              e.currentTarget.style.color = '#94A3B8'
            }}
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  )
}
