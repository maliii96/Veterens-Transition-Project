'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) throw error;
      setResetSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        background: '#060A12',
        position: 'relative',
        overflow: 'hidden',
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
          backgroundImage: 'linear-gradient(rgba(251,191,36,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(251,191,36,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Ambient amber glow blob top-left */}
      <div
        style={{
          position: 'fixed',
          top: '-20%',
          left: '-10%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(251,191,36,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Card */}
      <div
        style={{
          maxWidth: '420px',
          width: '100%',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: '#FBBF24',
              transform: 'rotate(45deg)',
              borderRadius: '4px',
              flexShrink: 0,
            }} />
            <h1
              style={{
                fontSize: '1.75rem',
                fontFamily: 'var(--font-space-grotesk), sans-serif',
                fontWeight: 700,
                color: '#F8FAFC',
                letterSpacing: '0.02em',
                margin: 0,
              }}
            >
              Vet<span style={{ color: '#FBBF24' }}>SITREP</span>
            </h1>
          </div>
          <p
            style={{
              color: '#94A3B8',
              fontSize: '1rem',
              fontFamily: 'var(--font-dm-sans), sans-serif',
              margin: 0,
            }}
          >
            {resetMode ? 'Reset your password' : 'Welcome back'}
          </p>
        </div>

        {/* Panel */}
        <div
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '2.5rem',
          }}
        >
          {error && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                marginBottom: '1.25rem',
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: '#FCA5A5',
                fontSize: '0.9rem',
                fontFamily: 'var(--font-dm-sans), sans-serif',
              }}
            >
              {error}
            </div>
          )}

          {resetMode ? (
            resetSent ? (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>✉️</div>
                <p
                  style={{
                    color: '#F8FAFC',
                    fontWeight: 600,
                    marginBottom: '0.5rem',
                    fontFamily: 'var(--font-space-grotesk), sans-serif',
                  }}
                >
                  Check your email
                </p>
                <p
                  style={{
                    color: '#94A3B8',
                    fontSize: '0.9rem',
                    marginBottom: '1.5rem',
                    fontFamily: 'var(--font-dm-sans), sans-serif',
                  }}
                >
                  We sent a password reset link to{' '}
                  <strong style={{ color: '#F8FAFC' }}>{email}</strong>
                </p>
                <button
                  onClick={() => { setResetMode(false); setResetSent(false); setError(''); }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#FBBF24',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    fontFamily: 'var(--font-dm-sans), sans-serif',
                  }}
                >
                  ← Back to login
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: 500,
                      color: '#94A3B8',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      fontFamily: 'var(--font-dm-sans), sans-serif',
                    }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      background: '#0A0F1A',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#F8FAFC',
                      outline: 'none',
                      fontSize: '0.95rem',
                      fontFamily: 'var(--font-dm-sans), sans-serif',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#FBBF24'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                    placeholder="you@example.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    borderRadius: '8px',
                    fontWeight: 600,
                    background: '#FBBF24',
                    color: '#000',
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.5 : 1,
                    boxShadow: '0 0 20px rgba(251,191,36,0.25)',
                    fontSize: '0.95rem',
                    fontFamily: 'var(--font-dm-sans), sans-serif',
                    transition: 'background 0.2s, box-shadow 0.2s, transform 0.2s',
                    marginTop: '0.75rem',
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.background = '#FCD34D';
                      e.currentTarget.style.boxShadow = '0 0 30px rgba(251,191,36,0.4)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#FBBF24';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(251,191,36,0.25)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {loading ? 'Sending...' : 'Send Reset Link →'}
                </button>

                <p style={{ textAlign: 'center', color: '#94A3B8', fontSize: '0.9rem', fontFamily: 'var(--font-dm-sans), sans-serif', margin: 0 }}>
                  <button
                    type="button"
                    onClick={() => { setResetMode(false); setError(''); }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#FBBF24',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      fontFamily: 'var(--font-dm-sans), sans-serif',
                    }}
                  >
                    ← Back to login
                  </button>
                </p>
              </form>
            )
          ) : (
            <>
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: 500,
                      color: '#94A3B8',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      fontFamily: 'var(--font-dm-sans), sans-serif',
                    }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      background: '#0A0F1A',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#F8FAFC',
                      outline: 'none',
                      fontSize: '0.95rem',
                      fontFamily: 'var(--font-dm-sans), sans-serif',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#FBBF24'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label
                      style={{
                        fontWeight: 500,
                        color: '#94A3B8',
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        fontFamily: 'var(--font-dm-sans), sans-serif',
                      }}
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => { setResetMode(true); setError(''); }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#FBBF24',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        padding: 0,
                        fontFamily: 'var(--font-dm-sans), sans-serif',
                        fontWeight: 500,
                      }}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      background: '#0A0F1A',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#F8FAFC',
                      outline: 'none',
                      fontSize: '0.95rem',
                      fontFamily: 'var(--font-dm-sans), sans-serif',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#FBBF24'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                    placeholder="Your password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    borderRadius: '8px',
                    fontWeight: 600,
                    background: '#FBBF24',
                    color: '#000',
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.5 : 1,
                    boxShadow: '0 0 20px rgba(251,191,36,0.25)',
                    fontSize: '0.95rem',
                    fontFamily: 'var(--font-dm-sans), sans-serif',
                    transition: 'background 0.2s, box-shadow 0.2s, transform 0.2s',
                    marginTop: '0.75rem',
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.background = '#FCD34D';
                      e.currentTarget.style.boxShadow = '0 0 30px rgba(251,191,36,0.4)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#FBBF24';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(251,191,36,0.25)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {loading ? 'Logging in...' : 'Log In →'}
                </button>
              </form>

              <p
                style={{
                  textAlign: 'center',
                  marginTop: '1.5rem',
                  color: '#94A3B8',
                  fontSize: '0.9rem',
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                  margin: '1.5rem 0 0',
                }}
              >
                Don't have an account?{' '}
                <Link
                  href="/signup"
                  style={{ color: '#FBBF24', textDecoration: 'none', fontWeight: 600 }}
                  onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                >
                  Sign up
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
