'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import AppNav from '@/components/AppNav';
import { US_STATES, getCostOfLiving, calculateMinimumSalary, calculateRecommendedSalary } from '@/lib/costOfLiving';
import {
  User,
  Shield,
  MapPin,
  DollarSign,
  Briefcase,
  FileText,
  Edit3,
  Save,
  X,
  Upload,
  CheckCircle,
} from 'lucide-react';

// ─── Shared style tokens ─────────────────────────────────────────────────────
const BG_PAGE   = '#060A12';
const BG_CARD   = 'rgba(255,255,255,0.03)';
const BORDER    = 'rgba(255,255,255,0.08)';
const ACCENT    = '#FBBF24';
const BLUE      = '#60A5FA';
const TEXT_PRI  = '#F1F5F9';
const TEXT_SEC  = '#94A3B8';
const TEXT_MUTE = '#64748B';

const cardStyle: React.CSSProperties = {
  background: BG_CARD,
  border: `1px solid ${BORDER}`,
  borderRadius: '16px',
  padding: '1.75rem',
  marginBottom: '1.5rem',
};

const sectionHeaderStyle: React.CSSProperties = {
  borderLeft: `3px solid ${ACCENT}`,
  paddingLeft: '1rem',
  fontFamily: 'var(--font-space-grotesk), sans-serif',
  fontSize: '1.05rem',
  fontWeight: 700,
  color: TEXT_PRI,
  letterSpacing: '0.02em',
};

const labelStyle: React.CSSProperties = {
  color: TEXT_SEC,
  fontSize: '0.8rem',
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  marginBottom: '0.4rem',
  display: 'block',
  fontFamily: 'var(--font-dm-sans), sans-serif',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.05)',
  border: `1px solid rgba(255,255,255,0.1)`,
  borderRadius: '10px',
  padding: '0.75rem 1rem',
  color: TEXT_PRI,
  fontSize: '0.95rem',
  fontFamily: 'var(--font-dm-sans), sans-serif',
  outline: 'none',
  boxSizing: 'border-box' as const,
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: 'none' as const,
  WebkitAppearance: 'none' as const,
};

const btnPrimary: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.4rem',
  padding: '0.55rem 1.2rem',
  background: ACCENT,
  color: '#000',
  border: 'none',
  borderRadius: '10px',
  fontWeight: 700,
  fontSize: '0.88rem',
  cursor: 'pointer',
  fontFamily: 'var(--font-dm-sans), sans-serif',
};

const btnSecondary: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.4rem',
  padding: '0.55rem 1.2rem',
  background: 'rgba(255,255,255,0.06)',
  color: TEXT_PRI,
  border: `1px solid rgba(255,255,255,0.12)`,
  borderRadius: '10px',
  fontWeight: 600,
  fontSize: '0.88rem',
  cursor: 'pointer',
  fontFamily: 'var(--font-dm-sans), sans-serif',
};

const btnDanger: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.4rem',
  padding: '0.45rem 1rem',
  background: 'rgba(239,68,68,0.1)',
  color: '#FCA5A5',
  border: `1px solid rgba(239,68,68,0.2)`,
  borderRadius: '10px',
  fontWeight: 600,
  fontSize: '0.85rem',
  cursor: 'pointer',
  fontFamily: 'var(--font-dm-sans), sans-serif',
};

const errorBoxStyle: React.CSSProperties = {
  marginBottom: '1rem',
  padding: '0.75rem 1rem',
  background: 'rgba(239,68,68,0.1)',
  border: `1px solid rgba(239,68,68,0.2)`,
  borderRadius: '10px',
  color: '#FCA5A5',
  fontSize: '0.88rem',
};

const fieldValueStyle: React.CSSProperties = {
  color: TEXT_PRI,
  fontSize: '0.95rem',
  fontFamily: 'var(--font-dm-sans), sans-serif',
};

const fieldMutedStyle: React.CSSProperties = {
  color: TEXT_MUTE,
  fontSize: '0.95rem',
  fontFamily: 'var(--font-dm-sans), sans-serif',
};

// 2-col grid responsive via flex-wrap
const twoColGrid: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '1.25rem',
};

const twoColItem: React.CSSProperties = {
  flex: '1 1 220px',
  minWidth: 0,
};

// ─── Component ───────────────────────────────────────────────────────────────
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
      <div style={{ minHeight: '100vh', background: BG_PAGE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: TEXT_MUTE, fontFamily: 'var(--font-dm-sans), sans-serif' }}>Loading...</span>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: BG_PAGE, color: TEXT_PRI }}>
      <AppNav current="/profile" />

      {/* Page wrapper */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2.5rem 1.5rem 4rem' }}>

        {/* Page heading */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-space-grotesk), sans-serif', fontSize: '1.85rem', fontWeight: 700, color: TEXT_PRI, margin: 0 }}>
            Your Profile
          </h1>
          <p style={{ color: TEXT_SEC, marginTop: '0.4rem', fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.95rem' }}>
            Manage your transition information to get personalized job fit analysis
          </p>
        </div>

        {/* ── SECTION 1: Military & Basic Info ─────────────────────────────── */}
        <div style={cardStyle}>
          {/* Header row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Shield size={18} color={ACCENT} />
              <span style={sectionHeaderStyle}>Military &amp; Basic Info</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {editing && (
                <button onClick={() => setEditing(false)} style={btnSecondary}>
                  <X size={14} /> Cancel
                </button>
              )}
              <button
                onClick={() => editing ? handleSave() : setEditing(true)}
                style={editing ? btnPrimary : btnSecondary}
              >
                {editing ? <><Save size={14} /> Save</> : <><Edit3 size={14} /> Edit</>}
              </button>
            </div>
          </div>

          {saveError && editing && <div style={errorBoxStyle}>{saveError}</div>}

          {editing ? (
            <div style={twoColGrid}>
              <div style={twoColItem}>
                <label style={labelStyle}>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div style={twoColItem}>
                <label style={labelStyle}>Branch</label>
                <select
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  style={selectStyle}
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
              <div style={twoColItem}>
                <label style={labelStyle}>MOS / Rate</label>
                <input
                  type="text"
                  value={formData.mos}
                  onChange={(e) => setFormData({ ...formData, mos: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div style={twoColItem}>
                <label style={labelStyle}>Separation Date</label>
                <input
                  type="date"
                  value={formData.separation_date}
                  onChange={(e) => setFormData({ ...formData, separation_date: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div style={twoColItem}>
                <label style={labelStyle}>Current City</label>
                <input
                  type="text"
                  value={formData.current_city}
                  onChange={(e) => setFormData({ ...formData, current_city: e.target.value })}
                  placeholder="e.g., San Diego"
                  style={inputStyle}
                />
              </div>
              <div style={twoColItem}>
                <label style={labelStyle}>Current State</label>
                <select
                  value={formData.current_state}
                  onChange={(e) => setFormData({ ...formData, current_state: e.target.value })}
                  style={selectStyle}
                >
                  <option value="">Select State</option>
                  {US_STATES.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
              <div style={{ ...twoColItem, flex: '1 1 100%' }}>
                <label style={labelStyle}>Security Clearance</label>
                <select
                  value={formData.clearance}
                  onChange={(e) => setFormData({ ...formData, clearance: e.target.value })}
                  style={selectStyle}
                >
                  <option value="">None</option>
                  <option value="Secret">Secret</option>
                  <option value="Top Secret">Top Secret</option>
                  <option value="TS/SCI">TS/SCI</option>
                </select>
              </div>
            </div>
          ) : (
            <div style={twoColGrid}>
              {[
                { label: 'Name', value: profile?.name },
                { label: 'Email', value: profile?.email },
                { label: 'Branch', value: profile?.branch },
                { label: 'MOS / Rate', value: profile?.mos },
                {
                  label: 'Separation Date',
                  value: profile?.separation_date
                    ? new Date(profile.separation_date).toLocaleDateString()
                    : null,
                },
                {
                  label: 'Current Location',
                  value: profile?.current_city && profile?.current_state
                    ? `${profile.current_city}, ${profile.current_state}`
                    : null,
                },
              ].map(({ label, value }) => (
                <div key={label} style={twoColItem}>
                  <span style={labelStyle}>{label}</span>
                  <span style={value ? fieldValueStyle : fieldMutedStyle}>{value || 'Not set'}</span>
                </div>
              ))}
              <div style={twoColItem}>
                <span style={labelStyle}>Security Clearance</span>
                {profile?.clearance ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#86EFAC', fontSize: '0.95rem' }}>
                    <CheckCircle size={14} color="#86EFAC" /> Active {profile.clearance}
                  </span>
                ) : (
                  <span style={fieldMutedStyle}>Not set</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── SECTION 2: Financial Info ──────────────────────────────────────── */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <DollarSign size={18} color={ACCENT} />
              <span style={sectionHeaderStyle}>Your Money Situation</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {editingFinancial && (
                <button onClick={() => setEditingFinancial(false)} style={btnSecondary}>
                  <X size={14} /> Cancel
                </button>
              )}
              <button
                onClick={() => editingFinancial ? handleSave() : setEditingFinancial(true)}
                style={editingFinancial ? btnPrimary : btnSecondary}
              >
                {editingFinancial ? <><Save size={14} /> Save</> : <><Edit3 size={14} /> Edit</>}
              </button>
            </div>
          </div>

          {saveError && editingFinancial && <div style={errorBoxStyle}>{saveError}</div>}

          {editingFinancial ? (
            <div style={twoColGrid}>
              <div style={twoColItem}>
                <label style={labelStyle}>Monthly Bills ($)</label>
                <div style={{ color: TEXT_MUTE, fontSize: '0.78rem', marginBottom: '0.4rem' }}>Rent, food, car, phone, insurance, subscriptions</div>
                <input
                  type="number"
                  value={formData.monthly_expenses}
                  onChange={(e) => setFormData({ ...formData, monthly_expenses: e.target.value })}
                  placeholder="e.g. 3500"
                  style={inputStyle}
                />
              </div>
              <div style={twoColItem}>
                <label style={labelStyle}>Total Savings ($)</label>
                <div style={{ color: TEXT_MUTE, fontSize: '0.78rem', marginBottom: '0.4rem' }}>How much do you have saved right now?</div>
                <input
                  type="number"
                  value={formData.current_savings}
                  onChange={(e) => setFormData({ ...formData, current_savings: e.target.value })}
                  placeholder="e.g. 20000"
                  style={inputStyle}
                />
              </div>
              <div style={twoColItem}>
                <label style={labelStyle}>VA Disability Pay ($/month)</label>
                <div style={{ color: TEXT_MUTE, fontSize: '0.78rem', marginBottom: '0.4rem' }}>Monthly amount from VA — enter 0 if none</div>
                <input
                  type="number"
                  value={formData.va_disability}
                  onChange={(e) => setFormData({ ...formData, va_disability: e.target.value })}
                  placeholder="e.g. 1500"
                  style={inputStyle}
                />
              </div>
              <div style={twoColItem}>
                <label style={labelStyle}>Salary Goal ($/year)</label>
                <div style={{ color: TEXT_MUTE, fontSize: '0.78rem', marginBottom: '0.4rem' }}>Yearly salary you're aiming for (before taxes)</div>
                <input
                  type="number"
                  value={formData.target_annual_income}
                  onChange={(e) => setFormData({ ...formData, target_annual_income: e.target.value })}
                  placeholder="e.g. 85000"
                  style={inputStyle}
                />
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={twoColGrid}>
                <div style={twoColItem}>
                  <span style={labelStyle}>Monthly Bills</span>
                  <div style={{ color: TEXT_PRI, fontSize: '1rem', fontWeight: 600 }}>
                    ${profile?.monthly_expenses?.toLocaleString() || '0'}<span style={{ color: TEXT_MUTE, fontWeight: 400, fontSize: '0.85rem' }}>/mo</span>
                  </div>
                  <div style={{ color: TEXT_MUTE, fontSize: '0.78rem', marginTop: '0.2rem' }}>Rent, food, car, phone, insurance — all monthly costs</div>
                </div>
                <div style={twoColItem}>
                  <span style={labelStyle}>Savings</span>
                  <div style={{ color: TEXT_PRI, fontSize: '1rem', fontWeight: 600 }}>
                    ${profile?.current_savings?.toLocaleString() || '0'}
                  </div>
                  <div style={{ color: TEXT_MUTE, fontSize: '0.78rem', marginTop: '0.2rem' }}>Total money saved right now</div>
                </div>
                <div style={twoColItem}>
                  <span style={labelStyle}>VA Disability Pay</span>
                  <div style={{ color: '#86EFAC', fontSize: '1rem', fontWeight: 600 }}>
                    ${profile?.va_disability?.toLocaleString() || '0'}<span style={{ color: TEXT_MUTE, fontWeight: 400, fontSize: '0.85rem' }}>/mo</span>
                  </div>
                  <div style={{ color: TEXT_MUTE, fontSize: '0.78rem', marginTop: '0.2rem' }}>Tax-free monthly income from the VA</div>
                </div>
                <div style={twoColItem}>
                  <span style={labelStyle}>Salary Goal</span>
                  <div style={{ color: profile?.target_annual_income ? '#86EFAC' : TEXT_MUTE, fontSize: '1rem', fontWeight: 600 }}>
                    {profile?.target_annual_income ? `$${profile.target_annual_income.toLocaleString()}` : 'Not set'}
                    {profile?.target_annual_income && <span style={{ color: TEXT_MUTE, fontWeight: 400, fontSize: '0.85rem' }}>/yr</span>}
                  </div>
                  <div style={{ color: TEXT_MUTE, fontSize: '0.78rem', marginTop: '0.2rem' }}>Target yearly income (before taxes)</div>
                </div>
              </div>

              {/* Savings runway calculator */}
              {profile?.monthly_expenses && profile?.current_savings ? (() => {
                const vaMonthly = profile.va_disability || 0;
                const gap = profile.monthly_expenses - vaMonthly;
                const months = gap > 0 ? (profile.current_savings / gap) : Infinity;
                const isGood = months >= 6;
                const isOk = months >= 3;
                const runwayColor = isGood ? '#86EFAC' : isOk ? ACCENT : '#FCA5A5';
                const runwayBg = isGood ? 'rgba(34,197,94,0.08)' : isOk ? 'rgba(251,191,36,0.08)' : 'rgba(239,68,68,0.08)';
                const runwayBorder = isGood ? 'rgba(34,197,94,0.2)' : isOk ? 'rgba(251,191,36,0.2)' : 'rgba(239,68,68,0.2)';

                return (
                  <div style={{ background: runwayBg, border: `1px solid ${runwayBorder}`, borderRadius: '12px', padding: '1rem 1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                      <span style={{ color: TEXT_PRI, fontWeight: 600, fontSize: '0.92rem' }}>How Long Your Savings Will Last</span>
                      <span style={{ color: runwayColor, fontWeight: 700, fontSize: '1.05rem' }}>
                        {months === Infinity ? 'Covered' : `${months.toFixed(1)} months`}
                      </span>
                    </div>
                    <div style={{ color: TEXT_SEC, fontSize: '0.8rem' }}>
                      {months === Infinity
                        ? 'Your VA pay covers all your bills — your savings stay untouched'
                        : vaMonthly > 0
                          ? `After VA pay covers $${vaMonthly.toLocaleString()}/mo, you'd spend $${gap.toLocaleString()}/mo from savings`
                          : `At $${profile.monthly_expenses.toLocaleString()}/mo in bills, savings last this long without income`}
                    </div>
                    {months !== Infinity && months < 6 && (
                      <div style={{ color: runwayColor, fontSize: '0.8rem', marginTop: '0.5rem', fontWeight: 600 }}>
                        {months < 3
                          ? 'Less than 3 months of cushion — finding income quickly is important'
                          : 'Tip: Experts recommend having at least 6 months saved up'}
                      </div>
                    )}
                  </div>
                );
              })() : (
                <div style={{ color: TEXT_MUTE, fontSize: '0.88rem' }}>Add your bills &amp; savings above to calculate your runway.</div>
              )}
            </div>
          )}
        </div>

        {/* ── SECTION 3: Career Goals ───────────────────────────────────────── */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Briefcase size={18} color={ACCENT} />
              <div>
                <span style={sectionHeaderStyle}>Career Goals</span>
                <div style={{ color: TEXT_MUTE, fontSize: '0.8rem', paddingLeft: '1rem', marginTop: '0.2rem' }}>Used to personalize your 90-day transition plan</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, marginLeft: '1rem' }}>
              {editingCareer && (
                <button onClick={() => setEditingCareer(false)} style={btnSecondary}>
                  <X size={14} /> Cancel
                </button>
              )}
              <button
                onClick={() => editingCareer ? handleSave() : setEditingCareer(true)}
                style={editingCareer ? btnPrimary : btnSecondary}
              >
                {editingCareer ? <><Save size={14} /> Save</> : <><Edit3 size={14} /> Edit</>}
              </button>
            </div>
          </div>

          {saveError && editingCareer && <div style={errorBoxStyle}>{saveError}</div>}

          {editingCareer ? (
            <div style={twoColGrid}>
              <div style={{ ...twoColItem, flex: '1 1 100%' }}>
                <label style={labelStyle}>Desired Job Title</label>
                <input
                  type="text"
                  value={formData.desired_job}
                  onChange={(e) => setFormData({ ...formData, desired_job: e.target.value })}
                  placeholder="e.g. Project Manager, Data Analyst, Cybersecurity Analyst"
                  style={inputStyle}
                />
              </div>
              <div style={twoColItem}>
                <label style={labelStyle}>Target Industry</label>
                <input
                  type="text"
                  value={formData.desired_industry}
                  onChange={(e) => setFormData({ ...formData, desired_industry: e.target.value })}
                  placeholder="e.g. Defense Contracting, Tech, Federal Government"
                  style={inputStyle}
                />
              </div>
              <div style={twoColItem}>
                <label style={labelStyle}>Work Type Preference</label>
                <select
                  value={formData.work_type}
                  onChange={(e) => setFormData({ ...formData, work_type: e.target.value })}
                  style={selectStyle}
                >
                  <option value="">Select preference</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">On-site</option>
                  <option value="flexible">No preference</option>
                </select>
              </div>
            </div>
          ) : (
            <div style={twoColGrid}>
              <div style={{ ...twoColItem, flex: '1 1 100%' }}>
                <span style={labelStyle}>Desired Job Title</span>
                <span style={profile?.desired_job ? { ...fieldValueStyle, color: '#86EFAC', fontWeight: 600 } : fieldMutedStyle}>
                  {profile?.desired_job || 'Not set'}
                </span>
              </div>
              <div style={twoColItem}>
                <span style={labelStyle}>Target Industry</span>
                <span style={profile?.desired_industry ? fieldValueStyle : fieldMutedStyle}>
                  {profile?.desired_industry || 'Not set'}
                </span>
              </div>
              <div style={twoColItem}>
                <span style={labelStyle}>Work Type</span>
                <span style={profile?.work_type ? { ...fieldValueStyle, textTransform: 'capitalize' } : fieldMutedStyle}>
                  {profile?.work_type || 'Not set'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── SECTION 4: Target Location & Salary Calculator ────────────────── */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <MapPin size={18} color={ACCENT} style={{ marginTop: '2px' }} />
              <div>
                <span style={sectionHeaderStyle}>Where You Want to Live &amp; What to Earn</span>
                <div style={{ color: TEXT_MUTE, fontSize: '0.8rem', paddingLeft: '1rem', marginTop: '0.2rem' }}>
                  Pick the state you want to move to — we'll calculate what salary to look for
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, marginLeft: '1rem' }}>
              {editingLocation && (
                <button onClick={() => setEditingLocation(false)} style={btnSecondary}>
                  <X size={14} /> Cancel
                </button>
              )}
              <button
                onClick={() => editingLocation ? handleSave() : setEditingLocation(true)}
                style={editingLocation ? btnPrimary : btnSecondary}
              >
                {editingLocation ? <><Save size={14} /> Save</> : <><Edit3 size={14} /> Edit</>}
              </button>
            </div>
          </div>

          {editingLocation ? (
            <div style={twoColGrid}>
              <div style={twoColItem}>
                <label style={labelStyle}>Target City</label>
                <input
                  type="text"
                  value={formData.target_city}
                  onChange={(e) => setFormData({ ...formData, target_city: e.target.value })}
                  placeholder="e.g., Austin"
                  style={inputStyle}
                />
              </div>
              <div style={twoColItem}>
                <label style={labelStyle}>Target State</label>
                <select
                  value={formData.target_state}
                  onChange={(e) => setFormData({ ...formData, target_state: e.target.value })}
                  style={selectStyle}
                >
                  <option value="">Select State</option>
                  {US_STATES.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '1.5rem' }}>
                <span style={labelStyle}>Target Location</span>
                <span style={profile?.target_city && profile?.target_state
                  ? { ...fieldValueStyle, color: '#86EFAC', fontWeight: 600 }
                  : fieldMutedStyle}>
                  {profile?.target_city && profile?.target_state
                    ? `${profile.target_city}, ${profile.target_state}`
                    : 'Not set — click Edit to pick where you want to live'}
                </span>
              </div>

              {/* Salary Calculator Results */}
              {profile?.target_state && profile?.monthly_expenses && (() => {
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Cost of living badge */}
                    <div style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: `1px solid ${BORDER}`,
                      borderRadius: '12px',
                      padding: '1rem 1.25rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <div>
                        <div style={{ color: TEXT_PRI, fontWeight: 600, fontSize: '0.92rem', marginBottom: '0.2rem' }}>
                          How Expensive Is {profile.target_state}?
                        </div>
                        <div style={{ color: TEXT_MUTE, fontSize: '0.78rem' }}>
                          {costData.index > 110
                            ? 'Expect to pay more for housing, food, and everyday stuff'
                            : costData.index > 100
                              ? 'Slightly more expensive than most places'
                              : 'Your money goes further here than most places'}
                        </div>
                      </div>
                      <span style={{
                        color: costData.index > 100 ? '#FCA5A5' : '#86EFAC',
                        fontWeight: 700,
                        fontSize: '1rem',
                        whiteSpace: 'nowrap',
                        marginLeft: '1rem',
                      }}>
                        {costData.index > 100
                          ? `${costData.index - 100}% above avg`
                          : costData.index === 100
                            ? 'Average cost'
                            : `${100 - costData.index}% below avg`}
                      </span>
                    </div>

                    {/* Minimum salary */}
                    <div style={{
                      background: 'rgba(34,197,94,0.07)',
                      border: '1px solid rgba(34,197,94,0.18)',
                      borderRadius: '12px',
                      padding: '1.25rem',
                    }}>
                      <div style={{ fontSize: '0.78rem', color: TEXT_SEC, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600, marginBottom: '0.5rem' }}>
                        {salaryCalc.minimumSalary === 0
                          ? "You're Covered"
                          : profile.va_disability && profile.va_disability > 0
                            ? 'The Least Your Job Needs to Pay'
                            : 'The Least You Need to Earn'}
                      </div>
                      {salaryCalc.minimumSalary === 0 ? (
                        <>
                          <div style={{ fontSize: '1.9rem', fontWeight: 700, color: '#86EFAC', marginBottom: '0.3rem' }}>$0 needed from a job</div>
                          <div style={{ fontSize: '0.85rem', color: '#86EFAC' }}>Your VA pay alone covers all your monthly bills</div>
                        </>
                      ) : (
                        <>
                          <div style={{ fontSize: '2.2rem', fontWeight: 700, color: '#86EFAC', lineHeight: 1.1, marginBottom: '0.3rem' }}>
                            ${salaryCalc.minimumSalary.toLocaleString()}
                            <span style={{ fontSize: '1rem', color: TEXT_SEC, fontWeight: 400 }}>/year</span>
                          </div>
                          <div style={{ fontSize: '0.85rem', color: TEXT_SEC, marginBottom: '0.25rem' }}>
                            After taxes, ~${Math.ceil(salaryCalc.breakdown.netMonthly).toLocaleString()}/mo take-home from your paycheck
                          </div>
                          {profile.va_disability && profile.va_disability > 0 && (
                            <div style={{ fontSize: '0.85rem', color: BLUE, padding: '0.5rem 0.75rem', background: 'rgba(96,165,250,0.08)', borderRadius: '8px', marginTop: '0.5rem' }}>
                              This is on top of your ${profile.va_disability.toLocaleString()}/mo VA pay (${(profile.va_disability * 12).toLocaleString()}/yr) — VA pay is tax-free
                            </div>
                          )}
                          <div style={{ fontSize: '0.78rem', color: TEXT_MUTE, marginTop: '0.5rem' }}>
                            This just covers your bills with nothing left over — aim higher if you can
                          </div>
                        </>
                      )}
                    </div>

                    {/* Recommended salary */}
                    {recommendedSalary !== null && recommendedSalary > 0 && (
                      <div style={{
                        background: 'rgba(96,165,250,0.07)',
                        border: '1px solid rgba(96,165,250,0.18)',
                        borderRadius: '12px',
                        padding: '1.25rem',
                      }}>
                        <div style={{ fontSize: '0.78rem', color: TEXT_SEC, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600, marginBottom: '0.5rem' }}>
                          What You Should Aim For
                        </div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 700, color: BLUE, lineHeight: 1.1, marginBottom: '0.3rem' }}>
                          ${recommendedSalary.toLocaleString()}
                          <span style={{ fontSize: '0.9rem', color: TEXT_SEC, fontWeight: 400 }}>/year</span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: TEXT_MUTE }}>
                          Covers your bills and lets you save 20% of your paycheck every month
                        </div>
                      </div>
                    )}

                    {/* Quick facts grid */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                      {[
                        { label: 'Typical Rent There', value: `$${costData.medianRent.toLocaleString()}/mo` },
                        { label: 'Average Salary There', value: `$${costData.medianIncome.toLocaleString()}/yr` },
                        { label: 'Your Monthly Bills', value: `$${profile.monthly_expenses.toLocaleString()}/mo` },
                        { label: 'Your VA Pay', value: `$${(profile.va_disability || 0).toLocaleString()}/mo`, green: true },
                      ].map(({ label, value, green }) => (
                        <div key={label} style={{ flex: '1 1 140px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${BORDER}`, borderRadius: '10px', padding: '0.75rem 1rem' }}>
                          <div style={{ color: TEXT_MUTE, fontSize: '0.76rem', marginBottom: '0.3rem' }}>{label}</div>
                          <div style={{ color: green ? '#86EFAC' : TEXT_PRI, fontWeight: 600, fontSize: '0.95rem' }}>{value}</div>
                        </div>
                      ))}
                    </div>

                    {/* Money breakdown */}
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '1.25rem' }}>
                      <div style={{ color: TEXT_PRI, fontWeight: 600, fontSize: '0.92rem', marginBottom: '0.25rem' }}>Where Your Money Goes Each Month</div>
                      <div style={{ color: TEXT_MUTE, fontSize: '0.78rem', marginBottom: '1rem' }}>Taxes estimated at ~25%</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                        {[
                          { label: 'Paycheck (before taxes)', val: `$${salaryCalc.breakdown.grossMonthly.toLocaleString()}`, color: TEXT_PRI },
                          { label: 'Taxes taken out (~25%)', val: `-$${salaryCalc.breakdown.estimatedTaxes.toLocaleString()}`, color: '#FCA5A5' },
                          { label: 'What you actually take home', val: `$${salaryCalc.breakdown.netMonthly.toLocaleString()}`, color: TEXT_PRI, bold: true, divider: true },
                          ...(salaryCalc.breakdown.vaDisability > 0
                            ? [{ label: '+ VA pay (tax-free)', val: `+$${salaryCalc.breakdown.vaDisability.toLocaleString()}`, color: '#86EFAC' }]
                            : []),
                          { label: 'Total money coming in', val: `$${salaryCalc.breakdown.totalMonthly.toLocaleString()}`, color: '#86EFAC', bold: true, divider: true },
                          { label: 'Your bills', val: `-$${salaryCalc.breakdown.expenses.toLocaleString()}`, color: '#FCA5A5' },
                          {
                            label: salaryCalc.breakdown.surplus >= 0 ? "What's left over" : "You'd be short",
                            val: `${salaryCalc.breakdown.surplus >= 0 ? '+' : ''}$${salaryCalc.breakdown.surplus.toLocaleString()}`,
                            color: salaryCalc.breakdown.surplus >= 0 ? '#86EFAC' : '#FCA5A5',
                            bold: true,
                            divider: true,
                          },
                        ].map((row, i) => (
                          <div
                            key={i}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              paddingTop: row.divider ? '0.5rem' : undefined,
                              borderTop: row.divider ? `1px solid ${BORDER}` : undefined,
                            }}
                          >
                            <span style={{ color: TEXT_SEC, fontSize: '0.88rem' }}>{row.label}</span>
                            <span style={{ color: row.color, fontWeight: row.bold ? 700 : 400, fontSize: '0.88rem' }}>{row.val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null;
              })()}
            </>
          )}
        </div>

        {/* ── SECTION 5: Resumes ────────────────────────────────────────────── */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <FileText size={18} color={ACCENT} />
              <span style={sectionHeaderStyle}>My Resumes</span>
            </div>
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
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.55rem 1.2rem',
                  background: uploadingResume ? 'rgba(255,255,255,0.04)' : ACCENT,
                  color: uploadingResume ? TEXT_MUTE : '#000',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 700,
                  cursor: uploadingResume ? 'not-allowed' : 'pointer',
                  fontSize: '0.88rem',
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                }}
              >
                <Upload size={14} />
                {uploadingResume ? 'Uploading...' : 'Upload Resume'}
              </label>
            </div>
          </div>

          {resumes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: TEXT_MUTE, fontSize: '0.92rem' }}>
              No resumes uploaded yet. Upload your resume to get started.
            </div>
          ) : (
            <div>
              {/* Resume list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {resumes.map((resume) => (
                  <div
                    key={resume.id}
                    onClick={() => setSelectedResume(resume)}
                    style={{
                      padding: '1.1rem 1.25rem',
                      background: selectedResume?.id === resume.id
                        ? 'rgba(251,191,36,0.06)'
                        : 'rgba(255,255,255,0.02)',
                      border: selectedResume?.id === resume.id
                        ? `1px solid rgba(251,191,36,0.3)`
                        : `1px solid ${BORDER}`,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '1rem',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: TEXT_PRI, fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {resume.file_name}
                      </div>
                      <div style={{ color: TEXT_MUTE, fontSize: '0.82rem' }}>
                        Uploaded {new Date(resume.created_at).toLocaleDateString()}
                        {resume.parsed_data?.fullName && ` • ${resume.parsed_data.fullName}`}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteResume(resume.id);
                      }}
                      style={btnDanger}
                    >
                      <X size={13} /> Delete
                    </button>
                  </div>
                ))}
              </div>

              {/* Resume details panel */}
              {selectedResume && selectedResume.parsed_data && (
                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: `1px solid ${BORDER}`,
                  borderRadius: '14px',
                  padding: '1.5rem',
                }}>
                  <h3 style={{ fontFamily: 'var(--font-space-grotesk), sans-serif', color: TEXT_PRI, fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.25rem' }}>
                    Resume Details
                  </h3>

                  {/* Contact Info */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ ...sectionHeaderStyle, fontSize: '0.85rem', marginBottom: '0.85rem' }}>Contact Information</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                      {selectedResume.parsed_data.fullName && (
                        <div style={{ flex: '1 1 160px' }}>
                          <div style={labelStyle}>Name</div>
                          <div style={fieldValueStyle}>{selectedResume.parsed_data.fullName}</div>
                        </div>
                      )}
                      {selectedResume.parsed_data.email && (
                        <div style={{ flex: '1 1 160px' }}>
                          <div style={labelStyle}>Email</div>
                          <div style={fieldValueStyle}>{selectedResume.parsed_data.email}</div>
                        </div>
                      )}
                      {selectedResume.parsed_data.phone && (
                        <div style={{ flex: '1 1 160px' }}>
                          <div style={labelStyle}>Phone</div>
                          <div style={fieldValueStyle}>{selectedResume.parsed_data.phone}</div>
                        </div>
                      )}
                      {selectedResume.parsed_data.location && (
                        <div style={{ flex: '1 1 160px' }}>
                          <div style={labelStyle}>Location</div>
                          <div style={fieldValueStyle}>{selectedResume.parsed_data.location}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Experience */}
                  {selectedResume.parsed_data.experience && selectedResume.parsed_data.experience.length > 0 && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <div style={{ ...sectionHeaderStyle, fontSize: '0.85rem', marginBottom: '0.85rem' }}>Experience</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {selectedResume.parsed_data.experience.map((exp: any, idx: number) => (
                          <div key={idx} style={{
                            padding: '1rem 1.1rem',
                            background: 'rgba(255,255,255,0.03)',
                            border: `1px solid ${BORDER}`,
                            borderRadius: '10px',
                          }}>
                            <div style={{ color: TEXT_PRI, fontWeight: 600, marginBottom: '0.2rem', fontSize: '0.95rem' }}>{exp.title}</div>
                            <div style={{ color: BLUE, marginBottom: '0.35rem', fontSize: '0.9rem' }}>{exp.company}</div>
                            <div style={{ color: TEXT_SEC, fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                              {exp.startDate} — {exp.current ? 'Present' : exp.endDate}
                            </div>
                            <div style={{ color: TEXT_PRI, fontSize: '0.88rem' }}>{exp.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills */}
                  {selectedResume.parsed_data.skills && selectedResume.parsed_data.skills.length > 0 && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <div style={{ ...sectionHeaderStyle, fontSize: '0.85rem', marginBottom: '0.85rem' }}>Skills</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        {selectedResume.parsed_data.skills.map((skillGroup: any, idx: number) => (
                          <div key={idx}>
                            <div style={{ color: TEXT_PRI, fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.45rem' }}>{skillGroup.category}</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                              {skillGroup.items.map((skill: string, skillIdx: number) => (
                                <span
                                  key={skillIdx}
                                  style={{
                                    padding: '0.25rem 0.7rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: `1px solid ${BORDER}`,
                                    borderRadius: '8px',
                                    color: TEXT_PRI,
                                    fontSize: '0.83rem',
                                    fontFamily: 'var(--font-dm-sans), sans-serif',
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
                      <div style={{ ...sectionHeaderStyle, fontSize: '0.85rem', marginBottom: '0.85rem' }}>Education</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {selectedResume.parsed_data.education.map((edu: any, idx: number) => (
                          <div key={idx} style={{
                            padding: '1rem 1.1rem',
                            background: 'rgba(255,255,255,0.03)',
                            border: `1px solid ${BORDER}`,
                            borderRadius: '10px',
                          }}>
                            <div style={{ color: TEXT_PRI, fontWeight: 600, fontSize: '0.95rem' }}>
                              {edu.degree} in {edu.field}
                            </div>
                            <div style={{ color: BLUE, fontSize: '0.9rem', marginTop: '0.2rem' }}>{edu.institution}</div>
                            {edu.graduationDate && (
                              <div style={{ color: TEXT_SEC, fontSize: '0.82rem', marginTop: '0.2rem' }}>{edu.graduationDate}</div>
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
  );
}
