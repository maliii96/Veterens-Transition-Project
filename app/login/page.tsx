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

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0a0e14' }}>
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
          <p style={{ color: '#8b949e', fontSize: '1.1rem' }}>Welcome back</p>
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

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                className="block mb-2 font-medium"
                style={{
                  color: '#e6edf3',
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg transition-all"
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
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg transition-all"
                style={{
                  background: '#0a0e14',
                  border: '1px solid #1e2530',
                  color: '#e6edf3',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#00ff88'}
                onBlur={(e) => e.target.style.borderColor = '#1e2530'}
                placeholder="Your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #00ff88, #00cc6a)',
                color: '#0a0e14',
                boxShadow: '0 0 20px rgba(0, 255, 136, 0.3)',
                marginTop: '2rem'
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
              {loading ? 'Logging in...' : 'Log In →'}
            </button>
          </form>

          <p className="text-center mt-6" style={{ color: '#8b949e', fontSize: '0.9rem' }}>
            Don't have an account?{' '}
            <Link
              href="/signup"
              style={{ color: '#00ff88', textDecoration: 'none', fontWeight: 600 }}
              onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
