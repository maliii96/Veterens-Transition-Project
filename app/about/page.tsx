'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { BarChart3, DollarSign, Scale, Target, Check } from 'lucide-react';

export default function AboutPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              textDecoration: 'none',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                background: '#FBBF24',
                clipPath:
                  'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
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

          {/* Desktop Navigation */}
          <div
            style={{
              display: 'flex',
              gap: '2rem',
              alignItems: 'center',
            }}
            className="nav-links-desktop"
          >
            <Link
              href="/"
              style={{
                color: '#94A3B8',
                textDecoration: 'none',
                fontWeight: 500,
                fontSize: '0.9rem',
              }}
            >
              Home
            </Link>
            <Link
              href="/about"
              style={{
                color: '#FBBF24',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            >
              About
            </Link>
            <Link
              href="/dashboard"
              style={{
                color: '#94A3B8',
                textDecoration: 'none',
                fontWeight: 500,
                fontSize: '0.9rem',
              }}
            >
              Dashboard
            </Link>
            <Link
              href="/signup"
              style={{
                padding: '0.6rem 1.25rem',
                borderRadius: '8px',
                fontWeight: 600,
                background: '#FBBF24',
                color: '#060A12',
                textDecoration: 'none',
                fontSize: '0.9rem',
                whiteSpace: 'nowrap',
                boxShadow: '0 0 16px rgba(251,191,36,0.3)',
              }}
            >
              Get Started →
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              color: '#F8FAFC',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.5rem',
            }}
            className="mobile-menu-button"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '1rem',
              background: 'rgba(6,10,18,0.98)',
              borderTop: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                color: '#94A3B8',
                textDecoration: 'none',
                fontWeight: 500,
                padding: '1rem',
              }}
            >
              Home
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                color: '#FBBF24',
                textDecoration: 'none',
                fontWeight: 600,
                padding: '1rem',
              }}
            >
              About
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                color: '#94A3B8',
                textDecoration: 'none',
                fontWeight: 500,
                padding: '1rem',
              }}
            >
              Dashboard
            </Link>
            <Link
              href="/signup"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontWeight: 600,
                background: '#FBBF24',
                color: '#060A12',
                textDecoration: 'none',
                fontSize: '0.95rem',
                textAlign: 'center',
                display: 'block',
                marginTop: '0.5rem',
                boxShadow: '0 0 16px rgba(251,191,36,0.3)',
              }}
            >
              Get Started →
            </Link>
          </div>
        )}
      </nav>

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '2rem 1.5rem 4rem',
        }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '3rem' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.4rem 1rem',
                border: '1px solid rgba(251,191,36,0.3)',
                background: 'rgba(251,191,36,0.08)',
                borderRadius: '50px',
                fontSize: '0.8rem',
                color: '#FBBF24',
                marginBottom: '1.5rem',
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
              MISSION BRIEF
            </div>
            <h1
              style={{
                fontFamily: 'var(--font-space-grotesk), sans-serif',
                fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
                fontWeight: 700,
                lineHeight: 1.2,
                marginBottom: '1rem',
                color: '#F8FAFC',
              }}
            >
              You Planned Every Mission.
              <br />
              Why Wing Your Next Job?
            </h1>
          </div>

          {/* Story Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* The Problem */}
            <div
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                padding: '2rem',
                position: 'relative',
                borderLeft: '3px solid #FBBF24',
              }}
            >
              <h2
                style={{
                  fontFamily: 'var(--font-space-grotesk), sans-serif',
                  fontSize: '1.75rem',
                  fontWeight: 700,
                  color: '#FBBF24',
                  marginBottom: '1.25rem',
                }}
              >
                The Problem
              </h2>
              <p
                style={{
                  fontSize: '1.05rem',
                  lineHeight: 1.7,
                  color: '#94A3B8',
                  marginBottom: '1.25rem',
                }}
              >
                You spent years learning to assess threats, calculate risks, and execute with precision.
                But when it comes to your transition, you're expected to take the biggest career decision
                of your life on gut feeling and a recruiter's pitch.
              </p>
              <p
                style={{
                  fontSize: '1.05rem',
                  lineHeight: 1.7,
                  color: '#94A3B8',
                  marginBottom: '1.25rem',
                }}
              >
                <strong style={{ color: '#FBBF24' }}>Sound familiar?</strong>
              </p>
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: '1.5rem 0',
                }}
              >
                {[
                  "Company says they're \"growing fast\" — but you have no idea if they're profitable or burning cash",
                  'Recruiter promises "competitive pay" — but you don\'t know if you can survive a layoff',
                  'Everyone tells you "it\'s a great opportunity" — but nobody shows you the data',
                ].map((item, i) => (
                  <li
                    key={i}
                    style={{
                      fontSize: '1.05rem',
                      lineHeight: 1.6,
                      color: '#94A3B8',
                      marginBottom: '0.75rem',
                      paddingLeft: '1.75rem',
                      position: 'relative',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        left: 0,
                        color: '#FBBF24',
                        fontWeight: 700,
                      }}
                    >
                      ▸
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <p
                style={{
                  fontSize: '1.05rem',
                  lineHeight: 1.7,
                  color: '#94A3B8',
                  marginBottom: 0,
                }}
              >
                We planned every patrol down to the last detail. We rehearsed contingencies. We never went in blind.
                <br />
                <br />
                <strong style={{ color: '#F8FAFC' }}>So why are we doing exactly that with our careers?</strong>
              </p>
            </div>

            {/* Why I Built This */}
            <div
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                padding: '2rem',
                position: 'relative',
                borderLeft: '3px solid #FBBF24',
              }}
            >
              <h2
                style={{
                  fontFamily: 'var(--font-space-grotesk), sans-serif',
                  fontSize: '1.75rem',
                  fontWeight: 700,
                  color: '#FBBF24',
                  marginBottom: '1.25rem',
                }}
              >
                Why I Built This
              </h2>
              <p
                style={{
                  fontSize: '1.05rem',
                  lineHeight: 1.7,
                  color: '#94A3B8',
                  marginBottom: '1.25rem',
                }}
              >
                After I separated, I watched too many brothers and sisters take jobs that looked good on paper
                but fell apart within months. Layoffs. Toxic leadership. Companies that didn't give a damn about veterans
                beyond the PR value.
              </p>
              <p
                style={{
                  fontSize: '1.05rem',
                  lineHeight: 1.7,
                  color: '#94A3B8',
                  marginBottom: '1.25rem',
                }}
              >
                The pattern was clear:{' '}
                <strong style={{ color: '#ef4444' }}>we were making life-changing decisions without intel.</strong>
              </p>
              <p
                style={{
                  fontSize: '1.05rem',
                  lineHeight: 1.7,
                  color: '#94A3B8',
                  marginBottom: '1.25rem',
                }}
              >
                SITREP exists because you deserve better. You deserve to know:
              </p>
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: '1.5rem 0',
                }}
              >
                {[
                  <><strong>Is this job a good fit for me?</strong> AI-powered analysis of your skills vs. job requirements</>,
                  <><strong>Can I survive financially if this goes south?</strong> Calculate your runway based on real numbers</>,
                  <><strong>How stable is my career trajectory?</strong> Analyze your work history patterns and get personalized recommendations</>,
                ].map((item, i) => (
                  <li
                    key={i}
                    style={{
                      fontSize: '1.05rem',
                      lineHeight: 1.6,
                      color: '#94A3B8',
                      marginBottom: '0.75rem',
                      paddingLeft: '1.75rem',
                      position: 'relative',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        left: 0,
                        color: '#FBBF24',
                        fontWeight: 700,
                      }}
                    >
                      ▸
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <p
                style={{
                  fontSize: '1.05rem',
                  lineHeight: 1.7,
                  color: '#94A3B8',
                  marginBottom: 0,
                }}
              >
                This isn't LinkedIn motivation BS. This is operational planning for your transition.
              </p>
            </div>

            {/* How It Helps You */}
            <div
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                padding: '2rem',
                position: 'relative',
                borderLeft: '3px solid #FBBF24',
              }}
            >
              <h2
                style={{
                  fontFamily: 'var(--font-space-grotesk), sans-serif',
                  fontSize: '1.75rem',
                  fontWeight: 700,
                  color: '#FBBF24',
                  marginBottom: '1.25rem',
                }}
              >
                How It Helps You
              </h2>
              <p
                style={{
                  fontSize: '1.05rem',
                  lineHeight: 1.7,
                  color: '#94A3B8',
                  marginBottom: '1.5rem',
                }}
              >
                SITREP gives you the intelligence you need to make confident decisions:
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '1.25rem',
                  marginTop: '1.5rem',
                }}
              >
                {[
                  {
                    Icon: BarChart3,
                    title: 'AI-Powered Job Fit Analysis',
                    desc: 'Upload your resume and paste any job description. Get instant analysis of skills match, experience alignment, and personalized recommendations — no guesswork.',
                  },
                  {
                    Icon: DollarSign,
                    title: 'Financial Runway Calculator',
                    desc: 'Input your savings, expenses, and benefits. Know exactly how long you can survive if the job doesn\'t work out. Plan for the worst, hope for the best.',
                  },
                  {
                    Icon: Scale,
                    title: 'Career Stability Scoring',
                    desc: 'Get honest feedback on your work history patterns. Identify red flags like job-hopping, highlight your strengths, and understand how employers will view your career trajectory.',
                  },
                  {
                    Icon: Target,
                    title: 'Risk Assessment',
                    desc: 'Get a clear risk score for each opportunity. Red flags, green lights, and everything in between — presented the way we\'re used to getting briefings.',
                  },
                ].map(({ Icon, title, desc }, i) => (
                  <div
                    key={i}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '12px',
                      padding: '1.5rem',
                    }}
                  >
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        background: 'rgba(251,191,36,0.12)',
                        border: '1px solid rgba(251,191,36,0.2)',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1rem',
                      }}
                    >
                      <Icon size={20} color="#FBBF24" />
                    </div>
                    <h3
                      style={{
                        fontFamily: 'var(--font-space-grotesk), sans-serif',
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: '#F8FAFC',
                        marginBottom: '0.5rem',
                      }}
                    >
                      {title}
                    </h3>
                    <p
                      style={{
                        fontSize: '0.9rem',
                        lineHeight: 1.6,
                        color: '#64748B',
                      }}
                    >
                      {desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Built By Veterans */}
            <div
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                padding: '2rem',
                position: 'relative',
                borderLeft: '3px solid #FBBF24',
              }}
            >
              <h2
                style={{
                  fontFamily: 'var(--font-space-grotesk), sans-serif',
                  fontSize: '1.75rem',
                  fontWeight: 700,
                  color: '#FBBF24',
                  marginBottom: '1.25rem',
                }}
              >
                Built By Veterans, For Veterans
              </h2>
              <p
                style={{
                  fontSize: '1.05rem',
                  lineHeight: 1.7,
                  color: '#94A3B8',
                  marginBottom: '1.25rem',
                }}
              >
                This platform was created by someone who's been exactly where you are. I know what it's like to
                translate your MOS into civilian speak, to wonder if you're underselling yourself, to feel lost
                in a world that doesn't understand what you bring to the table.
              </p>
              <p
                style={{
                  fontSize: '1.05rem',
                  lineHeight: 1.7,
                  color: '#94A3B8',
                  marginBottom: '1.25rem',
                }}
              >
                SITREP doesn't solve every transition challenge. But it gives you one thing you didn't have before:
                <strong style={{ color: '#FBBF24' }}> actionable intelligence on the jobs you're considering.</strong>
              </p>
              <p
                style={{
                  fontSize: '1.05rem',
                  lineHeight: 1.7,
                  color: '#94A3B8',
                  marginBottom: 0,
                }}
              >
                You planned every mission. Now plan your transition with the same level of precision.
              </p>
            </div>

            {/* CTA Section */}
            <div
              style={{
                border: '1px solid rgba(251,191,36,0.25)',
                background: 'rgba(251,191,36,0.05)',
                borderRadius: '16px',
                padding: '2.5rem',
                textAlign: 'center',
                marginTop: '1rem',
              }}
            >
              <h2
                style={{
                  fontFamily: 'var(--font-space-grotesk), sans-serif',
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: '#F8FAFC',
                  marginBottom: '1rem',
                }}
              >
                Ready to Get Your SITREP?
              </h2>
              <p
                style={{
                  fontSize: '1.05rem',
                  color: '#94A3B8',
                  marginBottom: '2rem',
                  maxWidth: '560px',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  lineHeight: 1.6,
                }}
              >
                Stop guessing. Start planning. Assess your next opportunity with the same rigor you applied to every mission.
              </p>
              <div
                style={{
                  display: 'flex',
                  gap: '1rem',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <Link
                  href="/signup"
                  style={{
                    padding: '0.8rem 1.75rem',
                    borderRadius: '8px',
                    fontWeight: 600,
                    background: '#FBBF24',
                    color: '#060A12',
                    boxShadow: '0 0 20px rgba(251,191,36,0.35)',
                    textDecoration: 'none',
                    fontSize: '0.95rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Start Free Assessment →
                </Link>
                <Link
                  href="/dashboard"
                  style={{
                    padding: '0.8rem 1.75rem',
                    borderRadius: '8px',
                    fontWeight: 600,
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#F8FAFC',
                    textDecoration: 'none',
                    fontSize: '0.95rem',
                    whiteSpace: 'nowrap',
                  }}
                >
                  See How It Works
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .nav-links-desktop {
            display: none !important;
          }
          .mobile-menu-button {
            display: block !important;
          }
        }
        @media (min-width: 769px) {
          .mobile-menu-button {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
