'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import AppNav from '@/components/AppNav'
import UpgradeModal from '@/components/UpgradeModal'

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

      <AppNav current="/assessment" />

      <div className="page-content">
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 700,
          color: '#e6edf3',
          marginBottom: '0.5rem',
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: '0.05em',
          textTransform: 'uppercase'
        }}>
          Job Application Assessment
        </h1>
        <p style={{ color: '#8b949e', marginBottom: '2rem' }}>
          Upload your resume, parse a job posting, and get AI-powered fit analysis with stability scoring
        </p>

        {error && (
          <div style={{
            marginBottom: '1.5rem',
            background: '#2d1515',
            border: '1px solid #5c2626',
            color: '#ff6b6b',
            padding: '1rem 1.5rem',
            borderRadius: '8px'
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          {/* Resume Upload Section */}
          <div style={{
            background: '#151921',
            border: '1px solid #1e2530',
            borderRadius: '8px',
            padding: '2rem'
          }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              marginBottom: '1.5rem',
              color: '#e6edf3',
              fontFamily: "'JetBrains Mono', monospace"
            }}>
              <span style={{ color: '#00ff88' }}>01.</span> Upload Resume
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Select from existing resumes */}
              {existingResumes.length > 0 && (
                <>
                  <div>
                    <label style={{ display: 'block', color: '#8b949e', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                      Select from uploaded resumes
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <select
                        value={selectedExistingResume}
                        onChange={(e) => setSelectedExistingResume(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '0.75rem',
                          background: '#0a0e14',
                          border: '1px solid #1e2530',
                          borderRadius: '6px',
                          color: '#e6edf3',
                          fontSize: '0.9rem'
                        }}
                      >
                        <option value="">Choose a resume...</option>
                        {existingResumes.map((resume) => (
                          <option key={resume.id} value={resume.id}>
                            {resume.file_name} - {new Date(resume.created_at).toLocaleDateString()}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={handleUseExistingResume}
                        disabled={!selectedExistingResume || loading}
                        style={{
                          padding: '0.75rem 1.5rem',
                          borderRadius: '6px',
                          fontWeight: 600,
                          background: loading || !selectedExistingResume ? '#1e2530' : 'linear-gradient(135deg, #00ff88, #00aaff)',
                          border: 'none',
                          color: loading || !selectedExistingResume ? '#6e7681' : '#0a0e14',
                          cursor: loading || !selectedExistingResume ? 'not-allowed' : 'pointer',
                          fontSize: '0.9rem',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Use Resume
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '0.5rem 0' }}>
                    <div style={{ flex: 1, height: '1px', background: '#1e2530' }} />
                    <span style={{ color: '#6e7681', fontSize: '0.875rem' }}>OR</span>
                    <div style={{ flex: 1, height: '1px', background: '#1e2530' }} />
                  </div>
                </>
              )}

              <div>
                <label style={{ display: 'block', color: '#8b949e', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  {existingResumes.length > 0 ? 'Upload a new resume' : 'Upload your resume'}
                </label>
                <input
                  type="file"
                  accept=".txt,.pdf,.doc,.docx"
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.75rem',
                    background: '#0a0e14',
                    border: '1px solid #1e2530',
                    borderRadius: '6px',
                    color: '#8b949e',
                    fontSize: '0.9rem'
                  }}
                />
              </div>
              <button
                onClick={handleResumeUpload}
                disabled={!resumeFile || loading}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  borderRadius: '6px',
                  fontWeight: 600,
                  background: loading || !resumeFile ? '#1e2530' : 'linear-gradient(135deg, #00ff88, #00aaff)',
                  border: 'none',
                  color: loading || !resumeFile ? '#6e7681' : '#0a0e14',
                  cursor: loading || !resumeFile ? 'not-allowed' : 'pointer',
                  fontSize: '0.95rem',
                  transition: 'all 0.3s'
                }}
              >
                {loading ? 'Uploading...' : 'Upload & Parse Resume'}
              </button>
              {parsedResume && (
                <div style={{
                  padding: '1rem',
                  background: 'rgba(0, 255, 136, 0.1)',
                  border: '1px solid rgba(0, 255, 136, 0.3)',
                  borderRadius: '6px'
                }}>
                  <p style={{ color: '#00ff88', fontWeight: 600, marginBottom: '0.25rem' }}>
                    ✓ Resume parsed successfully
                  </p>
                  <p style={{ fontSize: '0.9rem', color: '#8b949e' }}>
                    {parsedResume.fullName} - {parsedResume.email}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Job URL Parsing Section */}
          <div style={{
            background: '#151921',
            border: '1px solid #1e2530',
            borderRadius: '8px',
            padding: '2rem'
          }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              marginBottom: '1.5rem',
              color: '#e6edf3',
              fontFamily: "'JetBrains Mono', monospace"
            }}>
              <span style={{ color: '#00ff88' }}>02.</span> Parse Job Posting
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ color: '#8b949e', fontSize: '0.875rem', margin: 0 }}>
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
                  padding: '0.75rem',
                  background: '#0a0e14',
                  border: '1px solid #1e2530',
                  borderRadius: '6px',
                  color: '#e6edf3',
                  fontSize: '0.9rem',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />

              <button
                onClick={handleJobParse}
                disabled={!jobText.trim() || loading}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  borderRadius: '6px',
                  fontWeight: 600,
                  background: loading || !jobText.trim() ? '#1e2530' : 'linear-gradient(135deg, #00ff88, #00aaff)',
                  border: 'none',
                  color: loading || !jobText.trim() ? '#6e7681' : '#0a0e14',
                  cursor: loading || !jobText.trim() ? 'not-allowed' : 'pointer',
                  fontSize: '0.95rem',
                  transition: 'all 0.3s'
                }}
              >
                {loading ? 'Parsing...' : 'Parse Job Description'}
              </button>
              {parsedJob && (
                <div style={{
                  padding: '1rem',
                  background: 'rgba(0, 255, 136, 0.1)',
                  border: '1px solid rgba(0, 255, 136, 0.3)',
                  borderRadius: '6px'
                }}>
                  <p style={{ color: '#00ff88', fontWeight: 600, marginBottom: '0.25rem' }}>
                    ✓ Job parsed successfully
                  </p>
                  <p style={{ fontSize: '0.9rem', color: '#8b949e' }}>
                    {parsedJob.jobTitle} at {parsedJob.company}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Assessment Section */}
        <div style={{
          background: '#151921',
          border: '1px solid #1e2530',
          borderRadius: '8px',
          padding: '2rem'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            marginBottom: '1.5rem',
            color: '#e6edf3',
            fontFamily: "'JetBrains Mono', monospace"
          }}>
            <span style={{ color: '#00ff88' }}>03.</span> Generate Assessment
          </h2>
          <button
            onClick={handleCreateAssessment}
            disabled={!resumeId || !jobId || loading}
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: '6px',
              fontWeight: 600,
              background: loading || !resumeId || !jobId ? '#1e2530' : 'linear-gradient(135deg, #00ff88, #00aaff)',
              border: 'none',
              color: loading || !resumeId || !jobId ? '#6e7681' : '#0a0e14',
              cursor: loading || !resumeId || !jobId ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              transition: 'all 0.3s'
            }}
          >
            {loading ? 'Analyzing...' : 'Create Assessment'}
          </button>

          {assessment && (
            <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Overall Fit Score */}
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                background: 'linear-gradient(135deg, #00ff88, #00aaff)',
                borderRadius: '8px',
                color: '#0a0e14'
              }}>
                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  marginBottom: '1rem',
                  fontFamily: "'JetBrains Mono', monospace",
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Overall Fit Score
                </h3>
                <div style={{ fontSize: '4rem', fontWeight: 700 }}>{assessment.overallFit}%</div>
              </div>

              {/* Score Breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                <div style={{
                  padding: '1.5rem',
                  background: '#0a0e14',
                  border: '1px solid #1e2530',
                  borderRadius: '8px'
                }}>
                  <div style={{ fontSize: '0.85rem', color: '#8b949e', marginBottom: '0.5rem' }}>Skills Match</div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: '#00aaff' }}>
                    {assessment.skillsMatch.score}%
                  </div>
                </div>
                <div style={{
                  padding: '1.5rem',
                  background: '#0a0e14',
                  border: '1px solid #1e2530',
                  borderRadius: '8px'
                }}>
                  <div style={{ fontSize: '0.85rem', color: '#8b949e', marginBottom: '0.5rem' }}>Experience</div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: '#00ff88' }}>
                    {assessment.experienceMatch.score}%
                  </div>
                </div>
                <div style={{
                  padding: '1.5rem',
                  background: '#0a0e14',
                  border: '1px solid #1e2530',
                  borderRadius: '8px'
                }}>
                  <div style={{ fontSize: '0.85rem', color: '#8b949e', marginBottom: '0.5rem' }}>Stability</div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: '#a78bfa' }}>
                    {assessment.stabilityScore.score}%
                  </div>
                </div>
                <div style={{
                  padding: '1.5rem',
                  background: '#0a0e14',
                  border: '1px solid #1e2530',
                  borderRadius: '8px'
                }}>
                  <div style={{ fontSize: '0.85rem', color: '#8b949e', marginBottom: '0.5rem' }}>Culture Fit</div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fb923c' }}>
                    {assessment.cultureFit.score}%
                  </div>
                </div>
              </div>

              {/* Stability Analysis */}
              <div style={{
                padding: '1.5rem',
                background: '#0a0e14',
                border: '1px solid #1e2530',
                borderRadius: '8px'
              }}>
                <h4 style={{
                  fontWeight: 600,
                  marginBottom: '1rem',
                  color: '#e6edf3',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '1.1rem'
                }}>
                  Stability Analysis
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
                  <p style={{ color: '#8b949e' }}>
                    <span style={{ fontWeight: 600, color: '#e6edf3' }}>Average Tenure:</span>{' '}
                    {Math.round(assessment.stabilityScore.averageTenure / 12)} years (
                    {assessment.stabilityScore.averageTenure} months)
                  </p>
                  <p style={{ color: '#8b949e' }}>
                    <span style={{ fontWeight: 600, color: '#e6edf3' }}>Job Changes:</span>{' '}
                    {assessment.stabilityScore.jobChangesCount}
                  </p>
                  {assessment.stabilityScore.positiveIndicators.length > 0 && (
                    <div>
                      <p style={{ fontWeight: 600, color: '#00ff88', marginTop: '1rem', marginBottom: '0.5rem' }}>
                        Positive Indicators:
                      </p>
                      <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', color: '#8b949e' }}>
                        {assessment.stabilityScore.positiveIndicators.map(
                          (indicator: string, i: number) => (
                            <li key={i} style={{ marginBottom: '0.25rem' }}>{indicator}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                  {assessment.stabilityScore.redFlags.length > 0 && (
                    <div>
                      <p style={{ fontWeight: 600, color: '#ff6b6b', marginTop: '1rem', marginBottom: '0.5rem' }}>
                        Red Flags:
                      </p>
                      <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', color: '#8b949e' }}>
                        {assessment.stabilityScore.redFlags.map(
                          (flag: string, i: number) => (
                            <li key={i} style={{ marginBottom: '0.25rem' }}>{flag}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Strengths & Concerns */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{
                  padding: '1.5rem',
                  background: 'rgba(0, 255, 136, 0.05)',
                  border: '1px solid rgba(0, 255, 136, 0.2)',
                  borderRadius: '8px'
                }}>
                  <h4 style={{
                    fontWeight: 600,
                    color: '#00ff88',
                    marginBottom: '1rem',
                    fontFamily: "'JetBrains Mono', monospace"
                  }}>
                    Strengths
                  </h4>
                  <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', fontSize: '0.9rem', color: '#8b949e' }}>
                    {assessment.strengths.map((strength: string, i: number) => (
                      <li key={i} style={{ marginBottom: '0.5rem' }}>{strength}</li>
                    ))}
                  </ul>
                </div>
                <div style={{
                  padding: '1.5rem',
                  background: 'rgba(255, 107, 107, 0.05)',
                  border: '1px solid rgba(255, 107, 107, 0.2)',
                  borderRadius: '8px'
                }}>
                  <h4 style={{
                    fontWeight: 600,
                    color: '#ff6b6b',
                    marginBottom: '1rem',
                    fontFamily: "'JetBrains Mono', monospace"
                  }}>
                    Concerns
                  </h4>
                  <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', fontSize: '0.9rem', color: '#8b949e' }}>
                    {assessment.concerns.map((concern: string, i: number) => (
                      <li key={i} style={{ marginBottom: '0.5rem' }}>{concern}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Detailed Analysis */}
              <div style={{
                padding: '1.5rem',
                background: '#0a0e14',
                border: '1px solid #1e2530',
                borderRadius: '8px'
              }}>
                <h4 style={{
                  fontWeight: 600,
                  marginBottom: '1rem',
                  color: '#e6edf3',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '1.1rem'
                }}>
                  Detailed Analysis
                </h4>
                <p style={{ fontSize: '0.95rem', color: '#8b949e', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
                  {assessment.detailedAnalysis}
                </p>
              </div>

              {/* Recommendations */}
              <div style={{
                padding: '1.5rem',
                background: 'rgba(0, 170, 255, 0.05)',
                border: '1px solid rgba(0, 170, 255, 0.2)',
                borderRadius: '8px'
              }}>
                <h4 style={{
                  fontWeight: 600,
                  color: '#00aaff',
                  marginBottom: '1rem',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '1.1rem'
                }}>
                  Recommendations
                </h4>
                <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', fontSize: '0.9rem', color: '#8b949e' }}>
                  {assessment.recommendations.map(
                    (recommendation: string, i: number) => (
                      <li key={i} style={{ marginBottom: '0.5rem' }}>{recommendation}</li>
                    )
                  )}
                </ul>
              </div>
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
