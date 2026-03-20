'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import AppNav from '@/components/AppNav';
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

      <AppNav current="/profile" />

      {/* Main Content */}
      <div className="page-content">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: '#e6edf3' }}>Your Profile</h1>
          <p style={{ color: '#8b949e' }}>Manage your transition information to get personalized job fit analysis</p>
        </div>

        <div className="grid-2col" style={{ marginBottom: '2rem' }}>
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
                Your Money Situation
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
                    <label style={{ color: '#8b949e', fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem' }}>Monthly Bills ($)</label>
                    <div style={{ color: '#6e7681', fontSize: '0.75rem', marginBottom: '0.5rem' }}>Add up everything: rent, food, car, phone, insurance, subscriptions</div>
                    <input
                      type="number"
                      value={formData.monthly_expenses}
                      onChange={(e) => setFormData({ ...formData, monthly_expenses: e.target.value })}
                      placeholder="e.g. 3500"
                      style={{ width: '100%', padding: '0.5rem', background: '#0a0e14', border: '1px solid #1e2530', borderRadius: '6px', color: '#e6edf3' }}
                    />
                  </div>
                  <div>
                    <label style={{ color: '#8b949e', fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem' }}>Total Savings ($)</label>
                    <div style={{ color: '#6e7681', fontSize: '0.75rem', marginBottom: '0.5rem' }}>How much money do you have saved up right now?</div>
                    <input
                      type="number"
                      value={formData.current_savings}
                      onChange={(e) => setFormData({ ...formData, current_savings: e.target.value })}
                      placeholder="e.g. 20000"
                      style={{ width: '100%', padding: '0.5rem', background: '#0a0e14', border: '1px solid #1e2530', borderRadius: '6px', color: '#e6edf3' }}
                    />
                  </div>
                  <div>
                    <label style={{ color: '#8b949e', fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem' }}>VA Disability Pay ($/month)</label>
                    <div style={{ color: '#6e7681', fontSize: '0.75rem', marginBottom: '0.5rem' }}>Monthly amount you receive from VA — enter 0 if none</div>
                    <input
                      type="number"
                      value={formData.va_disability}
                      onChange={(e) => setFormData({ ...formData, va_disability: e.target.value })}
                      placeholder="e.g. 1500"
                      style={{ width: '100%', padding: '0.5rem', background: '#0a0e14', border: '1px solid #1e2530', borderRadius: '6px', color: '#e6edf3' }}
                    />
                  </div>
                  <div>
                    <label style={{ color: '#8b949e', fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem' }}>Salary Goal ($/year)</label>
                    <div style={{ color: '#6e7681', fontSize: '0.75rem', marginBottom: '0.5rem' }}>What yearly salary are you aiming for? This is before taxes.</div>
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
                  <div style={{ paddingBottom: '1rem', borderBottom: '1px solid #1e2530' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#8b949e' }}>Monthly Bills</span>
                      <span style={{ color: '#e6edf3', fontFamily: "'JetBrains Mono', monospace" }}>
                        ${profile?.monthly_expenses?.toLocaleString() || '0'}/mo
                      </span>
                    </div>
                    <div style={{ color: '#6e7681', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                      Rent, food, car, phone, insurance — everything you pay each month
                    </div>
                  </div>
                  <div style={{ paddingBottom: '1rem', borderBottom: '1px solid #1e2530' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#8b949e' }}>Savings</span>
                      <span style={{ color: '#e6edf3', fontFamily: "'JetBrains Mono', monospace" }}>
                        ${profile?.current_savings?.toLocaleString() || '0'}
                      </span>
                    </div>
                    <div style={{ color: '#6e7681', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                      Total money you have saved up right now
                    </div>
                  </div>
                  <div style={{ paddingBottom: '1rem', borderBottom: '1px solid #1e2530' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#8b949e' }}>VA Disability Pay</span>
                      <span style={{ color: '#00ff88', fontFamily: "'JetBrains Mono', monospace" }}>
                        ${profile?.va_disability?.toLocaleString() || '0'}/mo
                      </span>
                    </div>
                    <div style={{ color: '#6e7681', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                      Tax-free monthly income from the VA
                    </div>
                  </div>
                  <div style={{ paddingBottom: '1rem', borderBottom: '1px solid #1e2530' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#8b949e' }}>Salary Goal</span>
                      <span style={{ color: profile?.target_annual_income ? '#00ff88' : '#6e7681', fontFamily: "'JetBrains Mono', monospace" }}>
                        {profile?.target_annual_income ? `$${profile.target_annual_income.toLocaleString()}/yr` : 'Not set'}
                      </span>
                    </div>
                    <div style={{ color: '#6e7681', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                      What you want to earn per year at your new job (before taxes)
                    </div>
                  </div>

                  {/* How Long Your Savings Will Last */}
                  {profile?.monthly_expenses && profile?.current_savings ? (() => {
                    const vaMonthly = profile.va_disability || 0;
                    const gap = profile.monthly_expenses - vaMonthly;
                    const months = gap > 0 ? (profile.current_savings / gap) : Infinity;
                    const isGood = months >= 6;
                    const isOk = months >= 3;

                    return (
                      <div style={{
                        padding: '1rem',
                        background: isGood ? 'rgba(0, 255, 136, 0.05)' : isOk ? 'rgba(255, 184, 0, 0.05)' : 'rgba(255, 68, 68, 0.05)',
                        border: `1px solid ${isGood ? 'rgba(0, 255, 136, 0.2)' : isOk ? 'rgba(255, 184, 0, 0.2)' : 'rgba(255, 68, 68, 0.2)'}`,
                        borderRadius: '6px',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                          <span style={{ color: '#e6edf3', fontWeight: 600, fontSize: '0.9rem' }}>
                            How Long Your Savings Will Last
                          </span>
                          <span style={{
                            color: isGood ? '#00ff88' : isOk ? '#ffb800' : '#ff4444',
                            fontWeight: 700,
                            fontSize: '1.1rem',
                            fontFamily: "'JetBrains Mono', monospace",
                          }}>
                            {months === Infinity ? 'Covered' : `${months.toFixed(1)} months`}
                          </span>
                        </div>
                        <div style={{ color: '#8b949e', fontSize: '0.8rem' }}>
                          {months === Infinity
                            ? 'Your VA pay covers all your bills — your savings stay untouched'
                            : vaMonthly > 0
                              ? `After VA pay covers $${vaMonthly.toLocaleString()}/mo, you'd spend $${gap.toLocaleString()}/mo from savings`
                              : `At $${profile.monthly_expenses.toLocaleString()}/mo in bills, your savings would last this long without a job`}
                        </div>
                        {months !== Infinity && months < 6 && (
                          <div style={{ color: months < 3 ? '#ff4444' : '#ffb800', fontSize: '0.8rem', marginTop: '0.5rem', fontWeight: 600 }}>
                            {months < 3
                              ? 'Less than 3 months of cushion — finding income quickly is important'
                              : 'Tip: Experts recommend having at least 6 months saved up'}
                          </div>
                        )}
                      </div>
                    );
                  })() : (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#8b949e' }}>How Long Savings Last</span>
                      <span style={{ color: '#6e7681' }}>Add your bills & savings to calculate</span>
                    </div>
                  )}
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
                Where You Want to Live & What to Earn
              </h3>
              <p style={{ color: '#8b949e', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                Pick the state you want to move to, and we'll tell you what salary to look for
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
                  <h4 style={{ color: '#00aaff', marginBottom: '0.5rem', fontFamily: "'JetBrains Mono', monospace" }}>
                    What You Need to Earn in {profile.target_state}
                  </h4>
                  <p style={{ color: '#6e7681', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
                    Based on your monthly bills{profile.va_disability && profile.va_disability > 0 ? ' and VA pay' : ''}, here's what salary to look for
                  </p>

                  {/* How expensive is this state */}
                  <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#151921', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <span style={{ color: '#e6edf3', fontSize: '0.9rem', fontWeight: 600 }}>How Expensive Is {profile.target_state}?</span>
                      <span style={{
                        color: costData.index > 100 ? '#ff6b6b' : '#00ff88',
                        fontWeight: 700,
                        fontSize: '1rem'
                      }}>
                        {costData.index > 100
                          ? `${costData.index - 100}% above average`
                          : costData.index === 100
                            ? 'Average cost'
                            : `${100 - costData.index}% below average`}
                      </span>
                    </div>
                    <div style={{ color: '#6e7681', fontSize: '0.75rem' }}>
                      Compared to the rest of the U.S. — {costData.index > 110 ? 'expect to pay more for housing, food, and everyday stuff' : costData.index > 100 ? 'slightly more expensive than most places' : 'your money goes further here than most places'}
                    </div>
                  </div>

                  {/* The Bare Minimum */}
                  <div style={{ marginBottom: '1rem', padding: '1.5rem', background: 'rgba(0, 255, 136, 0.05)', border: '1px solid rgba(0, 255, 136, 0.2)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.85rem', color: '#8b949e', marginBottom: '0.5rem', fontWeight: 600 }}>
                      {salaryCalc.minimumSalary === 0
                        ? "YOU'RE COVERED"
                        : profile.va_disability && profile.va_disability > 0
                          ? 'THE LEAST YOUR JOB NEEDS TO PAY'
                          : 'THE LEAST YOU NEED TO EARN'}
                    </div>
                    {salaryCalc.minimumSalary === 0 ? (
                      <>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: '#00ff88', marginBottom: '0.5rem' }}>
                          $0 needed from a job
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#00ff88' }}>
                          Your VA pay alone covers all your monthly bills
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#00ff88', marginBottom: '0.5rem' }}>
                          ${salaryCalc.minimumSalary.toLocaleString()}
                          <span style={{ fontSize: '1rem', color: '#8b949e' }}>/year</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#8b949e', marginBottom: '0.25rem' }}>
                          After taxes, you'd bring home about ${Math.ceil(salaryCalc.breakdown.netMonthly).toLocaleString()} per month from your paycheck
                        </div>
                        {profile.va_disability && profile.va_disability > 0 && (
                          <div style={{ fontSize: '0.85rem', color: '#00aaff', padding: '0.5rem', background: 'rgba(0, 170, 255, 0.1)', borderRadius: '4px', marginTop: '0.5rem' }}>
                            This is on top of your ${profile.va_disability.toLocaleString()}/mo VA pay (${(profile.va_disability * 12).toLocaleString()}/yr) — VA pay is tax-free
                          </div>
                        )}
                        <div style={{ fontSize: '0.8rem', color: '#6e7681', marginTop: '0.5rem' }}>
                          This just covers your bills with nothing left over — aim higher if you can
                        </div>
                      </>
                    )}
                  </div>

                  {/* What You Should Aim For */}
                  {recommendedSalary !== null && recommendedSalary > 0 && (
                    <div style={{ marginBottom: '1.5rem', padding: '1.25rem', background: 'rgba(0, 170, 255, 0.05)', border: '1px solid rgba(0, 170, 255, 0.2)', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.85rem', color: '#8b949e', marginBottom: '0.25rem', fontWeight: 600 }}>
                        WHAT YOU SHOULD AIM FOR
                      </div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#00aaff' }}>
                        ${recommendedSalary.toLocaleString()}
                        <span style={{ fontSize: '0.9rem', color: '#8b949e' }}>/year</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#6e7681', marginTop: '0.25rem' }}>
                        This covers your bills and lets you save 20% of your paycheck every month for emergencies and future goals
                      </div>
                    </div>
                  )}

                  {/* Quick Facts */}
                  <div className="grid-2col-auto" style={{ fontSize: '0.9rem' }}>
                    <div style={{ padding: '0.75rem', background: '#151921', borderRadius: '6px' }}>
                      <div style={{ color: '#8b949e', marginBottom: '0.25rem', fontSize: '0.8rem' }}>Typical Rent There</div>
                      <div style={{ color: '#e6edf3', fontWeight: 600 }}>${costData.medianRent.toLocaleString()}/mo</div>
                    </div>
                    <div style={{ padding: '0.75rem', background: '#151921', borderRadius: '6px' }}>
                      <div style={{ color: '#8b949e', marginBottom: '0.25rem', fontSize: '0.8rem' }}>Average Salary There</div>
                      <div style={{ color: '#e6edf3', fontWeight: 600 }}>${costData.medianIncome.toLocaleString()}/yr</div>
                    </div>
                    <div style={{ padding: '0.75rem', background: '#151921', borderRadius: '6px' }}>
                      <div style={{ color: '#8b949e', marginBottom: '0.25rem', fontSize: '0.8rem' }}>Your Monthly Bills</div>
                      <div style={{ color: '#e6edf3', fontWeight: 600 }}>${profile.monthly_expenses.toLocaleString()}/mo</div>
                    </div>
                    <div style={{ padding: '0.75rem', background: '#151921', borderRadius: '6px' }}>
                      <div style={{ color: '#8b949e', marginBottom: '0.25rem', fontSize: '0.8rem' }}>Your VA Pay</div>
                      <div style={{ color: '#00ff88', fontWeight: 600 }}>${(profile.va_disability || 0).toLocaleString()}/mo</div>
                    </div>
                  </div>

                  {/* Where Your Money Goes */}
                  <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#151921', borderRadius: '6px' }}>
                    <h5 style={{ color: '#e6edf3', marginBottom: '0.5rem', fontSize: '0.9rem', fontFamily: "'JetBrains Mono', monospace" }}>
                      Where Your Money Goes Each Month
                    </h5>
                    <p style={{ color: '#6e7681', fontSize: '0.75rem', marginBottom: '0.75rem' }}>
                      Here's how your paycheck breaks down — taxes are estimated at about 25%
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#8b949e' }}>Your paycheck (before taxes)</span>
                        <span style={{ color: '#e6edf3' }}>${salaryCalc.breakdown.grossMonthly.toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#8b949e' }}>Taxes taken out (~25%)</span>
                        <span style={{ color: '#ff6b6b' }}>-${salaryCalc.breakdown.estimatedTaxes.toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid #1e2530' }}>
                        <span style={{ color: '#8b949e' }}>What you actually get</span>
                        <span style={{ color: '#e6edf3', fontWeight: 600 }}>${salaryCalc.breakdown.netMonthly.toLocaleString()}</span>
                      </div>
                      {salaryCalc.breakdown.vaDisability > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#8b949e' }}>+ VA pay (tax-free)</span>
                          <span style={{ color: '#00ff88' }}>+${salaryCalc.breakdown.vaDisability.toLocaleString()}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, paddingTop: '0.5rem', borderTop: '1px solid #1e2530' }}>
                        <span style={{ color: '#e6edf3' }}>Total money coming in</span>
                        <span style={{ color: '#00ff88' }}>${salaryCalc.breakdown.totalMonthly.toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#8b949e' }}>Your bills</span>
                        <span style={{ color: '#ff6b6b' }}>-${salaryCalc.breakdown.expenses.toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, paddingTop: '0.5rem', borderTop: '1px solid #1e2530' }}>
                        <span style={{ color: salaryCalc.breakdown.surplus >= 0 ? '#00ff88' : '#ff6b6b' }}>
                          {salaryCalc.breakdown.surplus >= 0 ? "What's left over" : "You'd be short"}
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
              Click <span style={{ color: '#00ff88' }}>Edit</span> above to pick where you want to live — we'll calculate what salary you should look for
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
