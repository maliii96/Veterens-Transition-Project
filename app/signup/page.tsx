'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    branch: '',
    mos: '',
    separationDate: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Create auth user with metadata (trigger will create profile automatically)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            branch: formData.branch || null,
            mos: formData.mos || null,
            separation_date: formData.separationDate || null,
          }
        }
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('No user data returned');
      }

      // Show success message (user needs to confirm email)
      setSuccess(true);
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    background: '#0A0F1A',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#F8FAFC',
    outline: 'none',
    fontSize: '0.9rem',
    fontFamily: 'var(--font-dm-sans), sans-serif',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: 500,
    color: '#94A3B8',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    fontFamily: 'var(--font-dm-sans), sans-serif',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
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

      <div style={{ maxWidth: '460px', width: '100%', position: 'relative', zIndex: 10 }}>
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
            Create your account
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

          {success && (
            <div
              style={{
                padding: '1.25rem',
                borderRadius: '10px',
                marginBottom: '1.25rem',
                background: 'rgba(251,191,36,0.08)',
                border: '1px solid rgba(251,191,36,0.25)',
              }}
            >
              <div
                style={{
                  fontSize: '1.05rem',
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                  color: '#FBBF24',
                  fontFamily: 'var(--font-space-grotesk), sans-serif',
                }}
              >
                ✉️ Check your email!
              </div>
              <p
                style={{
                  color: '#94A3B8',
                  fontSize: '0.9rem',
                  marginBottom: '0.4rem',
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                }}
              >
                We sent a confirmation link to:
              </p>
              <p
                style={{
                  color: '#F8FAFC',
                  fontWeight: 600,
                  marginBottom: '0.75rem',
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                }}
              >
                {formData.email}
              </p>
              <p
                style={{
                  color: '#94A3B8',
                  fontSize: '0.85rem',
                  marginBottom: '0.75rem',
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                }}
              >
                Click the link in the email to confirm your account.
              </p>
              <p
                style={{
                  color: '#FBBF24',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  background: 'rgba(251,191,36,0.1)',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(251,191,36,0.2)',
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                  margin: 0,
                }}
              >
                📌 After confirming, come back to this website to log in
              </p>
            </div>
          )}

          {!success && (
            <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#FBBF24'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label style={labelStyle}>Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#FBBF24'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label style={labelStyle}>Password *</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#FBBF24'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  placeholder="Min. 6 characters"
                  minLength={6}
                />
              </div>

              {/* Military Info Section */}
              <div
                style={{
                  paddingTop: '1rem',
                  borderTop: '1px solid rgba(251,191,36,0.15)',
                  marginTop: '0.25rem',
                }}
              >
                <p
                  style={{
                    color: '#94A3B8',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontWeight: 500,
                    marginBottom: '1rem',
                    fontFamily: 'var(--font-dm-sans), sans-serif',
                  }}
                >
                  Military Info <span style={{ color: '#64748B', textTransform: 'none', letterSpacing: 'normal' }}>(Optional)</span>
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '0.4rem',
                        fontWeight: 500,
                        color: '#64748B',
                        fontSize: '0.7rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        fontFamily: 'var(--font-dm-sans), sans-serif',
                      }}
                    >
                      Branch
                    </label>
                    <select
                      value={formData.branch}
                      onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.75rem',
                        borderRadius: '8px',
                        background: '#0A0F1A',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: formData.branch ? '#F8FAFC' : '#64748B',
                        fontSize: '0.875rem',
                        fontFamily: 'var(--font-dm-sans), sans-serif',
                        outline: 'none',
                        cursor: 'pointer',
                        boxSizing: 'border-box',
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#FBBF24'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                    >
                      <option value="">Select</option>
                      <option value="Army">Army</option>
                      <option value="Navy">Navy</option>
                      <option value="Air Force">Air Force</option>
                      <option value="Marines">Marines</option>
                      <option value="Coast Guard">Coast Guard</option>
                      <option value="Space Force">Space Force</option>
                    </select>
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '0.4rem',
                        fontWeight: 500,
                        color: '#64748B',
                        fontSize: '0.7rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        fontFamily: 'var(--font-dm-sans), sans-serif',
                      }}
                    >
                      MOS/Rating
                    </label>
                    <input
                      type="text"
                      value={formData.mos}
                      onChange={(e) => setFormData({ ...formData, mos: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.75rem',
                        borderRadius: '8px',
                        background: '#0A0F1A',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#F8FAFC',
                        fontSize: '0.875rem',
                        fontFamily: 'var(--font-dm-sans), sans-serif',
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.2s',
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#FBBF24'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                      placeholder="e.g. 11B"
                    />
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '0.4rem',
                      fontWeight: 500,
                      color: '#64748B',
                      fontSize: '0.7rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      fontFamily: 'var(--font-dm-sans), sans-serif',
                    }}
                  >
                    Separation Date
                  </label>
                  <input
                    type="date"
                    value={formData.separationDate}
                    onChange={(e) => setFormData({ ...formData, separationDate: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem',
                      borderRadius: '8px',
                      background: '#0A0F1A',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: formData.separationDate ? '#F8FAFC' : '#64748B',
                      fontSize: '0.875rem',
                      fontFamily: 'var(--font-dm-sans), sans-serif',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#FBBF24'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </div>
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
                  marginTop: '0.5rem',
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
                {loading ? 'Creating Account...' : 'Create Account →'}
              </button>
            </form>
          )}

          {!success && (
            <p
              style={{
                textAlign: 'center',
                marginTop: '1.5rem',
                color: '#94A3B8',
                fontSize: '0.9rem',
                fontFamily: 'var(--font-dm-sans), sans-serif',
                marginBottom: 0,
              }}
            >
              Already have an account?{' '}
              <Link
                href="/login"
                style={{ color: '#FBBF24', textDecoration: 'none', fontWeight: 600 }}
                onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
              >
                Log in
              </Link>
            </p>
          )}

          {success && (
            <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
              <Link
                href="/login"
                style={{
                  display: 'inline-block',
                  padding: '0.75rem 1.75rem',
                  borderRadius: '8px',
                  fontWeight: 600,
                  background: '#FBBF24',
                  color: '#000',
                  boxShadow: '0 0 20px rgba(251,191,36,0.25)',
                  textDecoration: 'none',
                  fontSize: '0.95rem',
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                  transition: 'background 0.2s, box-shadow 0.2s, transform 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#FCD34D';
                  e.currentTarget.style.boxShadow = '0 0 30px rgba(251,191,36,0.4)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#FBBF24';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(251,191,36,0.25)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Go to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
