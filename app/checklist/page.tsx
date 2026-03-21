'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import AppNav from '@/components/AppNav';

const DOCUMENT_ITEMS = [
  {
    id: 'dd214',
    title: 'DD-214 Requested',
    description: 'Certificate of Release or Discharge from Active Duty — the most critical document. Request from milConnect or your unit S1.',
  },
  {
    id: 'medical_records',
    title: 'Service Medical Records Obtained',
    description: 'Request full medical records from your Military Treatment Facility (MTF) before separation. Needed for VA disability claims.',
  },
  {
    id: 'va_claim',
    title: 'VA Disability Claim Filed',
    description: 'File your claim on va.gov before you separate — earlier filing = earlier effective date = more back pay.',
  },
  {
    id: 'ebenefits',
    title: 'eBenefits / VA.gov Account Verified',
    description: 'Create and verify your VA.gov account with Login.gov or ID.me. Required to manage all VA benefits.',
  },
  {
    id: 'tap_cert',
    title: 'TAP Certificate Completed',
    description: 'Transition Assistance Program (TAP) is mandatory for most separating service members. Required before terminal leave.',
  },
  {
    id: 'military_transcripts',
    title: 'Military Transcripts Requested',
    description: 'Request Joint Services Transcript (JST) for Army/Navy/Marines/Coast Guard, or CCAF transcript for Air Force. Free college credit.',
  },
  {
    id: 'les_saved',
    title: 'Final LES Saved',
    description: 'Download your final Leave and Earnings Statement from MyPay. Keep records of BAH, BAS, and special pays for tax purposes.',
  },
  {
    id: 'tricare',
    title: 'TRICARE Transition Plan Set',
    description: 'TRICARE ends 180 days after separation. Transition to TRICARE Select, VA healthcare, or a marketplace plan. Do NOT let coverage lapse.',
  },
  {
    id: 'clearance_docs',
    title: 'Security Clearance Documentation Saved',
    description: 'Save your clearance dates, level, and investigation type. Polygraph details if applicable. Proves clearance status to contractors.',
  },
  {
    id: 'nobe',
    title: 'GI Bill NOBE Obtained',
    description: 'Notice of Basic Eligibility (VA Form 22-1999) confirms your GI Bill entitlement. Required when enrolling in school.',
  },
]

const BENEFITS_ITEMS = [
  {
    id: 'va_healthcare',
    title: 'VA Healthcare Enrolled',
    description: 'Apply at va.gov/health-care/apply. Even if healthy — establishes eligibility and creates a record for future claims. Free or low-cost.',
  },
  {
    id: 'va_disability',
    title: 'VA Disability Rating Claim Filed',
    description: 'File for EVERY service-connected condition, even minor ones. Rating affects pay, housing, education, and property tax exemptions.',
  },
  {
    id: 'gi_bill',
    title: 'GI Bill (Ch. 33 Post-9/11) Applied For',
    description: 'Covers tuition, housing (BAH at E-5 with dependents rate), and books. Apply at va.gov/education. Can also transfer to dependents.',
  },
  {
    id: 'voc_rehab',
    title: 'Vocational Rehab (Ch. 31) Eligibility Checked',
    description: 'If 20%+ disability rating, Voc Rehab may pay for education AND a monthly stipend on top of GI Bill. Often overlooked.',
  },
  {
    id: 'va_home_loan',
    title: 'VA Home Loan COE Obtained',
    description: 'Certificate of Eligibility for VA loan — zero down payment, no PMI. Get it from va.gov even if not buying now.',
  },
  {
    id: 'veterans_preference',
    title: "Veterans' Preference Registered (Federal Hiring)",
    description: '5-point preference for honorable discharge; 10-point for 30%+ disability. Apply using SF-15 on USAJOBS. Major advantage for federal jobs.',
  },
  {
    id: 'sba_vets',
    title: 'SBA Veteran Programs Reviewed',
    description: 'SBA Boots to Business (free entrepreneurship training), veteran-owned small business certification (VOSB/SDVOSB) for government contracts.',
  },
  {
    id: 'state_benefits',
    title: 'State Veteran Benefits Explored',
    description: 'Every state has different benefits: property tax exemptions, free tuition, hiring preference, hunting/fishing licenses. Check your state VA office.',
  },
  {
    id: 'usaa_navy',
    title: 'USAA or Navy Federal Membership Established',
    description: 'Both offer veteran-exclusive rates on banking, insurance, and loans. Join while still on active duty for best eligibility.',
  },
  {
    id: 'vso_enrolled',
    title: 'VSO Enrollment Completed',
    description: 'A Veterans Service Organization (DAV, VFW, American Legion, VVA) will help file and fight your VA claims for FREE. Essential resource.',
  },
]

type ChecklistState = Record<string, boolean>

export default function ChecklistPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [docChecklist, setDocChecklist] = useState<ChecklistState>({});
  const [benefitsChecklist, setBenefitsChecklist] = useState<ChecklistState>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUser(user);

      const { data: profile } = await supabase
        .from('profiles')
        .select('document_checklist, benefits_checklist')
        .eq('id', user.id)
        .single();

      if (profile) {
        setDocChecklist(profile.document_checklist || {});
        setBenefitsChecklist(profile.benefits_checklist || {});
      }
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const saveDoc = useCallback(async (updated: ChecklistState) => {
    if (!user) return;
    setSaving(true);
    await supabase.from('profiles')
      .update({ document_checklist: updated })
      .eq('id', user.id);
    setSaving(false);
  }, [user]);

  const saveBenefits = useCallback(async (updated: ChecklistState) => {
    if (!user) return;
    setSaving(true);
    await supabase.from('profiles')
      .update({ benefits_checklist: updated })
      .eq('id', user.id);
    setSaving(false);
  }, [user]);

  const toggleDoc = (id: string) => {
    const updated = { ...docChecklist, [id]: !docChecklist[id] };
    setDocChecklist(updated);
    saveDoc(updated);
  };

  const toggleBenefit = (id: string) => {
    const updated = { ...benefitsChecklist, [id]: !benefitsChecklist[id] };
    setBenefitsChecklist(updated);
    saveBenefits(updated);
  };

  const docCount = DOCUMENT_ITEMS.filter(i => docChecklist[i.id]).length;
  const benefitsCount = BENEFITS_ITEMS.filter(i => benefitsChecklist[i.id]).length;
  const docPct = Math.round((docCount / DOCUMENT_ITEMS.length) * 100);
  const benefitsPct = Math.round((benefitsCount / BENEFITS_ITEMS.length) * 100);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#060A12' }}>
        <div style={{ color: '#94A3B8' }}>Loading...</div>
      </div>
    );
  }

  const inputStyle = {
    width: '22px',
    height: '22px',
    accentColor: '#FBBF24',
    cursor: 'pointer',
    flexShrink: 0,
    marginTop: '2px',
  };

  const renderSection = (
    title: string,
    subtitle: string,
    items: typeof DOCUMENT_ITEMS,
    state: ChecklistState,
    toggle: (id: string) => void,
    count: number,
    pct: number,
    barColor: string,
    accentColor: string
  ) => (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '16px',
      padding: '2rem',
      marginBottom: '2rem'
    }}>
      {/* Section Header */}
      <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: `1px solid ${accentColor}30` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-space-grotesk), sans-serif', fontWeight: 700, color: '#F8FAFC', margin: 0 }}>
              {title}
            </h2>
            <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginTop: '0.4rem', marginBottom: 0 }}>{subtitle}</p>
          </div>
          <span style={{
            fontSize: '1.1rem',
            fontWeight: 700,
            color: pct === 100 ? '#FBBF24' : '#F8FAFC',
            whiteSpace: 'nowrap',
            marginLeft: '1rem',
            background: pct === 100 ? 'rgba(251,191,36,0.1)' : 'transparent',
            padding: pct === 100 ? '0.2rem 0.6rem' : '0',
            borderRadius: '6px',
            transition: 'all 0.2s'
          }}>
            {count}/{items.length}
          </span>
        </div>
        {/* Progress bar */}
        <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{
            width: `${pct}%`,
            height: '100%',
            background: barColor,
            borderRadius: '3px',
            transition: 'width 0.4s ease'
          }} />
        </div>
      </div>

      {/* Items */}
      <div style={{ display: 'grid', gap: '0' }}>
        {items.map((item, idx) => {
          const checked = !!state[item.id];
          return (
            <div
              key={item.id}
              onClick={() => toggle(item.id)}
              style={{
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-start',
                padding: '1rem 0.5rem',
                borderBottom: idx < items.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                cursor: 'pointer',
                borderRadius: '8px',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(item.id)}
                onClick={(e) => e.stopPropagation()}
                style={inputStyle}
              />
              <div style={{ flex: 1 }}>
                <div style={{
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  color: checked ? '#64748B' : '#F8FAFC',
                  textDecoration: checked ? 'line-through' : 'none',
                  marginBottom: '0.3rem',
                  transition: 'color 0.2s'
                }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: '1.5' }}>
                  {item.description}
                </div>
              </div>
              {checked && (
                <span style={{ color: '#FBBF24', fontSize: '1.1rem', flexShrink: 0 }}>✓</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: '#060A12' }}>
      {/* Grid Background */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'linear-gradient(rgba(251,191,36,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(251,191,36,0.03) 1px, transparent 1px)',
        backgroundSize: '60px 60px', pointerEvents: 'none', zIndex: 0
      }} />

      <AppNav current="/checklist" />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '860px', margin: '0 auto', padding: '3rem 2rem' }}>
        {/* Page Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#F8FAFC', fontFamily: 'var(--font-space-grotesk), sans-serif', marginBottom: '0.5rem' }}>
                Transition Checklist
              </h1>
              <p style={{ color: '#94A3B8', fontSize: '0.95rem' }}>
                Track your documents and benefits before and after separation.
              </p>
            </div>
            {saving && (
              <span style={{ color: '#64748B', fontSize: '0.8rem', fontFamily: 'monospace', marginTop: '0.5rem' }}>
                Saving...
              </span>
            )}
          </div>

          {/* Overall progress */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
            {[
              { label: 'Documents', count: docCount, total: DOCUMENT_ITEMS.length, pct: docPct, color: '#FBBF24' },
              { label: 'Benefits', count: benefitsCount, total: BENEFITS_ITEMS.length, pct: benefitsPct, color: '#60A5FA' },
            ].map(({ label, count, total, pct, color }) => (
              <div key={label} style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '1.25rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                  <span style={{ color: '#94A3B8', fontSize: '0.85rem' }}>{label}</span>
                  <span style={{ fontSize: '0.9rem', color: pct === 100 ? '#FBBF24' : '#F8FAFC', fontWeight: 600 }}>
                    {pct}%
                  </span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: pct === 100 ? '#FBBF24' : color, borderRadius: '3px', transition: 'width 0.4s ease' }} />
                </div>
                <div style={{ color: '#64748B', fontSize: '0.8rem', marginTop: '0.4rem' }}>{count} of {total} complete</div>
              </div>
            ))}
          </div>
        </div>

        {/* Document Prep Section */}
        {renderSection(
          'Document Prep',
          'Critical documents to gather before your separation date',
          DOCUMENT_ITEMS,
          docChecklist,
          toggleDoc,
          docCount,
          docPct,
          '#FBBF24',
          '#FBBF24'
        )}

        {/* Benefits Section */}
        {renderSection(
          'Benefits & Entitlements',
          "Benefits you've earned — many veterans leave these on the table",
          BENEFITS_ITEMS,
          benefitsChecklist,
          toggleBenefit,
          benefitsCount,
          benefitsPct,
          '#60A5FA',
          '#60A5FA'
        )}
      </div>
    </div>
  );
}
