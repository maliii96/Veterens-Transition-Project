'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import AppNav from '@/components/AppNav';
import { Zap, BarChart3, MessageSquare, CalendarClock, CheckSquare, Settings } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#060A12' }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            border: '3px solid rgba(251,191,36,0.2)',
            borderTop: '3px solid #FBBF24',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} />
          <div style={{ color: '#94A3B8', fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.9rem' }}>Loading...</div>
        </div>
        <style jsx>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  const runway = getRunway();
  const daysToSep = getDaysToSeparation();

  return (
    <div className="min-h-screen" style={{ background: '#060A12' }}>
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
          zIndex: 0
        }}
      />

      <AppNav current="/dashboard" />

      {/* Main Content */}
      <div className="main-content" style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem', position: 'relative', zIndex: 1 }}>
        {/* Success Banner */}
        {showSuccess && (
          <div style={{
            marginBottom: '2rem',
            padding: '1rem 1.5rem',
            background: 'rgba(251,191,36,0.1)',
            border: '1px solid rgba(251,191,36,0.3)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            animation: 'slideDown 0.3s ease-out'
          }}>
            <Zap size={20} style={{ color: '#FBBF24', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ color: '#FBBF24', fontWeight: 600, marginBottom: '0.25rem', fontFamily: 'var(--font-dm-sans), sans-serif' }}>
                Welcome to Pro!
              </div>
              <div style={{ color: '#94A3B8', fontSize: '0.9rem', fontFamily: 'var(--font-dm-sans), sans-serif' }}>
                Your subscription is now active. Enjoy 25 assessments, 100 AI messages, and more!
              </div>
            </div>
            <button
              onClick={() => setShowSuccess(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                fontSize: '1.5rem',
                padding: '0.25rem',
                lineHeight: 1
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* Header */}
        <div style={{ marginBottom: '3rem' }}>
          <h1 className="page-title" style={{
            fontSize: '2rem',
            marginBottom: '0.5rem',
            color: '#F8FAFC',
            fontFamily: 'var(--font-space-grotesk), sans-serif',
            fontWeight: 700
          }}>
            Welcome back, {profile?.name?.split(' ')[0] || 'User'}
          </h1>
          <div className="status-bar" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem 1.5rem',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
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
              <span style={{ color: '#64748B' }}>STATUS:</span>
              <span style={{ color: '#FBBF24', fontWeight: 600 }}>ACTIVE TRANSITION</span>
            </div>
            {daysToSep !== null && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.85rem'
              }}>
                <span style={{ color: '#64748B' }}>ETS:</span>
                <span style={{ color: '#FBBF24', fontWeight: 600 }}>{daysToSep} DAYS</span>
              </div>
            )}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.85rem'
            }}>
              <span style={{ color: '#64748B' }}>ASSESSMENTS:</span>
              <span style={{ color: '#FBBF24', fontWeight: 600 }}>0 SAVED</span>
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
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '16px',
                  padding: '2rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  textDecoration: 'none',
                  display: 'block'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.border = '1px solid rgba(251,191,36,0.4)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: 'rgba(251,191,36,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem'
                }}>
                  <BarChart3 size={22} style={{ color: '#FBBF24' }} />
                </div>
                <h3 style={{ color: '#F8FAFC', marginBottom: '0.5rem', fontFamily: 'var(--font-space-grotesk), sans-serif', fontWeight: 600 }}>Assess Job Fit</h3>
                <p style={{ color: '#94A3B8', fontSize: '0.9rem', fontFamily: 'var(--font-dm-sans), sans-serif', margin: 0 }}>Upload resume &amp; analyze job fit with AI-powered stability scoring</p>
              </Link>

              <Link
                href="/chat"
                className="action-card"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '16px',
                  padding: '2rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  textDecoration: 'none',
                  display: 'block'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.border = '1px solid rgba(251,191,36,0.4)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: 'rgba(251,191,36,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem'
                }}>
                  <MessageSquare size={22} style={{ color: '#FBBF24' }} />
                </div>
                <h3 style={{ color: '#F8FAFC', marginBottom: '0.5rem', fontFamily: 'var(--font-space-grotesk), sans-serif', fontWeight: 600 }}>Ask Transition Question</h3>
                <p style={{ color: '#94A3B8', fontSize: '0.9rem', fontFamily: 'var(--font-dm-sans), sans-serif', margin: 0 }}>Get AI-powered career guidance with your profile context</p>
              </Link>

              <Link
                href="/plan"
                className="action-card action-card-full"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '16px',
                  padding: '2rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  textDecoration: 'none',
                  display: 'block',
                  gridColumn: 'span 2'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.border = '1px solid rgba(251,191,36,0.4)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: 'rgba(251,191,36,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem'
                }}>
                  <CalendarClock size={22} style={{ color: '#FBBF24' }} />
                </div>
                <h3 style={{ color: '#F8FAFC', marginBottom: '0.5rem', fontFamily: 'var(--font-space-grotesk), sans-serif', fontWeight: 600 }}>Build 90-Day Plan</h3>
                <p style={{ color: '#94A3B8', fontSize: '0.9rem', fontFamily: 'var(--font-dm-sans), sans-serif', margin: 0 }}>Structured milestones for your transition timeline</p>
              </Link>

              <Link
                href="/checklist"
                className="action-card action-card-full"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '16px',
                  padding: '2rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  textDecoration: 'none',
                  display: 'block',
                  gridColumn: 'span 2'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.border = '1px solid rgba(251,191,36,0.4)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '10px',
                      background: 'rgba(251,191,36,0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1rem'
                    }}>
                      <CheckSquare size={22} style={{ color: '#FBBF24' }} />
                    </div>
                    <h3 style={{ color: '#F8FAFC', marginBottom: '0.5rem', fontFamily: 'var(--font-space-grotesk), sans-serif', fontWeight: 600 }}>Transition Checklist</h3>
                    <p style={{ color: '#94A3B8', fontSize: '0.9rem', fontFamily: 'var(--font-dm-sans), sans-serif', margin: 0 }}>Track your DD-214, VA claims, benefits enrollment, and 10 other critical steps</p>
                  </div>
                  {(profile?.document_checklist || profile?.benefits_checklist) && (() => {
                    const docDone = Object.values(profile.document_checklist || {}).filter(Boolean).length;
                    const benDone = Object.values(profile.benefits_checklist || {}).filter(Boolean).length;
                    const total = docDone + benDone;
                    const max = 20;
                    const pct = Math.round((total / max) * 100);
                    return (
                      <div className="checklist-progress" style={{ textAlign: 'right', flexShrink: 0, marginLeft: '2rem' }}>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.5rem', fontWeight: 700, color: pct === 100 ? '#FBBF24' : '#f59e0b' }}>
                          {pct}%
                        </div>
                        <div style={{ color: '#64748B', fontSize: '0.8rem' }}>{total}/20 complete</div>
                      </div>
                    );
                  })()}
                </div>
              </Link>
            </div>

            {/* Recent Assessments */}
            <div className="dashboard-card" style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '2rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 style={{
                  fontSize: '1.1rem',
                  fontFamily: 'var(--font-space-grotesk), sans-serif',
                  fontWeight: 600,
                  color: '#F8FAFC',
                  margin: 0
                }}>
                  Recent Assessments
                </h3>
                <a href="#" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.9rem', fontFamily: 'var(--font-dm-sans), sans-serif' }}>View All →</a>
              </div>
              <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748B', fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.9rem' }}>
                No assessments yet. Start by analyzing a job offer!
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div>
            {/* Runway Widget */}
            <div className="dashboard-card" style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '2rem',
              marginBottom: '2rem',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '3rem',
                fontWeight: 700,
                color: '#F8FAFC',
                marginBottom: '0.5rem',
                fontFamily: 'var(--font-space-grotesk), sans-serif'
              }}>
                {runway ? runway.toFixed(1) : '0'}<span style={{ fontSize: '1.5rem', color: '#FBBF24', fontFamily: 'var(--font-space-grotesk), sans-serif' }}>mo</span>
              </div>
              <div style={{ color: '#94A3B8', marginBottom: '1rem', fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.9rem' }}>Current Financial Runway</div>
              <div style={{
                width: '100%',
                height: '8px',
                background: 'rgba(255,255,255,0.08)',
                borderRadius: '4px',
                overflow: 'hidden',
                marginBottom: '1rem'
              }}>
                <div style={{
                  width: `${Math.min((runway / 6) * 100, 100)}%`,
                  height: '100%',
                  background: runway >= 6 ? '#FBBF24' : '#f97316',
                  borderRadius: '4px',
                  transition: 'width 0.3s'
                }} />
              </div>
              {runway < 6 && (
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: runway < 3 ? '#f97316' : '#FBBF24',
                  fontSize: '0.875rem',
                  fontFamily: 'var(--font-dm-sans), sans-serif'
                }}>
                  <span>Build to 6+ months recommended</span>
                </div>
              )}
            </div>

            {/* Usage Meters */}
            <div className="dashboard-card" style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '2rem',
              marginBottom: '2rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 style={{
                  fontSize: '1.1rem',
                  fontFamily: 'var(--font-space-grotesk), sans-serif',
                  fontWeight: 600,
                  color: '#F8FAFC',
                  margin: 0
                }}>
                  Monthly Usage
                </h3>
                <span style={{
                  fontSize: '0.75rem',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '4px',
                  background: profile?.subscription_tier === 'pro' ? 'rgba(251,191,36,0.15)' : 'rgba(100,116,139,0.15)',
                  color: profile?.subscription_tier === 'pro' ? '#FBBF24' : '#64748B',
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
                      const barColor = isMaxed ? '#ef4444' : isWarning ? '#f97316' : '#FBBF24'
                      return (
                        <div key={label}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                            <span style={{ color: '#94A3B8', fontSize: '0.85rem', fontFamily: 'var(--font-dm-sans), sans-serif' }}>{label}</span>
                            <span style={{
                              fontFamily: "'JetBrains Mono', monospace",
                              fontSize: '0.85rem',
                              color: isMaxed ? '#ef4444' : '#F8FAFC'
                            }}>
                              {used}/{limit}
                            </span>
                          </div>
                          <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
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
                    <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '0.8rem', color: '#64748B', textAlign: 'center', fontFamily: 'var(--font-dm-sans), sans-serif' }}>
                      Resets 1st of each month
                      {!isPro && (
                        <> · <Link href="/pricing" style={{ color: '#FBBF24', textDecoration: 'none', cursor: 'pointer' }}>Upgrade for more</Link></>
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
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          color: '#94A3B8',
                          fontFamily: 'var(--font-dm-sans), sans-serif',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(251,191,36,0.4)'
                          e.currentTarget.style.color = '#F8FAFC'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                          e.currentTarget.style.color = '#94A3B8'
                        }}
                      >
                        <Settings size={14} />
                        Manage Subscription
                      </button>
                    )}
                  </div>
                )
              })()}
            </div>

            {/* Financial Snapshot */}
            <div className="dashboard-card" style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderLeft: '3px solid #FBBF24',
              borderRadius: '16px',
              padding: '2rem'
            }}>
              <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 style={{
                  fontSize: '1.1rem',
                  fontFamily: 'var(--font-space-grotesk), sans-serif',
                  fontWeight: 600,
                  color: '#F8FAFC',
                  margin: 0
                }}>
                  Financial Snapshot
                </h3>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <span style={{ color: '#94A3B8', fontFamily: 'var(--font-dm-sans), sans-serif' }}>Emergency Fund</span>
                <span style={{ color: '#F8FAFC', fontWeight: 600, fontFamily: 'var(--font-dm-sans), sans-serif' }}>
                  ${profile?.current_savings?.toLocaleString() || '0'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <span style={{ color: '#94A3B8', fontFamily: 'var(--font-dm-sans), sans-serif' }}>Monthly Expenses</span>
                <span style={{ color: '#F8FAFC', fontWeight: 600, fontFamily: 'var(--font-dm-sans), sans-serif' }}>
                  ${profile?.monthly_expenses?.toLocaleString() || '0'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94A3B8', fontFamily: 'var(--font-dm-sans), sans-serif' }}>VA Disability</span>
                <span style={{ color: '#F8FAFC', fontWeight: 600, fontFamily: 'var(--font-dm-sans), sans-serif' }}>
                  ${profile?.va_disability?.toLocaleString() || '0'}/mo
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

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
