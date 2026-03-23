'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import AppNav from '@/components/AppNav'
import UpgradeModal from '@/components/UpgradeModal'
import {
  Upload,
  FileText,
  Briefcase,
  Zap,
  CheckCircle2,
  XCircle,
  ChevronRight,
  TrendingUp,
  Shield,
  Users,
  Star,
  AlertTriangle,
  AlertCircle,
  Lightbulb,
  BarChart2,
  Tag,
  Rocket,
} from 'lucide-react'

export default function AssessmentPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [upgradeInfo, setUpgradeInfo] = useState<{ current: number; limit: number; feature: 'assessment' | 'resume' | 'job_parse' }>({ current: 0, limit: 0, feature: 'assessment' })

  // Resume upload state
  const [existingResumes, setExistingResumes] = useState<any[]>([])
  const [selectedExistingResume, setSelectedExistingResume] = useState<string>('')
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [resumeId, setResumeId] = useState<string | null>(null)
  const [parsedResume, setParsedResume] = useState<any>(null)

  // Job parsing state
  const [jobText, setJobText] = useState('')
  const [jobId, setJobId] = useState<string | null>(null)
  const [parsedJob, setParsedJob] = useState<any>(null)

  // Assessment state
  const [assessment, setAssessment] = useState<any>(null)

  // Fetch existing resumes on mount
  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data } = await supabase
            .from('resumes')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

          if (data) {
            setExistingResumes(data)
          }
        }
      } catch (err) {
        console.error('Error fetching resumes:', err)
      }
    }
    fetchResumes()
  }, [])

  const handleUseExistingResume = () => {
    const resume = existingResumes.find(r => r.id === selectedExistingResume)
    if (resume) {
      setResumeId(resume.id)
      setParsedResume(resume.parsed_data)
      setError(null)
    }
  }

  const handleResumeUpload = async () => {
    if (!resumeFile) return

    setLoading(true)
    setError(null)

    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        throw new Error('You must be logged in to upload a resume')
      }

      const formData = new FormData()
      formData.append('file', resumeFile)

      const response = await fetch('/api/resume/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (data.upgrade) {
        setUpgradeInfo({ current: data.current, limit: data.limit, feature: 'resume' })
        setShowUpgrade(true)
        return
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload resume')
      }

      setResumeId(data.resume.id)
      setParsedResume(data.parsed)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleJobParse = async () => {
    if (!jobText.trim()) return

    setLoading(true)
    setError(null)

    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        throw new Error('You must be logged in to parse a job')
      }

      const response = await fetch('/api/job/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ text: jobText }),
      })

      const data = await response.json()

      if (data.upgrade) {
        setUpgradeInfo({ current: data.current, limit: data.limit, feature: 'job_parse' })
        setShowUpgrade(true)
        return
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to parse job')
      }

      setJobId(data.job.id)
      setParsedJob(data.parsed)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAssessment = async () => {
    if (!resumeId || !jobId) {
      setError('Please upload a resume and parse a job first')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('You must be logged in')

      const response = await fetch('/api/assessment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ resumeId, jobId }),
      })

      const data = await response.json()

      if (data.upgrade) {
        setUpgradeInfo({ current: data.current, limit: data.limit, feature: 'assessment' })
        setShowUpgrade(true)
        return
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create assessment')
      }

      setAssessment(data.result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Derive a color from a score value for sub-score display
  const scoreColor = (score: number) => {
    if (score >= 75) return '#FBBF24'
    if (score >= 50) return '#60A5FA'
    return '#EF4444'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#060A12', color: '#F1F5F9' }}>
      {/* Subtle grid overlay */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <AppNav current="/assessment" />

      <div className="page-content" style={{ position: 'relative', zIndex: 1 }}>
        {/* Page header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h1
            style={{
              fontSize: '2rem',
              fontWeight: 700,
              color: '#FFFFFF',
              marginBottom: '0.5rem',
              fontFamily: 'var(--font-space-grotesk), sans-serif',
              letterSpacing: '-0.01em',
            }}
          >
            Job Application Assessment
          </h1>
          <p style={{ color: '#94A3B8', fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '1rem' }}>
            Upload your resume, paste a job posting, and get AI-powered fit analysis with stability scoring.
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div
            style={{
              marginBottom: '1.5rem',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: '#EF4444',
              padding: '1rem 1.5rem',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontFamily: 'var(--font-dm-sans), sans-serif',
            }}
          >
            <AlertTriangle size={18} style={{ flexShrink: 0 }} />
            {error}
          </div>
        )}

        {/* Step cards grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          {/* Step 1 — Resume */}
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '2rem',
              borderLeft: '3px solid #FBBF24',
            }}
          >
            {/* Card header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(251,191,36,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <FileText size={18} color="#FBBF24" />
              </div>
              <div>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: '#FBBF24',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    fontFamily: 'var(--font-space-grotesk), sans-serif',
                  }}
                >
                  Step 01
                </span>
                <h2
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: '#F1F5F9',
                    margin: 0,
                    fontFamily: 'var(--font-space-grotesk), sans-serif',
                  }}
                >
                  Upload Resume
                </h2>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Existing resume selector */}
              {existingResumes.length > 0 && (
                <>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        color: '#94A3B8',
                        marginBottom: '0.5rem',
                        fontSize: '0.85rem',
                        fontFamily: 'var(--font-dm-sans), sans-serif',
                      }}
                    >
                      Select from uploaded resumes
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <select
                        value={selectedExistingResume}
                        onChange={(e) => setSelectedExistingResume(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '0.75rem 1rem',
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '10px',
                          color: '#F1F5F9',
                          fontSize: '0.9rem',
                          fontFamily: 'var(--font-dm-sans), sans-serif',
                          outline: 'none',
                        }}
                      >
                        <option value="" style={{ background: '#0F1623' }}>Choose a resume...</option>
                        {existingResumes.map((resume) => (
                          <option key={resume.id} value={resume.id} style={{ background: '#0F1623' }}>
                            {resume.file_name} — {new Date(resume.created_at).toLocaleDateString()}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={handleUseExistingResume}
                        disabled={!selectedExistingResume || loading}
                        style={{
                          padding: '0.75rem 1.25rem',
                          borderRadius: '10px',
                          fontWeight: 600,
                          background: !selectedExistingResume || loading ? 'rgba(255,255,255,0.06)' : '#FBBF24',
                          border: !selectedExistingResume || loading ? '1px solid rgba(255,255,255,0.12)' : 'none',
                          color: !selectedExistingResume || loading ? '#64748B' : '#000000',
                          cursor: !selectedExistingResume || loading ? 'not-allowed' : 'pointer',
                          fontSize: '0.875rem',
                          whiteSpace: 'nowrap',
                          fontFamily: 'var(--font-dm-sans), sans-serif',
                          transition: 'background 0.2s',
                        }}
                      >
                        Use
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                    <span style={{ color: '#64748B', fontSize: '0.8rem', fontFamily: 'var(--font-dm-sans), sans-serif' }}>OR</span>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                  </div>
                </>
              )}

              {/* File input */}
              <div>
                <label
                  style={{
                    display: 'block',
                    color: '#94A3B8',
                    marginBottom: '0.5rem',
                    fontSize: '0.85rem',
                    fontFamily: 'var(--font-dm-sans), sans-serif',
                  }}
                >
                  {existingResumes.length > 0 ? 'Upload a new resume' : 'Upload your resume'}
                </label>
                <input
                  type="file"
                  accept=".txt,.pdf,.doc,.docx"
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    color: '#94A3B8',
                    fontSize: '0.875rem',
                    fontFamily: 'var(--font-dm-sans), sans-serif',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Upload button */}
              <button
                onClick={handleResumeUpload}
                disabled={!resumeFile || loading}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  borderRadius: '10px',
                  fontWeight: 600,
                  background: !resumeFile || loading ? 'rgba(255,255,255,0.06)' : '#FBBF24',
                  border: !resumeFile || loading ? '1px solid rgba(255,255,255,0.12)' : 'none',
                  color: !resumeFile || loading ? '#64748B' : '#000000',
                  cursor: !resumeFile || loading ? 'not-allowed' : 'pointer',
                  fontSize: '0.95rem',
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'background 0.2s',
                }}
              >
                <Upload size={16} />
                {loading ? 'Uploading...' : 'Upload & Parse Resume'}
              </button>

              {/* Success state */}
              {parsedResume && (
                <div
                  style={{
                    padding: '1rem',
                    background: 'rgba(251,191,36,0.08)',
                    border: '1px solid rgba(251,191,36,0.25)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                  }}
                >
                  <CheckCircle2 size={18} color="#FBBF24" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <p
                      style={{
                        color: '#FBBF24',
                        fontWeight: 600,
                        marginBottom: '0.2rem',
                        fontSize: '0.875rem',
                        fontFamily: 'var(--font-dm-sans), sans-serif',
                      }}
                    >
                      Resume parsed successfully
                    </p>
                    <p style={{ fontSize: '0.825rem', color: '#94A3B8', fontFamily: 'var(--font-dm-sans), sans-serif' }}>
                      {parsedResume.fullName}
                      {parsedResume.email ? ` — ${parsedResume.email}` : ''}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Step 2 — Job Posting */}
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '2rem',
              borderLeft: '3px solid #60A5FA',
            }}
          >
            {/* Card header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(96,165,250,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Briefcase size={18} color="#60A5FA" />
              </div>
              <div>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: '#60A5FA',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    fontFamily: 'var(--font-space-grotesk), sans-serif',
                  }}
                >
                  Step 02
                </span>
                <h2
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: '#F1F5F9',
                    margin: 0,
                    fontFamily: 'var(--font-space-grotesk), sans-serif',
                  }}
                >
                  Parse Job Posting
                </h2>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p
                style={{
                  color: '#94A3B8',
                  fontSize: '0.875rem',
                  margin: 0,
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                  lineHeight: '1.6',
                }}
              >
                Copy the full job description from LinkedIn, Indeed, or any job board and paste it below.
              </p>

              <textarea
                value={jobText}
                onChange={(e) => setJobText(e.target.value)}
                placeholder="Copy and paste the full job description here..."
                rows={8}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '0.875rem 1rem',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  color: '#F1F5F9',
                  fontSize: '0.9rem',
                  resize: 'vertical',
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                  outline: 'none',
                  boxSizing: 'border-box',
                  lineHeight: '1.6',
                }}
              />

              <button
                onClick={handleJobParse}
                disabled={!jobText.trim() || loading}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  borderRadius: '10px',
                  fontWeight: 600,
                  background: !jobText.trim() || loading ? 'rgba(255,255,255,0.06)' : '#60A5FA',
                  border: !jobText.trim() || loading ? '1px solid rgba(255,255,255,0.12)' : 'none',
                  color: !jobText.trim() || loading ? '#64748B' : '#000000',
                  cursor: !jobText.trim() || loading ? 'not-allowed' : 'pointer',
                  fontSize: '0.95rem',
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'background 0.2s',
                }}
              >
                <Zap size={16} />
                {loading ? 'Parsing...' : 'Parse Job Description'}
              </button>

              {/* Success state */}
              {parsedJob && (
                <div
                  style={{
                    padding: '1rem',
                    background: 'rgba(96,165,250,0.08)',
                    border: '1px solid rgba(96,165,250,0.25)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                  }}
                >
                  <CheckCircle2 size={18} color="#60A5FA" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <p
                      style={{
                        color: '#60A5FA',
                        fontWeight: 600,
                        marginBottom: '0.2rem',
                        fontSize: '0.875rem',
                        fontFamily: 'var(--font-dm-sans), sans-serif',
                      }}
                    >
                      Job parsed successfully
                    </p>
                    <p style={{ fontSize: '0.825rem', color: '#94A3B8', fontFamily: 'var(--font-dm-sans), sans-serif' }}>
                      {parsedJob.jobTitle}
                      {parsedJob.company ? ` at ${parsedJob.company}` : ''}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step 3 — Generate Assessment */}
        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '2rem',
            marginBottom: '1.5rem',
            borderLeft: '3px solid #FBBF24',
          }}
        >
          {/* Card header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(251,191,36,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <BarChart2 size={18} color="#FBBF24" />
            </div>
            <div>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: '#FBBF24',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  fontFamily: 'var(--font-space-grotesk), sans-serif',
                }}
              >
                Step 03
              </span>
              <h2
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: '#F1F5F9',
                  margin: 0,
                  fontFamily: 'var(--font-space-grotesk), sans-serif',
                }}
              >
                Generate Assessment
              </h2>
            </div>
          </div>

          {/* Readiness indicators */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.4rem 0.875rem',
                borderRadius: '8px',
                background: resumeId ? 'rgba(251,191,36,0.1)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${resumeId ? 'rgba(251,191,36,0.3)' : 'rgba(255,255,255,0.1)'}`,
              }}
            >
              {resumeId
                ? <CheckCircle2 size={14} color="#FBBF24" />
                : <XCircle size={14} color="#64748B" />}
              <span
                style={{
                  fontSize: '0.8rem',
                  color: resumeId ? '#FBBF24' : '#64748B',
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                }}
              >
                Resume ready
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.4rem 0.875rem',
                borderRadius: '8px',
                background: jobId ? 'rgba(96,165,250,0.1)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${jobId ? 'rgba(96,165,250,0.3)' : 'rgba(255,255,255,0.1)'}`,
              }}
            >
              {jobId
                ? <CheckCircle2 size={14} color="#60A5FA" />
                : <XCircle size={14} color="#64748B" />}
              <span
                style={{
                  fontSize: '0.8rem',
                  color: jobId ? '#60A5FA' : '#64748B',
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                }}
              >
                Job posting ready
              </span>
            </div>
          </div>

          <button
            onClick={handleCreateAssessment}
            disabled={!resumeId || !jobId || loading}
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: '10px',
              fontWeight: 700,
              background: !resumeId || !jobId || loading ? 'rgba(255,255,255,0.06)' : '#FBBF24',
              border: !resumeId || !jobId || loading ? '1px solid rgba(255,255,255,0.12)' : 'none',
              color: !resumeId || !jobId || loading ? '#64748B' : '#000000',
              cursor: !resumeId || !jobId || loading ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontFamily: 'var(--font-space-grotesk), sans-serif',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.625rem',
              transition: 'background 0.2s',
              letterSpacing: '0.01em',
            }}
          >
            <Zap size={18} />
            {loading ? 'Analyzing your profile...' : 'Run Assessment'}
            {!loading && <ChevronRight size={18} />}
          </button>

          {/* Assessment Results */}
          {assessment && (
            <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

              {/* Overall Fit Score — hero card */}
              <div
                style={{
                  borderRadius: '16px',
                  padding: '2.5rem 2rem',
                  background: 'rgba(251,191,36,0.06)',
                  border: '1px solid rgba(251,191,36,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2.5rem',
                  flexWrap: 'wrap',
                }}
              >
                {/* Circular score display */}
                <div style={{ position: 'relative', width: '120px', height: '120px', flexShrink: 0 }}>
                  <svg width="120" height="120" viewBox="0 0 120 120">
                    {/* Track */}
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="rgba(255,255,255,0.06)"
                      strokeWidth="10"
                    />
                    {/* Progress arc */}
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="#FBBF24"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 50}`}
                      strokeDashoffset={`${2 * Math.PI * 50 * (1 - (assessment.overallFit || 0) / 100)}`}
                      transform="rotate(-90 60 60)"
                      style={{ transition: 'stroke-dashoffset 1s ease' }}
                    />
                  </svg>
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '1.75rem',
                        fontWeight: 800,
                        color: '#FBBF24',
                        fontFamily: 'var(--font-space-grotesk), sans-serif',
                        lineHeight: 1,
                      }}
                    >
                      {assessment.overallFit}
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: '#94A3B8',
                        fontFamily: 'var(--font-dm-sans), sans-serif',
                      }}
                    >
                      / 100
                    </span>
                  </div>
                </div>

                {/* Score label */}
                <div>
                  <p
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#FBBF24',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      fontFamily: 'var(--font-space-grotesk), sans-serif',
                      marginBottom: '0.4rem',
                    }}
                  >
                    Overall Fit Score
                  </p>
                  <p
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      color: '#FFFFFF',
                      fontFamily: 'var(--font-space-grotesk), sans-serif',
                      marginBottom: '0.5rem',
                    }}
                  >
                    {assessment.overallFit >= 80
                      ? 'Strong Match'
                      : assessment.overallFit >= 60
                      ? 'Good Fit'
                      : assessment.overallFit >= 40
                      ? 'Partial Match'
                      : 'Low Match'}
                  </p>
                  <p
                    style={{
                      color: '#94A3B8',
                      fontSize: '0.875rem',
                      fontFamily: 'var(--font-dm-sans), sans-serif',
                      maxWidth: '380px',
                      lineHeight: '1.6',
                    }}
                  >
                    {assessment.verdict || 'AI analysis complete. Review the breakdown below.'}
                  </p>
                </div>
              </div>

              {/* Mission Verdict CTA banner */}
              {(() => {
                const fit = assessment.overallFit || 0
                const isStrong = fit >= 75
                const isDecent = fit >= 55 && fit < 75
                const accentColor = isStrong ? '#22C55E' : isDecent ? '#FBBF24' : '#EF4444'
                const bgColor = isStrong ? 'rgba(34,197,94,0.07)' : isDecent ? 'rgba(251,191,36,0.07)' : 'rgba(239,68,68,0.07)'
                const borderColor = isStrong ? 'rgba(34,197,94,0.25)' : isDecent ? 'rgba(251,191,36,0.25)' : 'rgba(239,68,68,0.25)'
                const headline = isStrong
                  ? 'Apply Now — You\'re a Strong Match'
                  : isDecent
                  ? 'Apply — But Address These Gaps First'
                  : 'Prepare Before Applying'
                const subtext = isStrong
                  ? 'Your background aligns well with this role. Don\'t second-guess it — get your application in.'
                  : isDecent
                  ? 'You have what it takes, but review the gaps and concerns below before you hit submit.'
                  : 'Significant gaps exist between your background and this role. Work through the recommendations below to build your plan.'
                return (
                  <div
                    style={{
                      padding: '1.5rem 2rem',
                      background: bgColor,
                      border: `1px solid ${borderColor}`,
                      borderLeft: `4px solid ${accentColor}`,
                      borderRadius: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1.25rem',
                    }}
                  >
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        background: `rgba(${isStrong ? '34,197,94' : isDecent ? '251,191,36' : '239,68,68'},0.15)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {isStrong
                        ? <Rocket size={20} color={accentColor} />
                        : isDecent
                        ? <AlertCircle size={20} color={accentColor} />
                        : <XCircle size={20} color={accentColor} />}
                    </div>
                    <div>
                      <p
                        style={{
                          margin: '0 0 0.3rem 0',
                          fontWeight: 700,
                          fontSize: '1.05rem',
                          color: accentColor,
                          fontFamily: 'var(--font-space-grotesk), sans-serif',
                        }}
                      >
                        {headline}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: '0.875rem',
                          color: '#94A3B8',
                          fontFamily: 'var(--font-dm-sans), sans-serif',
                          lineHeight: '1.5',
                        }}
                      >
                        {subtext}
                      </p>
                    </div>
                  </div>
                )
              })()}

              {/* Score Breakdown — 3 sub-score tiles */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                {[
                  { label: 'Skills Match', score: assessment.skillsMatch?.score, icon: <Star size={16} />, color: '#FBBF24' },
                  { label: 'Experience', score: assessment.experienceMatch?.score, icon: <TrendingUp size={16} />, color: '#60A5FA' },
                  { label: 'Culture Fit', score: assessment.cultureFit?.score, icon: <Users size={16} />, color: '#fb923c' },
                ].map(({ label, score, icon, color }) => (
                  <div
                    key={label}
                    style={{
                      padding: '1.25rem',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '12px',
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.375rem',
                        color: '#94A3B8',
                        marginBottom: '0.75rem',
                        fontSize: '0.8rem',
                        fontFamily: 'var(--font-dm-sans), sans-serif',
                      }}
                    >
                      <span style={{ color }}>{icon}</span>
                      {label}
                    </div>
                    <div
                      style={{
                        fontSize: '2rem',
                        fontWeight: 800,
                        color,
                        fontFamily: 'var(--font-space-grotesk), sans-serif',
                        lineHeight: 1,
                        marginBottom: '0.5rem',
                      }}
                    >
                      {score ?? '—'}
                      {score != null && <span style={{ fontSize: '1rem', fontWeight: 500 }}>%</span>}
                    </div>
                    {/* Mini bar */}
                    {score != null && (
                      <div
                        style={{
                          height: '3px',
                          borderRadius: '2px',
                          background: 'rgba(255,255,255,0.08)',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${score}%`,
                            background: color,
                            borderRadius: '2px',
                            transition: 'width 0.8s ease',
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Strengths & Concerns */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* Strengths */}
                <div
                  style={{
                    padding: '1.5rem',
                    background: 'rgba(251,191,36,0.05)',
                    border: '1px solid rgba(251,191,36,0.15)',
                    borderRadius: '14px',
                    borderLeft: '3px solid #FBBF24',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    <CheckCircle2 size={18} color="#FBBF24" />
                    <h4
                      style={{
                        fontWeight: 700,
                        color: '#FBBF24',
                        margin: 0,
                        fontFamily: 'var(--font-space-grotesk), sans-serif',
                        fontSize: '1rem',
                      }}
                    >
                      Strengths
                    </h4>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                    {assessment.strengths?.map((strength: string, i: number) => (
                      <li
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.625rem',
                          fontSize: '0.875rem',
                          color: '#94A3B8',
                          fontFamily: 'var(--font-dm-sans), sans-serif',
                          lineHeight: '1.5',
                        }}
                      >
                        <CheckCircle2 size={14} color="#FBBF24" style={{ marginTop: '3px', flexShrink: 0 }} />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Concerns */}
                <div
                  style={{
                    padding: '1.5rem',
                    background: 'rgba(239,68,68,0.05)',
                    border: '1px solid rgba(239,68,68,0.15)',
                    borderRadius: '14px',
                    borderLeft: '3px solid #EF4444',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    <XCircle size={18} color="#EF4444" />
                    <h4
                      style={{
                        fontWeight: 700,
                        color: '#EF4444',
                        margin: 0,
                        fontFamily: 'var(--font-space-grotesk), sans-serif',
                        fontSize: '1rem',
                      }}
                    >
                      Gaps & Concerns
                    </h4>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                    {assessment.concerns?.map((concern: string, i: number) => (
                      <li
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.625rem',
                          fontSize: '0.875rem',
                          color: '#94A3B8',
                          fontFamily: 'var(--font-dm-sans), sans-serif',
                          lineHeight: '1.5',
                        }}
                      >
                        <XCircle size={14} color="#EF4444" style={{ marginTop: '3px', flexShrink: 0 }} />
                        {concern}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Stability Analysis */}
              <div
                style={{
                  padding: '1.5rem',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '14px',
                  borderLeft: '3px solid #a78bfa',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  <Shield size={18} color="#a78bfa" />
                  <h4
                    style={{
                      fontWeight: 700,
                      color: '#F1F5F9',
                      margin: 0,
                      fontFamily: 'var(--font-space-grotesk), sans-serif',
                      fontSize: '1rem',
                    }}
                  >
                    Stability Analysis
                  </h4>
                </div>

                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                  <div
                    style={{
                      padding: '0.75rem 1.25rem',
                      background: 'rgba(167,139,250,0.08)',
                      border: '1px solid rgba(167,139,250,0.2)',
                      borderRadius: '10px',
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        color: '#a78bfa',
                        fontFamily: 'var(--font-space-grotesk), sans-serif',
                        lineHeight: 1,
                        marginBottom: '0.25rem',
                      }}
                    >
                      {Math.round(assessment.stabilityScore?.averageTenure / 12)}
                      <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>yr</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontFamily: 'var(--font-dm-sans), sans-serif' }}>
                      Avg Tenure
                    </div>
                  </div>
                  <div
                    style={{
                      padding: '0.75rem 1.25rem',
                      background: 'rgba(167,139,250,0.08)',
                      border: '1px solid rgba(167,139,250,0.2)',
                      borderRadius: '10px',
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        color: '#a78bfa',
                        fontFamily: 'var(--font-space-grotesk), sans-serif',
                        lineHeight: 1,
                        marginBottom: '0.25rem',
                      }}
                    >
                      {assessment.stabilityScore?.jobChangesCount}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontFamily: 'var(--font-dm-sans), sans-serif' }}>
                      Job Changes
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {assessment.stabilityScore?.positiveIndicators?.length > 0 && (
                    <div>
                      <p
                        style={{
                          fontWeight: 600,
                          color: '#FBBF24',
                          marginBottom: '0.625rem',
                          fontSize: '0.825rem',
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                          fontFamily: 'var(--font-space-grotesk), sans-serif',
                        }}
                      >
                        Positive Indicators
                      </p>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {assessment.stabilityScore.positiveIndicators.map((indicator: string, i: number) => (
                          <li
                            key={i}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '0.5rem',
                              fontSize: '0.85rem',
                              color: '#94A3B8',
                              fontFamily: 'var(--font-dm-sans), sans-serif',
                              lineHeight: '1.5',
                            }}
                          >
                            <CheckCircle2 size={13} color="#FBBF24" style={{ marginTop: '3px', flexShrink: 0 }} />
                            {indicator}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {assessment.stabilityScore?.redFlags?.length > 0 && (
                    <div>
                      <p
                        style={{
                          fontWeight: 600,
                          color: '#EF4444',
                          marginBottom: '0.625rem',
                          fontSize: '0.825rem',
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                          fontFamily: 'var(--font-space-grotesk), sans-serif',
                        }}
                      >
                        Red Flags
                      </p>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {assessment.stabilityScore.redFlags.map((flag: string, i: number) => (
                          <li
                            key={i}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '0.5rem',
                              fontSize: '0.85rem',
                              color: '#94A3B8',
                              fontFamily: 'var(--font-dm-sans), sans-serif',
                              lineHeight: '1.5',
                            }}
                          >
                            <XCircle size={13} color="#EF4444" style={{ marginTop: '3px', flexShrink: 0 }} />
                            {flag}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Keywords section (if present) */}
              {assessment.keywords && assessment.keywords.length > 0 && (
                <div
                  style={{
                    padding: '1.5rem',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '14px',
                    borderLeft: '3px solid #60A5FA',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    <Tag size={18} color="#60A5FA" />
                    <h4
                      style={{
                        fontWeight: 700,
                        color: '#F1F5F9',
                        margin: 0,
                        fontFamily: 'var(--font-space-grotesk), sans-serif',
                        fontSize: '1rem',
                      }}
                    >
                      Keywords
                    </h4>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {assessment.keywords.map((kw: string, i: number) => (
                      <span
                        key={i}
                        style={{
                          padding: '0.3rem 0.875rem',
                          borderRadius: '20px',
                          background: i % 2 === 0 ? 'rgba(251,191,36,0.1)' : 'rgba(96,165,250,0.1)',
                          border: `1px solid ${i % 2 === 0 ? 'rgba(251,191,36,0.25)' : 'rgba(96,165,250,0.25)'}`,
                          color: i % 2 === 0 ? '#FBBF24' : '#60A5FA',
                          fontSize: '0.8rem',
                          fontFamily: 'var(--font-dm-sans), sans-serif',
                          fontWeight: 500,
                        }}
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Detailed Analysis */}
              <div
                style={{
                  padding: '1.5rem',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '14px',
                  borderLeft: '3px solid #FBBF24',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  <FileText size={18} color="#FBBF24" />
                  <h4
                    style={{
                      fontWeight: 700,
                      color: '#F1F5F9',
                      margin: 0,
                      fontFamily: 'var(--font-space-grotesk), sans-serif',
                      fontSize: '1rem',
                    }}
                  >
                    Detailed Analysis
                  </h4>
                </div>
                <p
                  style={{
                    fontSize: '0.9rem',
                    color: '#94A3B8',
                    lineHeight: '1.75',
                    whiteSpace: 'pre-line',
                    fontFamily: 'var(--font-dm-sans), sans-serif',
                    margin: 0,
                  }}
                >
                  {assessment.detailedAnalysis}
                </p>
              </div>

              {/* Recommendations */}
              <div
                style={{
                  padding: '1.5rem',
                  background: 'rgba(96,165,250,0.05)',
                  border: '1px solid rgba(96,165,250,0.15)',
                  borderRadius: '14px',
                  borderLeft: '3px solid #60A5FA',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  <Lightbulb size={18} color="#60A5FA" />
                  <h4
                    style={{
                      fontWeight: 700,
                      color: '#60A5FA',
                      margin: 0,
                      fontFamily: 'var(--font-space-grotesk), sans-serif',
                      fontSize: '1rem',
                    }}
                  >
                    Recommendations
                  </h4>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {assessment.recommendations?.map((rec: string, i: number) => (
                    <li
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.75rem',
                        fontSize: '0.875rem',
                        color: '#94A3B8',
                        fontFamily: 'var(--font-dm-sans), sans-serif',
                        lineHeight: '1.6',
                      }}
                    >
                      <ChevronRight size={15} color="#60A5FA" style={{ marginTop: '3px', flexShrink: 0 }} />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Salary info (if present) */}
              {assessment.salaryInfo && (
                <div
                  style={{
                    padding: '1.5rem',
                    background: 'rgba(251,191,36,0.05)',
                    border: '1px solid rgba(251,191,36,0.15)',
                    borderRadius: '14px',
                    borderLeft: '3px solid #FBBF24',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    <TrendingUp size={18} color="#FBBF24" />
                    <h4
                      style={{
                        fontWeight: 700,
                        color: '#FBBF24',
                        margin: 0,
                        fontFamily: 'var(--font-space-grotesk), sans-serif',
                        fontSize: '1rem',
                      }}
                    >
                      Salary Information
                    </h4>
                  </div>
                  <p
                    style={{
                      fontSize: '0.9rem',
                      color: '#94A3B8',
                      lineHeight: '1.7',
                      fontFamily: 'var(--font-dm-sans), sans-serif',
                      margin: 0,
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {typeof assessment.salaryInfo === 'string'
                      ? assessment.salaryInfo
                      : JSON.stringify(assessment.salaryInfo, null, 2)}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        feature={upgradeInfo.feature}
        currentUsage={upgradeInfo.current}
        limit={upgradeInfo.limit}
      />
    </div>
  )
}
