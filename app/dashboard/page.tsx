'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    checkUser();

    // Check for success parameter
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      setShowSuccess(true);
      // Remove success param from URL
      window.history.replaceState({}, '', '/dashboard');
      // Hide after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000);
    }
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      setUser(user);

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setProfile(profileData);
    } catch (error) {
      console.error('Error loading user:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Calculate days to separation
  const getDaysToSeparation = () => {
    if (!profile?.separation_date) return null;
    const today = new Date();
    const sepDate = new Date(profile.separation_date);
    const diffTime = sepDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Calculate runway
  const getRunway = () => {
    if (!profile?.current_savings || !profile?.monthly_expenses) return 0;
    return parseFloat((profile.current_savings / profile.monthly_expenses).toFixed(1));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0e14' }}>
        <div style={{ color: '#8b949e' }}>Loading...</div>
      </div>
    );
  }

  const runway = getRunway();
  const daysToSep = getDaysToSeparation();

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
        <div className="nav-container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #00ff88, #00aaff)',
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
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
          
          {/* Desktop Navigation */}
          <div className="desktop-nav" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <Link href="/dashboard" style={{ color: '#8b949e', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>
              Dashboard
            </Link>
            <Link href="/about" style={{ color: '#8b949e', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>
              About
            </Link>
            <Link href="/profile" style={{ color: '#8b949e', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>
              Profile
            </Link>
            <Link href="/assessment" style={{ color: '#8b949e', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>
              Assessment
            </Link>
            <Link href="/checklist" style={{ color: '#8b949e', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>
              Checklist
            </Link>
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
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'none',
              flexDirection: 'column',
              gap: '4px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem'
            }}
          >
            <div style={{ width: '24px', height: '2px', background: '#e6edf3', transition: 'all 0.3s' }} />
            <div style={{ width: '24px', height: '2px', background: '#e6edf3', transition: 'all 0.3s' }} />
            <div style={{ width: '24px', height: '2px', background: '#e6edf3', transition: 'all 0.3s' }} />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="mobile-menu" style={{
            display: 'none',
            flexDirection: 'column',
            gap: '0.5rem',
            padding: '1rem 2rem',
            background: '#0a0e14',
            borderTop: '1px solid #1e2530'
          }}>
            <Link href="/dashboard" style={{ color: '#8b949e', textDecoration: 'none', fontWeight: 500, padding: '0.75rem 0' }}>
              Dashboard
            </Link>
            <Link href="/about" style={{ color: '#8b949e', textDecoration: 'none', fontWeight: 500, padding: '0.75rem 0' }}>
              About
            </Link>
            <Link href="/profile" style={{ color: '#8b949e', textDecoration: 'none', fontWeight: 500, padding: '0.75rem 0' }}>
              Profile
            </Link>
            <Link href="/assessment" style={{ color: '#8b949e', textDecoration: 'none', fontWeight: 500, padding: '0.75rem 0' }}>
              Assessment
            </Link>
            <Link href="/checklist" style={{ color: '#8b949e', textDecoration: 'none', fontWeight: 500, padding: '0.75rem 0' }}>
              Checklist
            </Link>
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
                width: '100%'
              }}
            >
              Logout
            </button>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <div className="main-content" style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem', position: 'relative', zIndex: 1 }}>
        {/* Success Banner */}
        {showSuccess && (
          <div style={{
            marginBottom: '2rem',
            padding: '1rem 1.5rem',
            background: 'rgba(0, 255, 136, 0.1)',
            border: '2px solid #00ff88',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            animation: 'slideDown 0.3s ease-out'
          }}>
            <span style={{ fontSize: '1.5rem' }}>🎉</span>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#00ff88', fontWeight: 600, marginBottom: '0.25rem' }}>
                Welcome to Pro!
              </div>
              <div style={{ color: '#8b949e', fontSize: '0.9rem' }}>
                Your subscription is now active. Enjoy 50 assessments, 500 AI messages, and more!
              </div>
            </div>
            <button
              onClick={() => setShowSuccess(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#8b949e',
                cursor: 'pointer',
                fontSize: '1.5rem',
                padding: '0.25rem'
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* Header */}
        <div style={{ marginBottom: '3rem' }}>
          <h1 className="page-title" style={{ fontSize: '2rem', marginBottom: '0.5rem', color: '#e6edf3' }}>
            Welcome back, {profile?.name?.split(' ')[0] || 'User'}
          </h1>
          <div className="status-bar" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem 1.5rem',
            background: '#151921',
            border: '1px solid #1e2530',
            borderRadius: '8px',
            marginTop: '1rem',
            flexWrap: 'wrap'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.85rem'
            }}>
              <span style={{ color: '#6e7681' }}>STATUS:</span>
              <span style={{ color: '#00ff88', fontWeight: 600 }}>ACTIVE TRANSITION</span>
            </div>
            {daysToSep !== null && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.85rem'
              }}>
                <span style={{ color: '#6e7681' }}>ETS:</span>
                <span style={{ color: '#00ff88', fontWeight: 600 }}>{daysToSep} DAYS</span>
              </div>
            )}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.85rem'
            }}>
              <span style={{ color: '#6e7681' }}>ASSESSMENTS:</span>
              <span style={{ color: '#00ff88', fontWeight: 600 }}>0 SAVED</span>
            </div>
          </div>
        </div>

        <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem' }}>
          {/* Left Column */}
          <div>
            {/* Action Cards */}
            <div className="action-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
              <Link
                href="/assessment"
                className="action-card"
                style={{
                  background: '#151921',
                  border: '1px solid #1e2530',
                  borderRadius: '8px',
                  padding: '2rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#00ff88';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#1e2530';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
                <h3 style={{ color: '#e6edf3', marginBottom: '0.5rem' }}>Assess Job Fit</h3>
                <p style={{ color: '#8b949e', fontSize: '0.9rem' }}>Upload resume & analyze job fit with AI-powered stability scoring</p>
              </Link>

              <Link
                href="/chat"
                className="action-card"
                style={{
                  background: '#151921',
                  border: '1px solid #1e2530',
                  borderRadius: '8px',
                  padding: '2rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  textDecoration: 'none',
                  display: 'block'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#00ff88';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#1e2530';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💬</div>
                <h3 style={{ color: '#e6edf3', marginBottom: '0.5rem' }}>Ask Transition Question</h3>
                <p style={{ color: '#8b949e', fontSize: '0.9rem' }}>Get AI-powered career guidance with your profile context</p>
              </Link>

              <Link
                href="/plan"
                className="action-card action-card-full"
                style={{
                  background: '#151921',
                  border: '1px solid #1e2530',
                  borderRadius: '8px',
                  padding: '2rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  textDecoration: 'none',
                  display: 'block',
                  gridColumn: 'span 2'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#00ff88';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#1e2530';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📅</div>
                <h3 style={{ color: '#e6edf3', marginBottom: '0.5rem' }}>Build 90-Day Plan</h3>
                <p style={{ color: '#8b949e', fontSize: '0.9rem' }}>Structured milestones for your transition timeline</p>
              </Link>

              <Link
                href="/checklist"
                className="action-card action-card-full"
                style={{
                  background: '#151921',
                  border: '1px solid #1e2530',
                  borderRadius: '8px',
                  padding: '2rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  textDecoration: 'none',
                  display: 'block',
                  gridColumn: 'span 2'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#ffb800';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#1e2530';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
                    <h3 style={{ color: '#e6edf3', marginBottom: '0.5rem' }}>Transition Checklist</h3>
                    <p style={{ color: '#8b949e', fontSize: '0.9rem' }}>Track your DD-214, VA claims, benefits enrollment, and 10 other critical steps</p>
                  </div>
                  {(profile?.document_checklist || profile?.benefits_checklist) && (() => {
                    const docDone = Object.values(profile.document_checklist || {}).filter(Boolean).length;
                    const benDone = Object.values(profile.benefits_checklist || {}).filter(Boolean).length;
                    const total = docDone + benDone;
                    const max = 20;
                    const pct = Math.round((total / max) * 100);
                    return (
                      <div className="checklist-progress" style={{ textAlign: 'right', flexShrink: 0, marginLeft: '2rem' }}>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.5rem', fontWeight: 700, color: pct === 100 ? '#00ff88' : '#ffb800' }}>
                          {pct}%
                        </div>
                        <div style={{ color: '#6e7681', fontSize: '0.8rem' }}>{total}/20 complete</div>
                      </div>
                    );
                  })()}
                </div>
              </Link>
            </div>

            {/* Recent Assessments */}
            <div className="dashboard-card" style={{ background: '#151921', border: '1px solid #1e2530', borderRadius: '8px', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #1e2530' }}>
                <h3 style={{
                  fontSize: '1.1rem',
                  fontFamily: "'JetBrains Mono', monospace",
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#e6edf3'
                }}>
                  Recent Assessments
                </h3>
                <a href="#" style={{ color: '#8b949e', textDecoration: 'none', fontSize: '0.9rem' }}>View All →</a>
              </div>
              <div style={{ textAlign: 'center', padding: '3rem 0', color: '#6e7681' }}>
                No assessments yet. Start by analyzing a job offer!
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div>
            {/* Runway Widget */}
            <div className="dashboard-card" style={{
              background: 'linear-gradient(135deg, #151921, #0a0e14)',
              border: '1px solid #1e2530',
              borderRadius: '8px',
              padding: '2rem',
              marginBottom: '2rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', fontWeight: 700, color: '#e6edf3', marginBottom: '0.5rem' }}>
                {runway ? runway.toFixed(1) : '0'}<span style={{ fontSize: '1.5rem', color: '#6e7681' }}>mo</span>
              </div>
              <div style={{ color: '#8b949e', marginBottom: '1rem' }}>Current Financial Runway</div>
              <div style={{
                width: '100%',
                height: '8px',
                background: '#1e2530',
                borderRadius: '4px',
                overflow: 'hidden',
                marginBottom: '1rem'
              }}>
                <div style={{
                  width: `${Math.min((runway / 6) * 100, 100)}%`,
                  height: '100%',
                  background: runway >= 6 ? '#00ff88' : '#ffb800',
                  transition: 'width 0.3s'
                }} />
              </div>
              {runway < 6 && (
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffb800',
                  fontSize: '0.9rem'
                }}>
                  <span>⚠️</span>
                  <span>Build to 6+ months recommended</span>
                </div>
              )}
            </div>

            {/* Usage Meters */}
            <div className="dashboard-card" style={{ background: '#151921', border: '1px solid #1e2530', borderRadius: '8px', padding: '2rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #1e2530' }}>
                <h3 style={{
                  fontSize: '1.1rem',
                  fontFamily: "'JetBrains Mono', monospace",
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#e6edf3',
                  margin: 0
                }}>
                  Monthly Usage
                </h3>
                <span style={{
                  fontSize: '0.75rem',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '4px',
                  background: profile?.subscription_tier === 'pro' ? 'rgba(0, 255, 136, 0.15)' : 'rgba(110, 118, 129, 0.15)',
                  color: profile?.subscription_tier === 'pro' ? '#00ff88' : '#6e7681',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 600
                }}>
                  {profile?.subscription_tier === 'pro' ? 'PRO' : 'FREE'}
                </span>
              </div>
              {(() => {
                const isPro = profile?.subscription_tier === 'pro'
                const limits = isPro
                  ? { assessment: 50, chat: 500, plan: 5, resume: 5 }
                  : { assessment: 3, chat: 10, plan: 1, resume: 3 }

                const meters = [
                  { label: 'Assessments', used: profile?.usage_assessments_month ?? 0, limit: limits.assessment },
                  { label: 'Chat Messages', used: profile?.usage_chat_month ?? 0, limit: limits.chat },
                  { label: '90-Day Plans', used: profile?.usage_plan_count ?? 0, limit: limits.plan },
                  { label: 'Resume Uploads', used: profile?.usage_resume_month ?? 0, limit: limits.resume },
                ]

                return (
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    {meters.map(({ label, used, limit }) => {
                      const pct = Math.min((used / limit) * 100, 100)
                      const isWarning = pct >= 80
                      const isMaxed = pct >= 100
                      const barColor = isMaxed ? '#ff6b6b' : isWarning ? '#ffb800' : '#00ff88'
                      return (
                        <div key={label}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                            <span style={{ color: '#8b949e', fontSize: '0.85rem' }}>{label}</span>
                            <span style={{
                              fontFamily: "'JetBrains Mono', monospace",
                              fontSize: '0.85rem',
                              color: isMaxed ? '#ff6b6b' : '#e6edf3'
                            }}>
                              {used}/{limit}
                            </span>
                          </div>
                          <div style={{ height: '6px', background: '#1e2530', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{
                              width: `${pct}%`,
                              height: '100%',
                              background: barColor,
                              borderRadius: '3px',
                              transition: 'width 0.3s'
                            }} />
                          </div>
                        </div>
                      )
                    })}
                    <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #1e2530', fontSize: '0.8rem', color: '#6e7681', textAlign: 'center' }}>
                      Resets 1st of each month
                      {!isPro && (
                        <> · <Link href="/pricing" style={{ color: '#00aaff', textDecoration: 'none', cursor: 'pointer' }}>Upgrade for more</Link></>
                      )}
                    </div>
                    {isPro && (
                      <button
                        onClick={async () => {
                          try {
                            const { data: { session } } = await supabase.auth.getSession()
                            const response = await fetch('/api/stripe/portal', {
                              method: 'POST',
                              headers: {
                                'Authorization': `Bearer ${session?.access_token}`
                              }
                            })
                            const { url } = await response.json()
                            if (url) window.location.href = url
                          } catch (error) {
                            console.error('Portal error:', error)
                            alert('Failed to open subscription portal')
                          }
                        }}
                        style={{
                          marginTop: '1rem',
                          width: '100%',
                          padding: '0.75rem',
                          background: '#1e2530',
                          border: '1px solid #30363d',
                          borderRadius: '6px',
                          color: '#00ff88',
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#2d333b'
                          e.currentTarget.style.borderColor = '#00ff88'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#1e2530'
                          e.currentTarget.style.borderColor = '#30363d'
                        }}
                      >
                        ⚙️ Manage Subscription
                      </button>
                    )}
                  </div>
                )
              })()}
            </div>

            {/* Financial Snapshot */}
            <div className="dashboard-card" style={{ background: '#151921', border: '1px solid #1e2530', borderRadius: '8px', padding: '2rem' }}>
              <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #1e2530' }}>
                <h3 style={{
                  fontSize: '1.1rem',
                  fontFamily: "'JetBrains Mono', monospace",
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#e6edf3'
                }}>
                  Financial Snapshot
                </h3>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #1e2530' }}>
                <span style={{ color: '#8b949e' }}>Emergency Fund</span>
                <span style={{ color: '#e6edf3', fontWeight: 600 }}>
                  ${profile?.current_savings?.toLocaleString() || '0'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #1e2530' }}>
                <span style={{ color: '#8b949e' }}>Monthly Expenses</span>
                <span style={{ color: '#e6edf3', fontWeight: 600 }}>
                  ${profile?.monthly_expenses?.toLocaleString() || '0'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#8b949e' }}>VA Disability</span>
                <span style={{ color: '#e6edf3', fontWeight: 600 }}>
                  ${profile?.va_disability?.toLocaleString() || '0'}/mo
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .nav-container {
            padding: 1rem !important;
          }

          .desktop-nav {
            display: none !important;
          }

          .mobile-menu-btn {
            display: flex !important;
          }

          .mobile-menu {
            display: flex !important;
          }

          .main-content {
            padding: 1rem !important;
          }

          .page-title {
            fontSize: 1.5rem !important;
          }

          .status-bar {
            padding: 0.75rem 1rem !important;
            gap: 0.75rem !important;
          }

          .status-bar > div {
            fontSize: 0.75rem !important;
          }

          .dashboard-grid {
            gridTemplateColumns: 1fr !important;
            gap: 1.5rem !important;
          }

          .action-cards {
            gridTemplateColumns: 1fr !important;
            gap: 1rem !important;
          }

          .action-card {
            padding: 1.5rem !important;
          }

          .action-card-full {
            gridColumn: span 1 !important;
          }

          .checklist-progress {
            marginLeft: 0 !important;
            marginTop: 1rem !important;
          }

          .dashboard-card {
            padding: 1.5rem !important;
          }
        }

        @media (max-width: 480px) {
          .nav-container {
            padding: 0.75rem 1rem !important;
          }

          .page-title {
            fontSize: 1.25rem !important;
          }

          .status-bar {
            flexDirection: column !important;
            alignItems: flex-start !important;
            gap: 0.5rem !important;
          }

          .action-card {
            padding: 1.25rem !important;
          }

          .action-card h3 {
            fontSize: 1rem !important;
          }

          .action-card p {
            fontSize: 0.85rem !important;
          }

          .dashboard-card {
            padding: 1.25rem !important;
          }
        }
      `}</style>
    </div>
  );
}
