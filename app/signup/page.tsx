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
      console.log('Starting signup...');

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

      console.log('Auth response:', { authData, authError });

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

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ background: '#0a0e14' }}>
      {/* Grid Background */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'linear-gradient(#1e2530 1px, transparent 1px), linear-gradient(90deg, #1e2530 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          opacity: 0.3,
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      <div className="max-w-md w-full relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #00ff88, #00aaff)',
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
            }} />
            <h1
              className="font-bold tracking-wide"
              style={{
                fontSize: '1.75rem',
                fontFamily: "'JetBrains Mono', monospace",
                color: '#e6edf3',
                letterSpacing: '0.05em'
              }}
            >
              SITREP
            </h1>
          </div>
          <p style={{ color: '#8b949e', fontSize: '1.1rem' }}>Create your account</p>
        </div>

        {/* Panel */}
        <div
          className="rounded-lg p-8"
          style={{
            background: '#151921',
            border: '1px solid #1e2530'
          }}
        >
          {error && (
            <div
              className="px-4 py-3 rounded mb-4"
              style={{
                background: 'rgba(255, 68, 68, 0.1)',
                border: '1px solid #ff4444',
                color: '#ff4444'
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              className="px-4 py-4 rounded mb-4"
              style={{
                background: 'rgba(0, 255, 136, 0.1)',
                border: '1px solid #00ff88',
                color: '#00ff88'
              }}
            >
              <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                ✉️ Check your email!
              </div>
              <p style={{ color: '#8b949e', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                We sent a confirmation link to:
              </p>
              <p style={{ color: '#e6edf3', fontWeight: 600, marginBottom: '0.75rem' }}>
                {formData.email}
              </p>
              <p style={{ color: '#8b949e', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                Click the link in the email to confirm your account.
              </p>
              <p style={{ color: '#00ff88', fontSize: '0.9rem', fontWeight: 600, background: 'rgba(0, 255, 136, 0.1)', padding: '0.75rem', borderRadius: '6px', border: '1px solid rgba(0, 255, 136, 0.3)' }}>
                📌 After confirming, come back to this website to log in
              </p>
            </div>
          )}

          {!success && (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label
                className="block mb-2 font-medium"
                style={{
                  color: '#e6edf3',
                  fontSize: '0.85rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 rounded-lg transition-all"
                style={{
                  background: '#0a0e14',
                  border: '1px solid #1e2530',
                  color: '#e6edf3',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#00ff88'}
                onBlur={(e) => e.target.style.borderColor = '#1e2530'}
                placeholder="John Doe"
              />
            </div>

            <div>
              <label
                className="block mb-2 font-medium"
                style={{
                  color: '#e6edf3',
                  fontSize: '0.85rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 rounded-lg transition-all"
                style={{
                  background: '#0a0e14',
                  border: '1px solid #1e2530',
                  color: '#e6edf3',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#00ff88'}
                onBlur={(e) => e.target.style.borderColor = '#1e2530'}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                className="block mb-2 font-medium"
                style={{
                  color: '#e6edf3',
                  fontSize: '0.85rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                Password *
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 rounded-lg transition-all"
                style={{
                  background: '#0a0e14',
                  border: '1px solid #1e2530',
                  color: '#e6edf3',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#00ff88'}
                onBlur={(e) => e.target.style.borderColor = '#1e2530'}
                placeholder="Min. 6 characters"
                minLength={6}
              />
            </div>

            <div className="pt-3" style={{ borderTop: '1px solid #1e2530' }}>
              <p style={{ color: '#8b949e', fontSize: '0.85rem', marginBottom: '1rem' }}>
                Military Info (Optional)
              </p>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label
                    className="block mb-1 font-medium"
                    style={{
                      color: '#8b949e',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase'
                    }}
                  >
                    Branch
                  </label>
                  <select
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg"
                    style={{
                      background: '#0a0e14',
                      border: '1px solid #1e2530',
                      color: '#e6edf3',
                      fontSize: '0.9rem'
                    }}
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
                    className="block mb-1 font-medium"
                    style={{
                      color: '#8b949e',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase'
                    }}
                  >
                    MOS/Rating
                  </label>
                  <input
                    type="text"
                    value={formData.mos}
                    onChange={(e) => setFormData({ ...formData, mos: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg"
                    style={{
                      background: '#0a0e14',
                      border: '1px solid #1e2530',
                      color: '#e6edf3',
                      fontSize: '0.9rem'
                    }}
                    placeholder="e.g. 11B"
                  />
                </div>
              </div>

              <div>
                <label
                  className="block mb-1 font-medium"
                  style={{
                    color: '#8b949e',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase'
                  }}
                >
                  Separation Date
                </label>
                <input
                  type="date"
                  value={formData.separationDate}
                  onChange={(e) => setFormData({ ...formData, separationDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg"
                  style={{
                    background: '#0a0e14',
                    border: '1px solid #1e2530',
                    color: '#e6edf3',
                    fontSize: '0.9rem'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #00ff88, #00cc6a)',
                color: '#0a0e14',
                boxShadow: '0 0 20px rgba(0, 255, 136, 0.3)',
                marginTop: '1.5rem'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.boxShadow = '0 0 30px rgba(0, 255, 136, 0.5)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 255, 136, 0.3)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {loading ? 'Creating Account...' : 'Create Account →'}
            </button>
          </form>
          )}

          {!success && (
            <p className="text-center mt-6" style={{ color: '#8b949e', fontSize: '0.9rem' }}>
              Already have an account?{' '}
              <Link
                href="/login"
                style={{ color: '#00ff88', textDecoration: 'none', fontWeight: 600 }}
                onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
              >
                Log in
              </Link>
            </p>
          )}

          {success && (
            <div className="text-center mt-4">
              <Link
                href="/login"
                className="inline-block py-3 px-6 rounded-lg font-semibold transition-all"
                style={{
                  background: 'linear-gradient(135deg, #00ff88, #00cc6a)',
                  color: '#0a0e14',
                  boxShadow: '0 0 20px rgba(0, 255, 136, 0.3)',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 30px rgba(0, 255, 136, 0.5)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 255, 136, 0.3)';
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
