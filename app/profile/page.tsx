'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { US_STATES, getCostOfLiving, calculateMinimumSalary, calculateRecommendedSalary } from '@/lib/costOfLiving';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [resumes, setResumes] = useState<any[]>([]);
  const [selectedResume, setSelectedResume] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editingFinancial, setEditingFinancial] = useState(false);
  const [editingLocation, setEditingLocation] = useState(false);
  const [editingCareer, setEditingCareer] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    branch: '',
    mos: '',
    separation_date: '',
    location: '',
    clearance: '',
    monthly_expenses: '',
    current_savings: '',
    va_disability: '',
    target_annual_income: '',
    current_city: '',
    current_state: '',
    target_city: '',
    target_state: '',
    desired_job: '',
    desired_industry: '',
    work_type: '',
  });

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      setUser(user);

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setProfile(profileData);

      // Fetch user's resumes
      const { data: resumesData } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (resumesData) {
        setResumes(resumesData);
        // Auto-select the most recent resume
        if (resumesData.length > 0) {
          setSelectedResume(resumesData[0]);
        }
      }

      if (profileData) {
        setFormData({
          name: profileData.name || '',
          branch: profileData.branch || '',
          mos: profileData.mos || '',
          separation_date: profileData.separation_date || '',
          location: profileData.location || '',
          clearance: profileData.clearance || '',
          monthly_expenses: profileData.monthly_expenses || '',
          current_savings: profileData.current_savings || '',
          va_disability: profileData.va_disability || '',
          target_annual_income: profileData.target_annual_income || '',
          current_city: profileData.current_city || '',
          current_state: profileData.current_state || '',
          target_city: profileData.target_city || '',
          target_state: profileData.target_state || '',
          desired_job: profileData.desired_job || '',
          desired_industry: profileData.desired_industry || '',
          work_type: profileData.work_type || '',
        });
      }
    } catch (error) {
      console.error('Error loading user:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaveError(null);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          branch: formData.branch || null,
          mos: formData.mos || null,
          separation_date: formData.separation_date || null,
          location: formData.location || null,
          clearance: formData.clearance || null,
          monthly_expenses: formData.monthly_expenses ? parseFloat(formData.monthly_expenses) : null,
          current_savings: formData.current_savings ? parseFloat(formData.current_savings) : null,
          va_disability: formData.va_disability ? parseFloat(formData.va_disability) : null,
          target_annual_income: formData.target_annual_income ? parseFloat(formData.target_annual_income) : null,
          current_city: formData.current_city || null,
          current_state: formData.current_state || null,
          target_city: formData.target_city || null,
          target_state: formData.target_state || null,
          desired_job: formData.desired_job || null,
          desired_industry: formData.desired_industry || null,
          work_type: formData.work_type || null,
        })
        .eq('id', user.id);

      if (error) throw error;

      setEditing(false);
      setEditingFinancial(false);
      setEditingLocation(false);
      setEditingCareer(false);
      checkUser();
    } catch (error) {
      console.error('Error updating profile:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save profile');
    }
  };

  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingResume(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/resume/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload resume');
      }

      // Reload resumes
      await checkUser();
      alert('Resume uploaded successfully!');
    } catch (error) {
      console.error('Resume upload error:', error);
      alert(error instanceof Error ? error.message : 'Failed to upload resume');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleDeleteResume = async (resumeId: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;

    try {
      const { error } = await supabase
        .from('resumes')
        .delete()
        .eq('id', resumeId);

      if (error) throw error;

      // Reload resumes
      await checkUser();
    } catch (error) {
      console.error('Error deleting resume:', error);
      alert('Failed to delete resume');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0e14' }}>
        <div style={{ color: '#8b949e' }}>Loading...</div>
      </div>
    );
  }

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
            <Link href="/dashboard" style={{ color: '#8b949e', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>
              Dashboard
            </Link>
            <Link href="/profile" style={{ color: '#00ff88', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>
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
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem', position: 'relative', zIndex: 1 }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: '#e6edf3' }}>Your Profile</h1>
          <p style={{ color: '#8b949e' }}>Manage your transition information to get personalized job fit analysis</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          {/* Basic Info Panel */}
          <div style={{ background: '#151921', border: '1px solid #1e2530', borderRadius: '8px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #1e2530' }}>
              <h3 style={{
                fontSize: '1.1rem',
                fontFamily: "'JetBrains Mono', monospace",
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#e6edf3'
              }}>
                Basic Information
              </h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {editing && (
                  <button
                    onClick={() => setEditing(false)}
                    style={{ padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 600, background: 'transparent', border: '2px solid #1e2530', color: '#8b949e', cursor: 'pointer', fontSize: '0.85rem' }}
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={() => editing ? handleSave() : setEditing(true)}
                  style={{ padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 600, background: 'transparent', border: '2px solid #1e2530', color: '#e6edf3', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  {editing ? 'Save' : 'Edit'}
                </button>
              </div>
            </div>

            {saveError && editing && (
              <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#2d1515', border: '1px solid #5c2626', borderRadius: '6px', color: '#ff6b6b', fontSize: '0.85rem' }}>
                {saveError}
              </div>
            )}

            <div style={{ display: 'grid', gap: '1rem' }}>
              {editing ? (
                <>
                  <div>
                    <label style={{ color: '#8b949e', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        background: '#0a0e14',
                        border: '1px solid #1e2530',
                        borderRadius: '6px',
                        color: '#e6edf3'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ color: '#8b949e', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>Branch</label>
                    <select
                      value={formData.branch}
                      onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        background: '#0a0e14',
                        border: '1px solid #1e2530',
                        borderRadius: '6px',
                        color: '#e6edf3'
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
                    <label style={{ color: '#8b949e', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>MOS/Rate</label>
                    <input
                      type="text"
                      value={formData.mos}
                      onChange={(e) => setFormData({ ...formData, mos: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        background: '#0a0e14',
                        border: '1px solid #1e2530',
                        borderRadius: '6px',
                        color: '#e6edf3'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ color: '#8b949e', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>Separation Date</label>
                    <input
                      type="date"
                      value={formData.separation_date}
                      onChange={(e) => setFormData({ ...formData, separation_date: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        background: '#0a0e14',
                        border: '1px solid #1e2530',
                        borderRadius: '6px',
                        color: '#e6edf3'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ color: '#8b949e', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>Current City</label>
                    <input
                      type="text"
                      value={formData.current_city}
                      onChange={(e) => setFormData({ ...formData, current_city: e.target.value })}
                      placeholder="e.g., San Diego"
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        background: '#0a0e14',
                        border: '1px solid #1e2530',
                        borderRadius: '6px',
                        color: '#e6edf3'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ color: '#8b949e', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>Current State</label>
                    <select
                      value={formData.current_state}
                      onChange={(e) => setFormData({ ...formData, current_state: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        background: '#0a0e14',
                        border: '1px solid #1e2530',
                        borderRadius: '6px',
                        color: '#e6edf3'
                      }}
                    >
                      <option value="">Select State</option>
                      {US_STATES.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ color: '#8b949e', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>Security Clearance</label>
                    <select
                      value={formData.clearance}
                      onChange={(e) => setFormData({ ...formData, clearance: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        background: '#0a0e14',
                        border: '1px solid #1e2530',
                        borderRadius: '6px',
                        color: '#e6edf3'
                      }}
                    >
                      <option value="">None</option>
                      <option value="Secret">Secret</option>
                      <option value="Top Secret">Top Secret</option>
                      <option value="TS/SCI">TS/SCI</option>
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid #1e2530' }}>
                    <span style={{ color: '#8b949e' }}>Name</span>
                    <span style={{ color: '#e6edf3' }}>{profile?.name}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid #1e2530' }}>
                    <span style={{ color: '#8b949e' }}>Email</span>
                    <span style={{ color: '#e6edf3' }}>{profile?.email}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid #1e2530' }}>
                    <span style={{ color: '#8b949e' }}>Branch</span>
                    <span style={{ color: '#e6edf3' }}>{profile?.branch || 'Not set'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid #1e2530' }}>
                    <span style={{ color: '#8b949e' }}>MOS/Rate</span>
                    <span style={{ color: '#e6edf3' }}>{profile?.mos || 'Not set'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid #1e2530' }}>
                    <span style={{ color: '#8b949e' }}>Separation Date</span>
                    <span style={{ color: '#e6edf3' }}>
                      {profile?.separation_date ? new Date(profile.separation_date).toLocaleDateString() : 'Not set'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid #1e2530' }}>
                    <span style={{ color: '#8b949e' }}>Current Location</span>
                    <span style={{ color: '#e6edf3' }}>
                      {profile?.current_city && profile?.current_state
                        ? `${profile.current_city}, ${profile.current_state}`
                        : 'Not set'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#8b949e' }}>Security Clearance</span>
                    <span style={{ color: profile?.clearance ? '#00ff88' : '#e6edf3' }}>
                      {profile?.clearance ? `✓ Active ${profile.clearance}` : 'Not set'}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Financial Info Panel */}
          <div style={{ background: '#151921', border: '1px solid #1e2530', borderRadius: '8px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #1e2530' }}>
              <h3 style={{
                fontSize: '1.1rem',
                fontFamily: "'JetBrains Mono', monospace",
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#e6edf3'
              }}>
                Financial Information
              </h3>
              <button
                onClick={() => editingFinancial ? handleSave() : setEditingFinancial(true)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  fontWeight: 600,
                  background: 'transparent',
                  border: '2px solid #1e2530',
                  color: '#e6edf3',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                {editingFinancial ? 'Save' : 'Edit'}
              </button>
            </div>

            {saveError && (
              <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#2d1515', border: '1px solid #5c2626', borderRadius: '6px', color: '#ff6b6b', fontSize: '0.85rem' }}>
                {saveError}
              </div>
            )}

            <div style={{ display: 'grid', gap: '1rem' }}>
              {editingFinancial ? (
                <>
                  <div>
                    <label style={{ color: '#8b949e', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>Monthly Expenses ($)</label>
                    <input
                      type="number"
                      value={formData.monthly_expenses}
                      onChange={(e) => setFormData({ ...formData, monthly_expenses: e.target.value })}
                      placeholder="e.g. 3500"
                      style={{ width: '100%', padding: '0.5rem', background: '#0a0e14', border: '1px solid #1e2530', borderRadius: '6px', color: '#e6edf3' }}
                    />
                  </div>
                  <div>
                    <label style={{ color: '#8b949e', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>Current Savings ($)</label>
                    <input
                      type="number"
                      value={formData.current_savings}
                      onChange={(e) => setFormData({ ...formData, current_savings: e.target.value })}
                      placeholder="e.g. 20000"
                      style={{ width: '100%', padding: '0.5rem', background: '#0a0e14', border: '1px solid #1e2530', borderRadius: '6px', color: '#e6edf3' }}
                    />
                  </div>
                  <div>
                    <label style={{ color: '#8b949e', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>VA Disability ($/month)</label>
                    <input
                      type="number"
                      value={formData.va_disability}
                      onChange={(e) => setFormData({ ...formData, va_disability: e.target.value })}
                      placeholder="e.g. 1500"
                      style={{ width: '100%', padding: '0.5rem', background: '#0a0e14', border: '1px solid #1e2530', borderRadius: '6px', color: '#e6edf3' }}
                    />
                  </div>
                  <div>
                    <label style={{ color: '#8b949e', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>Target Annual Income ($)</label>
                    <input
                      type="number"
                      value={formData.target_annual_income}
                      onChange={(e) => setFormData({ ...formData, target_annual_income: e.target.value })}
                      placeholder="e.g. 85000"
                      style={{ width: '100%', padding: '0.5rem', background: '#0a0e14', border: '1px solid #1e2530', borderRadius: '6px', color: '#e6edf3' }}
                    />
                  </div>
                  <button
                    onClick={() => setEditingFinancial(false)}
                    style={{ padding: '0.5rem', background: 'transparent', border: '1px solid #1e2530', borderRadius: '6px', color: '#8b949e', cursor: 'pointer', fontSize: '0.85rem' }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid #1e2530' }}>
                    <span style={{ color: '#8b949e' }}>Monthly Expenses</span>
                    <span style={{ color: '#e6edf3', fontFamily: "'JetBrains Mono', monospace" }}>
                      ${profile?.monthly_expenses?.toLocaleString() || '0'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid #1e2530' }}>
                    <span style={{ color: '#8b949e' }}>Current Savings</span>
                    <span style={{ color: '#e6edf3', fontFamily: "'JetBrains Mono', monospace" }}>
                      ${profile?.current_savings?.toLocaleString() || '0'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid #1e2530' }}>
                    <span style={{ color: '#8b949e' }}>VA Disability</span>
                    <span style={{ color: '#e6edf3', fontFamily: "'JetBrains Mono', monospace" }}>
                      ${profile?.va_disability?.toLocaleString() || '0'}/month
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid #1e2530' }}>
                    <span style={{ color: '#8b949e' }}>Target Annual Income</span>
                    <span style={{ color: profile?.target_annual_income ? '#00ff88' : '#6e7681', fontFamily: "'JetBrains Mono', monospace" }}>
                      {profile?.target_annual_income ? `$${profile.target_annual_income.toLocaleString()}/yr` : 'Not set'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#8b949e' }}>Current Runway</span>
                    <span style={{ color: '#ffb800' }}>
                      {profile?.monthly_expenses && profile?.current_savings
                        ? (profile.current_savings / profile.monthly_expenses).toFixed(1)
                        : '0'} months
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Career Goals Panel */}
        <div style={{ background: '#151921', border: '1px solid #1e2530', borderRadius: '8px', padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #1e2530' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em', color: '#e6edf3', margin: 0 }}>
                Career Goals
              </h3>
              <p style={{ color: '#8b949e', fontSize: '0.85rem', marginTop: '0.4rem', marginBottom: 0 }}>
                Used to personalize your 90-day transition plan
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, marginLeft: '1rem' }}>
              {editingCareer && (
                <button
                  onClick={() => setEditingCareer(false)}
                  style={{ padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 600, background: 'transparent', border: '2px solid #1e2530', color: '#8b949e', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
              )}
              <button
                onClick={() => editingCareer ? handleSave() : setEditingCareer(true)}
                style={{ padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 600, background: 'transparent', border: '2px solid #1e2530', color: '#e6edf3', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                {editingCareer ? 'Save' : 'Edit'}
              </button>
            </div>
          </div>

          {saveError && editingCareer && (
            <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#2d1515', border: '1px solid #5c2626', borderRadius: '6px', color: '#ff6b6b', fontSize: '0.85rem' }}>
              {saveError}
            </div>
          )}

          <div style={{ display: 'grid', gap: '1rem' }}>
            {editingCareer ? (
              <>
                <div>
                  <label style={{ color: '#8b949e', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>Desired Job Title</label>
                  <input
                    type="text"
                    value={formData.desired_job}
                    onChange={(e) => setFormData({ ...formData, desired_job: e.target.value })}
                    placeholder="e.g. Project Manager, Data Analyst, Cybersecurity Analyst"
                    style={{ width: '100%', padding: '0.5rem', background: '#0a0e14', border: '1px solid #1e2530', borderRadius: '6px', color: '#e6edf3', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ color: '#8b949e', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>Target Industry</label>
                  <input
                    type="text"
                    value={formData.desired_industry}
                    onChange={(e) => setFormData({ ...formData, desired_industry: e.target.value })}
                    placeholder="e.g. Defense Contracting, Tech, Federal Government, Healthcare"
                    style={{ width: '100%', padding: '0.5rem', background: '#0a0e14', border: '1px solid #1e2530', borderRadius: '6px', color: '#e6edf3', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ color: '#8b949e', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>Work Type Preference</label>
                  <select
                    value={formData.work_type}
                    onChange={(e) => setFormData({ ...formData, work_type: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', background: '#0a0e14', border: '1px solid #1e2530', borderRadius: '6px', color: '#e6edf3' }}
                  >
                    <option value="">Select preference</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">On-site</option>
                    <option value="flexible">No preference</option>
                  </select>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid #1e2530' }}>
                  <span style={{ color: '#8b949e' }}>Desired Job Title</span>
                  <span style={{ color: profile?.desired_job ? '#00ff88' : '#6e7681', fontWeight: 600, maxWidth: '60%', textAlign: 'right' }}>
                    {profile?.desired_job || 'Not set'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid #1e2530' }}>
                  <span style={{ color: '#8b949e' }}>Target Industry</span>
                  <span style={{ color: profile?.desired_industry ? '#e6edf3' : '#6e7681', maxWidth: '60%', textAlign: 'right' }}>
                    {profile?.desired_industry || 'Not set'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#8b949e' }}>Work Type</span>
                  <span style={{ color: profile?.work_type ? '#e6edf3' : '#6e7681', textTransform: 'capitalize' }}>
                    {profile?.work_type || 'Not set'}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Target Location & Salary Calculator */}
        <div style={{ background: '#151921', border: '1px solid #1e2530', borderRadius: '8px', padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #1e2530' }}>
            <div>
              <h3 style={{
                fontSize: '1.1rem',
                fontFamily: "'JetBrains Mono', monospace",
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#e6edf3'
              }}>
                Target Location & Salary Requirements
              </h3>
              <p style={{ color: '#8b949e', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                Enter where you're planning to relocate and see the minimum salary needed based on cost of living
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, marginLeft: '1rem' }}>
              {editingLocation && (
                <button
                  onClick={() => setEditingLocation(false)}
                  style={{ padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 600, background: 'transparent', border: '2px solid #1e2530', color: '#8b949e', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
              )}
              <button
                onClick={() => editingLocation ? handleSave() : setEditingLocation(true)}
                style={{ padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 600, background: 'transparent', border: '2px solid #1e2530', color: '#e6edf3', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                {editingLocation ? 'Save' : 'Edit'}
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: editingLocation ? '1fr 1fr' : '1fr', gap: '2rem' }}>
            {/* Location Input */}
            <div style={{ display: 'grid', gap: '1rem' }}>
              {editingLocation ? (
                <>
                  <div>
                    <label style={{ color: '#8b949e', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>Target City</label>
                    <input
                      type="text"
                      value={formData.target_city}
                      onChange={(e) => setFormData({ ...formData, target_city: e.target.value })}
                      placeholder="e.g., Austin"
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        background: '#0a0e14',
                        border: '1px solid #1e2530',
                        borderRadius: '6px',
                        color: '#e6edf3'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ color: '#8b949e', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>Target State</label>
                    <select
                      value={formData.target_state}
                      onChange={(e) => setFormData({ ...formData, target_state: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        background: '#0a0e14',
                        border: '1px solid #1e2530',
                        borderRadius: '6px',
                        color: '#e6edf3'
                      }}
                    >
                      <option value="">Select State</option>
                      {US_STATES.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid #1e2530' }}>
                  <span style={{ color: '#8b949e' }}>Target Location</span>
                  <span style={{ color: profile?.target_city && profile?.target_state ? '#00ff88' : '#6e7681', fontWeight: 600 }}>
                    {profile?.target_city && profile?.target_state
                      ? `${profile.target_city}, ${profile.target_state}`
                      : 'Not set'}
                  </span>
                </div>
              )}
            </div>

            {/* Salary Calculator Results */}
            {profile?.target_state && profile?.monthly_expenses && !editingLocation && (() => {
              const salaryCalc = calculateMinimumSalary(
                profile.target_state,
                profile.monthly_expenses,
                profile.va_disability || 0
              );
              const recommendedSalary = calculateRecommendedSalary(
                profile.target_state,
                profile.monthly_expenses,
                profile.va_disability || 0
              );
              const costData = getCostOfLiving(profile.target_state);

              return salaryCalc && costData ? (
                <div style={{ background: '#0a0e14', border: '1px solid #1e2530', borderRadius: '8px', padding: '1.5rem' }}>
                  <h4 style={{ color: '#00aaff', marginBottom: '1rem', fontFamily: "'JetBrains Mono', monospace" }}>
                    Salary Analysis for {profile.target_state}
                  </h4>

                  {/* Cost of Living Index */}
                  <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#151921', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#8b949e', fontSize: '0.9rem' }}>Cost of Living Index</span>
                      <span style={{
                        color: costData.index > 100 ? '#ff6b6b' : '#00ff88',
                        fontWeight: 700,
                        fontSize: '1.2rem'
                      }}>
                        {costData.index}
                        <span style={{ fontSize: '0.8rem', marginLeft: '0.25rem' }}>
                          ({costData.index > 100 ? '+' : ''}{costData.index - 100}% vs national avg)
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Minimum Salary */}
                  <div style={{ marginBottom: '1rem', padding: '1.5rem', background: 'rgba(0, 255, 136, 0.05)', border: '1px solid rgba(0, 255, 136, 0.2)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.85rem', color: '#8b949e', marginBottom: '0.5rem' }}>
                      MINIMUM SALARY TO COVER EXPENSES
                    </div>
                    {salaryCalc.minimumSalary === 0 ? (
                      <>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: '#00ff88', marginBottom: '0.5rem' }}>
                          $0 needed
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#00ff88' }}>
                          Your VA disability fully covers your monthly expenses
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#00ff88', marginBottom: '0.5rem' }}>
                          ${salaryCalc.minimumSalary.toLocaleString()}
                          <span style={{ fontSize: '1rem', color: '#8b949e' }}>/year</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#8b949e' }}>
                          Take-home: ${salaryCalc.takehomePay.toLocaleString()}/year (${Math.ceil(salaryCalc.breakdown.netMonthly).toLocaleString()}/month)
                        </div>
                      </>
                    )}
                  </div>

                  {/* Recommended Salary */}
                  {recommendedSalary !== null && recommendedSalary > 0 && (
                    <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(0, 170, 255, 0.05)', border: '1px solid rgba(0, 170, 255, 0.2)', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.85rem', color: '#8b949e', marginBottom: '0.25rem' }}>
                        RECOMMENDED (20% savings built in)
                      </div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#00aaff' }}>
                        ${recommendedSalary.toLocaleString()}
                        <span style={{ fontSize: '0.9rem', color: '#8b949e' }}>/year</span>
                      </div>
                    </div>
                  )}

                  {/* Breakdown */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.9rem' }}>
                    <div style={{ padding: '0.75rem', background: '#151921', borderRadius: '6px' }}>
                      <div style={{ color: '#8b949e', marginBottom: '0.25rem' }}>Median Rent</div>
                      <div style={{ color: '#e6edf3', fontWeight: 600 }}>${costData.medianRent}/mo</div>
                    </div>
                    <div style={{ padding: '0.75rem', background: '#151921', borderRadius: '6px' }}>
                      <div style={{ color: '#8b949e', marginBottom: '0.25rem' }}>Median Income</div>
                      <div style={{ color: '#e6edf3', fontWeight: 600 }}>${costData.medianIncome.toLocaleString()}/yr</div>
                    </div>
                    <div style={{ padding: '0.75rem', background: '#151921', borderRadius: '6px' }}>
                      <div style={{ color: '#8b949e', marginBottom: '0.25rem' }}>Your Expenses</div>
                      <div style={{ color: '#e6edf3', fontWeight: 600 }}>${profile.monthly_expenses.toLocaleString()}/mo</div>
                    </div>
                    <div style={{ padding: '0.75rem', background: '#151921', borderRadius: '6px' }}>
                      <div style={{ color: '#8b949e', marginBottom: '0.25rem' }}>VA Disability</div>
                      <div style={{ color: '#00ff88', fontWeight: 600 }}>${(profile.va_disability || 0).toLocaleString()}/mo</div>
                    </div>
                  </div>

                  {/* Monthly Breakdown */}
                  <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#151921', borderRadius: '6px' }}>
                    <h5 style={{ color: '#e6edf3', marginBottom: '0.75rem', fontSize: '0.9rem', fontFamily: "'JetBrains Mono', monospace" }}>
                      Monthly Income Breakdown
                    </h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#8b949e' }}>Gross Monthly Salary</span>
                        <span style={{ color: '#e6edf3' }}>${salaryCalc.breakdown.grossMonthly.toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#8b949e' }}>- Estimated Taxes (25%)</span>
                        <span style={{ color: '#ff6b6b' }}>-${salaryCalc.breakdown.estimatedTaxes.toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid #1e2530' }}>
                        <span style={{ color: '#8b949e' }}>Net Monthly Pay</span>
                        <span style={{ color: '#e6edf3', fontWeight: 600 }}>${salaryCalc.breakdown.netMonthly.toLocaleString()}</span>
                      </div>
                      {salaryCalc.breakdown.vaDisability > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#8b949e' }}>+ VA Disability</span>
                          <span style={{ color: '#00ff88' }}>+${salaryCalc.breakdown.vaDisability.toLocaleString()}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, paddingTop: '0.5rem', borderTop: '1px solid #1e2530' }}>
                        <span style={{ color: '#e6edf3' }}>Total Monthly Income</span>
                        <span style={{ color: '#00ff88' }}>${salaryCalc.breakdown.totalMonthly.toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#8b949e' }}>- Monthly Expenses</span>
                        <span style={{ color: '#ff6b6b' }}>-${salaryCalc.breakdown.expenses.toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, paddingTop: '0.5rem', borderTop: '1px solid #1e2530' }}>
                        <span style={{ color: salaryCalc.breakdown.surplus >= 0 ? '#00ff88' : '#ff6b6b' }}>
                          Monthly Surplus/Deficit
                        </span>
                        <span style={{ color: salaryCalc.breakdown.surplus >= 0 ? '#00ff88' : '#ff6b6b' }}>
                          {salaryCalc.breakdown.surplus >= 0 ? '+' : ''}${salaryCalc.breakdown.surplus.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null;
            })()}
          </div>

          {!profile?.target_state && !editingLocation && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6e7681' }}>
              Click <span style={{ color: '#00ff88' }}>Edit</span> above to set your target location and calculate salary requirements
            </div>
          )}

          {/* Resumes Section */}
          <div style={{
            background: '#151921',
            borderRadius: '8px',
            padding: '2rem',
            border: '1px solid #30363d',
            marginTop: '2rem'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem'
            }}>
              <h2 style={{
                fontFamily: 'JetBrains Mono, monospace',
                color: '#e6edf3',
                fontSize: '1.5rem',
                fontWeight: 700,
                margin: 0
              }}>
                <span style={{ color: '#00ff88' }}>02.</span> My Resumes
              </h2>
              <div>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleResumeUpload}
                  disabled={uploadingResume}
                  id="resume-upload"
                  style={{ display: 'none' }}
                />
                <label
                  htmlFor="resume-upload"
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: uploadingResume ? '#30363d' : 'linear-gradient(135deg, #00ff88 0%, #00aaff 100%)',
                    color: uploadingResume ? '#8b949e' : '#0a0e14',
                    border: 'none',
                    borderRadius: '4px',
                    fontWeight: 600,
                    cursor: uploadingResume ? 'not-allowed' : 'pointer',
                    fontSize: '0.875rem',
                    display: 'inline-block'
                  }}
                >
                  {uploadingResume ? 'Uploading...' : '+ Upload Resume'}
                </label>
              </div>
            </div>

            {resumes.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                color: '#6e7681'
              }}>
                No resumes uploaded yet. Upload your resume to get started!
              </div>
            ) : (
              <div>
                {/* Resume List */}
                <div style={{
                  display: 'grid',
                  gap: '1rem',
                  marginBottom: '2rem'
                }}>
                  {resumes.map((resume) => (
                    <div
                      key={resume.id}
                      onClick={() => setSelectedResume(resume)}
                      style={{
                        padding: '1.5rem',
                        background: selectedResume?.id === resume.id ? '#1c2128' : '#0d1117',
                        border: selectedResume?.id === resume.id ? '2px solid #00ff88' : '1px solid #30363d',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'start'
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            color: '#e6edf3',
                            fontWeight: 600,
                            marginBottom: '0.5rem'
                          }}>
                            {resume.file_name}
                          </div>
                          <div style={{
                            color: '#8b949e',
                            fontSize: '0.875rem'
                          }}>
                            Uploaded {new Date(resume.created_at).toLocaleDateString()}
                            {resume.parsed_data?.fullName && (
                              <span> • {resume.parsed_data.fullName}</span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteResume(resume.id);
                          }}
                          style={{
                            padding: '0.5rem 1rem',
                            background: '#30363d',
                            color: '#e6edf3',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.875rem'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Resume Details */}
                {selectedResume && selectedResume.parsed_data && (
                  <div style={{
                    padding: '2rem',
                    background: '#0d1117',
                    border: '1px solid #30363d',
                    borderRadius: '4px'
                  }}>
                    <h3 style={{
                      color: '#e6edf3',
                      fontWeight: 600,
                      marginBottom: '1.5rem',
                      fontSize: '1.25rem'
                    }}>
                      Resume Details
                    </h3>

                    {/* Contact Info */}
                    <div style={{ marginBottom: '2rem' }}>
                      <h4 style={{ color: '#00ff88', marginBottom: '1rem' }}>Contact Information</h4>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem'
                      }}>
                        {selectedResume.parsed_data.fullName && (
                          <div>
                            <div style={{ color: '#8b949e', fontSize: '0.875rem' }}>Name</div>
                            <div style={{ color: '#e6edf3' }}>{selectedResume.parsed_data.fullName}</div>
                          </div>
                        )}
                        {selectedResume.parsed_data.email && (
                          <div>
                            <div style={{ color: '#8b949e', fontSize: '0.875rem' }}>Email</div>
                            <div style={{ color: '#e6edf3' }}>{selectedResume.parsed_data.email}</div>
                          </div>
                        )}
                        {selectedResume.parsed_data.phone && (
                          <div>
                            <div style={{ color: '#8b949e', fontSize: '0.875rem' }}>Phone</div>
                            <div style={{ color: '#e6edf3' }}>{selectedResume.parsed_data.phone}</div>
                          </div>
                        )}
                        {selectedResume.parsed_data.location && (
                          <div>
                            <div style={{ color: '#8b949e', fontSize: '0.875rem' }}>Location</div>
                            <div style={{ color: '#e6edf3' }}>{selectedResume.parsed_data.location}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Experience */}
                    {selectedResume.parsed_data.experience && selectedResume.parsed_data.experience.length > 0 && (
                      <div style={{ marginBottom: '2rem' }}>
                        <h4 style={{ color: '#00ff88', marginBottom: '1rem' }}>Experience</h4>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                          {selectedResume.parsed_data.experience.map((exp: any, idx: number) => (
                            <div key={idx} style={{
                              padding: '1rem',
                              background: '#151921',
                              borderRadius: '4px',
                              border: '1px solid #30363d'
                            }}>
                              <div style={{
                                color: '#e6edf3',
                                fontWeight: 600,
                                marginBottom: '0.25rem'
                              }}>
                                {exp.title}
                              </div>
                              <div style={{
                                color: '#00aaff',
                                marginBottom: '0.5rem'
                              }}>
                                {exp.company}
                              </div>
                              <div style={{
                                color: '#8b949e',
                                fontSize: '0.875rem',
                                marginBottom: '0.5rem'
                              }}>
                                {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                              </div>
                              <div style={{ color: '#e6edf3', fontSize: '0.875rem' }}>
                                {exp.description}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Skills */}
                    {selectedResume.parsed_data.skills && selectedResume.parsed_data.skills.length > 0 && (
                      <div style={{ marginBottom: '2rem' }}>
                        <h4 style={{ color: '#00ff88', marginBottom: '1rem' }}>Skills</h4>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                          {selectedResume.parsed_data.skills.map((skillGroup: any, idx: number) => (
                            <div key={idx}>
                              <div style={{
                                color: '#e6edf3',
                                fontWeight: 600,
                                marginBottom: '0.5rem'
                              }}>
                                {skillGroup.category}
                              </div>
                              <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '0.5rem'
                              }}>
                                {skillGroup.items.map((skill: string, skillIdx: number) => (
                                  <span
                                    key={skillIdx}
                                    style={{
                                      padding: '0.25rem 0.75rem',
                                      background: '#1c2128',
                                      border: '1px solid #30363d',
                                      borderRadius: '4px',
                                      color: '#e6edf3',
                                      fontSize: '0.875rem'
                                    }}
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Education */}
                    {selectedResume.parsed_data.education && selectedResume.parsed_data.education.length > 0 && (
                      <div>
                        <h4 style={{ color: '#00ff88', marginBottom: '1rem' }}>Education</h4>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                          {selectedResume.parsed_data.education.map((edu: any, idx: number) => (
                            <div key={idx} style={{
                              padding: '1rem',
                              background: '#151921',
                              borderRadius: '4px',
                              border: '1px solid #30363d'
                            }}>
                              <div style={{ color: '#e6edf3', fontWeight: 600 }}>
                                {edu.degree} in {edu.field}
                              </div>
                              <div style={{ color: '#00aaff' }}>
                                {edu.institution}
                              </div>
                              {edu.graduationDate && (
                                <div style={{ color: '#8b949e', fontSize: '0.875rem' }}>
                                  {edu.graduationDate}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
