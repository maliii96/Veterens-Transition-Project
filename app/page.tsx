'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: '#0a0e14' }}>
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

      {/* Navigation */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(10, 14, 20, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid #1e2530'
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #00ff88, #00aaff)',
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
              animation: 'pulse 3s ease-in-out infinite',
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
          </div>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <Link href="/" style={{ color: '#8b949e', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>
              Home
            </Link>
            <Link href="/dashboard" style={{ color: '#8b949e', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>
              Dashboard
            </Link>
            <Link
              href="/login"
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '6px',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #00ff88, #00cc6a)',
                color: '#0a0e14',
                boxShadow: '0 0 20px rgba(0, 255, 136, 0.3)',
                textDecoration: 'none',
                fontSize: '0.95rem'
              }}
            >
              Launch Platform →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ position: 'relative', padding: '8rem 2rem 6rem', maxWidth: '1400px', margin: '0 auto', zIndex: 1 }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          background: '#151921',
          border: '1px solid #1e2530',
          borderRadius: '50px',
          fontSize: '0.85rem',
          color: '#00ff88',
          marginBottom: '2rem',
          fontFamily: "'JetBrains Mono', monospace"
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            background: '#00ff88',
            borderRadius: '50%',
            animation: 'blink 2s ease-in-out infinite'
          }} />
          <span>OPERATIONAL // 1,200+ VETERANS SUPPORTED</span>
        </div>

        {/* Heading */}
        <h1 style={{
          fontSize: '4.5rem',
          fontWeight: 700,
          lineHeight: 1.1,
          marginBottom: '1.5rem',
          background: 'linear-gradient(135deg, #e6edf3, #00ff88)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Don't Take Your<br />Next Job Blind
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: '1.5rem',
          color: '#8b949e',
          marginBottom: '3rem',
          maxWidth: '700px',
          lineHeight: 1.6
        }}>
          Data-driven job security analysis for transitioning service members.
          Assess stability, calculate financial runway, compare offers—all in one platform.
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '4rem' }}>
          <Link
            href="/signup"
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #00ff88, #00cc6a)',
              color: '#0a0e14',
              boxShadow: '0 0 20px rgba(0, 255, 136, 0.3)',
              textDecoration: 'none',
              fontSize: '0.95rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            Start Your Assessment →
          </Link>
          <Link
            href="/dashboard"
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              fontWeight: 600,
              background: 'transparent',
              border: '2px solid #1e2530',
              color: '#e6edf3',
              textDecoration: 'none',
              fontSize: '0.95rem'
            }}
          >
            See How It Works
          </Link>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '2rem',
          maxWidth: '900px'
        }}>
          <div style={{
            background: '#151921',
            border: '1px solid #1e2530',
            padding: '1.5rem',
            borderRadius: '8px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, #00ff88, #00aaff)'
            }} />
            <div style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              fontFamily: "'JetBrains Mono', monospace",
              color: '#00ff88',
              marginBottom: '0.25rem'
            }}>
              8.2/10
            </div>
            <div style={{
              fontSize: '0.9rem',
              color: '#6e7681',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Avg Stability Score
            </div>
          </div>

          <div style={{
            background: '#151921',
            border: '1px solid #1e2530',
            padding: '1.5rem',
            borderRadius: '8px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, #00ff88, #00aaff)'
            }} />
            <div style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              fontFamily: "'JetBrains Mono', monospace",
              color: '#00ff88',
              marginBottom: '0.25rem'
            }}>
              12.4mo
            </div>
            <div style={{
              fontSize: '0.9rem',
              color: '#6e7681',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Avg Financial Runway
            </div>
          </div>

          <div style={{
            background: '#151921',
            border: '1px solid #1e2530',
            padding: '1.5rem',
            borderRadius: '8px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, #00ff88, #00aaff)'
            }} />
            <div style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              fontFamily: "'JetBrains Mono', monospace",
              color: '#00ff88',
              marginBottom: '0.25rem'
            }}>
              2,800+
            </div>
            <div style={{
              fontSize: '0.9rem',
              color: '#6e7681',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Companies Analyzed
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
