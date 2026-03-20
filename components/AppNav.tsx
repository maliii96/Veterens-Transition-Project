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
    <nav className="app-nav">
      <div className="app-nav-inner">
        {/* Logo */}
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #00ff88, #00aaff)',
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
            flexShrink: 0,
          }} />
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700,
            fontSize: '1.25rem',
            letterSpacing: '0.05em',
            color: '#e6edf3'
          }}>
            SITREP
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="app-nav-links">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                color: current === link.href ? '#00ff88' : '#8b949e',
                textDecoration: 'none',
                fontWeight: 500,
                fontSize: '0.9rem',
              }}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              fontWeight: 600,
              background: 'transparent',
              border: '2px solid #1e2530',
              color: '#e6edf3',
              cursor: 'pointer',
              fontSize: '0.95rem'
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
          <div style={{ width: '24px', height: '2px', background: '#e6edf3', transition: 'all 0.3s', transform: mobileMenuOpen ? 'rotate(45deg) translate(4px, 4px)' : 'none' }} />
          <div style={{ width: '24px', height: '2px', background: '#e6edf3', transition: 'all 0.3s', opacity: mobileMenuOpen ? 0 : 1 }} />
          <div style={{ width: '24px', height: '2px', background: '#e6edf3', transition: 'all 0.3s', transform: mobileMenuOpen ? 'rotate(-45deg) translate(4px, -4px)' : 'none' }} />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="app-nav-mobile-menu">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                color: current === link.href ? '#00ff88' : '#8b949e',
                textDecoration: 'none',
                fontWeight: 500,
                padding: '0.75rem 0',
                borderBottom: '1px solid #1e2530',
                fontSize: '1rem',
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
              border: '2px solid #1e2530',
              color: '#e6edf3',
              cursor: 'pointer',
              marginTop: '0.5rem',
              width: '100%',
              fontSize: '1rem',
            }}
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  )
}
