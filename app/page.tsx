'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ background: '#0a0e14' }}>
      {/* Grid Background */}
      <div className="grid-background" />

      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="logo-hex" />
            <span className="logo-text">
              SITREP
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="nav-links-desktop">
            <Link href="/" style={{ color: '#8b949e', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>
              Home
            </Link>
            <Link href="/about" style={{ color: '#8b949e', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>
              About
            </Link>
            <Link href="/dashboard" style={{ color: '#8b949e', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>
              Dashboard
            </Link>
            <Link href="/signup" className="launch-button">
              Get Started →
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="mobile-menu">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} style={{ color: '#8b949e', textDecoration: 'none', fontWeight: 500, padding: '1rem' }}>
              Home
            </Link>
            <Link href="/about" onClick={() => setMobileMenuOpen(false)} style={{ color: '#8b949e', textDecoration: 'none', fontWeight: 500, padding: '1rem' }}>
              About
            </Link>
            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} style={{ color: '#8b949e', textDecoration: 'none', fontWeight: 500, padding: '1rem' }}>
              Dashboard
            </Link>
            <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="launch-button-mobile">
              Get Started →
            </Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        {/* Badge */}
        <div className="badge">
          <span className="badge-dot" />
          <span className="badge-text-desktop">OPERATIONAL // BUILT BY A VETERAN, FOR VETERANS</span>
          <span className="badge-text-mobile">OPERATIONAL</span>
        </div>

        {/* Heading */}
        <h1 className="hero-heading">
          Don't Take Your<br />Next Job Blind
        </h1>

        {/* Subtitle */}
        <p className="hero-subtitle">
          Upload your resume, paste any job posting, and get an instant AI assessment of how well you fit—plus
          a callback diagnostic, target role mapping, application strategy, and a personalized 90-day transition plan.
        </p>

        {/* Buttons */}
        <div className="hero-buttons">
          <Link href="/signup" className="btn-primary" style={{
            padding: '0.875rem 2rem',
            borderRadius: '6px',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #00ff88, #00cc6a)',
            color: '#0a0e14',
            boxShadow: '0 0 25px rgba(0, 255, 136, 0.4)',
            textDecoration: 'none',
            fontSize: '1.05rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            whiteSpace: 'nowrap',
            letterSpacing: '0.02em',
          }}>
            Start Your Assessment →
          </Link>
          <a href="#how-it-works" className="btn-secondary" style={{
            padding: '0.875rem 2rem',
            borderRadius: '6px',
            fontWeight: 700,
            background: 'rgba(0, 255, 136, 0.08)',
            border: '2px solid #00ff88',
            color: '#00ff88',
            textDecoration: 'none',
            fontSize: '1.05rem',
            whiteSpace: 'nowrap',
            letterSpacing: '0.02em',
          }}>
            See How It Works
          </a>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-accent" />
            <div className="stat-value">
              8.2/10
            </div>
            <div className="stat-label">
              Avg Stability Score
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-accent" />
            <div className="stat-value">
              12.4mo
            </div>
            <div className="stat-label">
              Avg Financial Runway
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-accent" />
            <div className="stat-value" style={{ fontSize: '1.5rem' }}>
              AI-Powered
            </div>
            <div className="stat-label">
              Career Guidance
            </div>
          </div>
        </div>
      </section>

      <section className="content-section">
        <div id="how-it-works" className="content-card">
          <h2 className="content-heading">How It Helps You</h2>
          <p className="content-text">
            SITREP gives you the intelligence you need to make confident decisions:
          </p>
          <div className="feature-grid-home">
            <div className="feature-item-home">
              <div className="feature-icon-home">01</div>
              <h3 className="feature-title-home">AI Job Fit Analysis</h3>
              <p className="feature-desc-home">
                Upload your resume, paste a job posting. Get a fit score showing how your military skills and experience match the role.
              </p>
            </div>
            <div className="feature-item-home">
              <div className="feature-icon-home">02</div>
              <h3 className="feature-title-home">Financial Runway</h3>
              <p className="feature-desc-home">
                Know exactly how long you can survive if things don't work out. Plan for the worst.
              </p>
            </div>
            <div className="feature-item-home">
              <div className="feature-icon-home">03</div>
              <h3 className="feature-title-home">90-Day Transition Plan</h3>
              <p className="feature-desc-home">
                AI-generated personalized plan to get you from separation to settled in 90 days.
              </p>
            </div>
            <div className="feature-item-home">
              <div className="feature-icon-home">04</div>
              <h3 className="feature-title-home">AI Transition Q&A</h3>
              <p className="feature-desc-home">
                Ask anything about your transition. Get answers tailored to your situation, not generic advice.
              </p>
            </div>
            <div className="feature-item-home">
              <div className="feature-icon-home">05</div>
              <h3 className="feature-title-home">Callback Diagnostic</h3>
              <p className="feature-desc-home">
                Find out why you&apos;re not getting interviews. AI identifies positioning issues, keyword gaps, and weak framing.
              </p>
            </div>
            <div className="feature-item-home">
              <div className="feature-icon-home">06</div>
              <h3 className="feature-title-home">Target Role Clarity</h3>
              <p className="feature-desc-home">
                Stop applying to everything. AI maps your MOS and skills to the civilian job titles that actually fit.
              </p>
            </div>
            <div className="feature-item-home">
              <div className="feature-icon-home">07</div>
              <h3 className="feature-title-home">Application Strategy</h3>
              <p className="feature-desc-home">
                Get a structured weekly game plan — how many roles to apply to, how to prioritize, and how to track progress.
              </p>
            </div>
          </div>
        </div>

        {/* Why SITREP */}
        <div className="why-sitrep-card">
          <h2 className="content-heading">Why SITREP, Not ChatGPT?</h2>
          <p className="content-text" style={{ marginBottom: '2rem' }}>
            ChatGPT gives you generic answers. SITREP gives you mission-specific intelligence.
          </p>
          <div className="comparison-grid">
            <div className="comparison-col">
              <div className="comparison-header" style={{ color: '#8b949e' }}>ChatGPT</div>
              <div className="comparison-item comparison-negative">Starts from scratch every time</div>
              <div className="comparison-item comparison-negative">Generic career advice for anyone</div>
              <div className="comparison-item comparison-negative">Walls of text, no structured output</div>
              <div className="comparison-item comparison-negative">No tracking or progress over time</div>
            </div>
            <div className="comparison-col">
              <div className="comparison-header" style={{ color: '#00ff88' }}>SITREP</div>
              <div className="comparison-item comparison-positive">Your resume, finances, and MOS are always factored in</div>
              <div className="comparison-item comparison-positive">Built for military-to-civilian transition specifically</div>
              <div className="comparison-item comparison-positive">Fit scores, stability ratings, and actionable plans</div>
              <div className="comparison-item comparison-positive">Track assessments and progress across multiple jobs</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="cta-banner">
          <h2 className="cta-heading">Ready to Get Your SITREP?</h2>
          <p className="cta-text">
            Stop guessing. Start planning. Assess your next opportunity with the same rigor you applied to every mission.
          </p>
          <div className="cta-buttons">
            <Link href="/signup" className="btn-primary" style={{
              padding: '0.875rem 2rem',
              borderRadius: '6px',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #00ff88, #00cc6a)',
              color: '#0a0e14',
              boxShadow: '0 0 25px rgba(0, 255, 136, 0.4)',
              textDecoration: 'none',
              fontSize: '1.05rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              whiteSpace: 'nowrap',
              letterSpacing: '0.02em',
            }}>
              Start Free Assessment →
            </Link>
            <Link href="/about" className="btn-secondary" style={{
              padding: '0.875rem 2rem',
              borderRadius: '6px',
              fontWeight: 700,
              background: 'rgba(0, 255, 136, 0.08)',
              border: '2px solid #00ff88',
              color: '#00ff88',
              textDecoration: 'none',
              fontSize: '1.05rem',
              whiteSpace: 'nowrap',
              letterSpacing: '0.02em',
            }}>
              Learn More
            </Link>
          </div>
        </div>
      </section>

      <style jsx>{`
        /* Grid Background */
        .grid-background {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: linear-gradient(#1e2530 1px, transparent 1px), linear-gradient(90deg, #1e2530 1px, transparent 1px);
          background-size: 50px 50px;
          opacity: 0.3;
          pointer-events: none;
          z-index: 0;
        }

        /* Navigation */
        .navbar {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(10, 14, 20, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid #1e2530;
        }

        .nav-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 1rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo-hex {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #00ff88, #00aaff);
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
          animation: pulse 3s ease-in-out infinite;
        }

        .logo-text {
          font-family: 'JetBrains Mono', monospace;
          font-weight: 700;
          font-size: 1.25rem;
          letter-spacing: 0.05em;
          color: #e6edf3;
        }

        .nav-links-desktop {
          display: flex;
          gap: 2rem;
          align-items: center;
        }

        .mobile-menu-button {
          display: none;
          background: none;
          border: none;
          color: #e6edf3;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.5rem;
        }

        .mobile-menu {
          display: none;
          flex-direction: column;
          padding: 1rem;
          background: rgba(10, 14, 20, 0.98);
          border-top: 1px solid #1e2530;
        }

        .launch-button {
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          font-weight: 600;
          background: linear-gradient(135deg, #00ff88, #00cc6a);
          color: #0a0e14;
          box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
          text-decoration: none;
          font-size: 0.95rem;
          white-space: nowrap;
        }

        .launch-button-mobile {
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          font-weight: 600;
          background: linear-gradient(135deg, #00ff88, #00cc6a);
          color: #0a0e14;
          box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
          text-decoration: none;
          font-size: 0.95rem;
          text-align: center;
          display: block;
          margin-top: 0.5rem;
        }

        /* Hero Section */
        .hero-section {
          position: relative;
          padding: 4rem 1.5rem 3rem;
          max-width: 1400px;
          margin: 0 auto;
          z-index: 1;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: #151921;
          border: 1px solid #1e2530;
          border-radius: 50px;
          font-size: 0.85rem;
          color: #00ff88;
          margin-bottom: 2rem;
          font-family: 'JetBrains Mono', monospace;
        }

        .badge-dot {
          width: 8px;
          height: 8px;
          background: #00ff88;
          border-radius: 50%;
          animation: blink 2s ease-in-out infinite;
        }

        .badge-text-mobile {
          display: none;
        }

        .hero-heading {
          font-size: 3rem;
          font-weight: 700;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          background: linear-gradient(135deg, #e6edf3, #00ff88);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: #8b949e;
          margin-bottom: 2rem;
          max-width: 700px;
          line-height: 1.6;
        }

        .hero-buttons {
          display: flex;
          gap: 1rem;
          margin-bottom: 3rem;
          flex-wrap: wrap;
        }

        .btn-primary {
          padding: 0.875rem 2rem;
          border-radius: 6px;
          font-weight: 700;
          background: linear-gradient(135deg, #00ff88, #00cc6a);
          color: #0a0e14;
          box-shadow: 0 0 25px rgba(0, 255, 136, 0.4);
          text-decoration: none;
          font-size: 1.05rem;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          white-space: nowrap;
          letter-spacing: 0.02em;
        }

        .btn-secondary {
          padding: 0.875rem 2rem;
          border-radius: 6px;
          font-weight: 700;
          background: rgba(0, 255, 136, 0.08);
          border: 2px solid #00ff88;
          color: #00ff88;
          text-decoration: none;
          font-size: 1.05rem;
          white-space: nowrap;
          letter-spacing: 0.02em;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          max-width: 900px;
        }

        .stat-card {
          background: #151921;
          border: 1px solid #1e2530;
          padding: 1.5rem;
          border-radius: 8px;
          position: relative;
          overflow: hidden;
        }

        .stat-card-accent {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #00ff88, #00aaff);
        }

        .stat-value {
          font-size: 2.5rem;
          font-weight: 700;
          font-family: 'JetBrains Mono', monospace;
          color: #00ff88;
          margin-bottom: 0.25rem;
        }

        .stat-label {
          font-size: 0.9rem;
          color: #6e7681;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* Content Sections */
        .content-section {
          position: relative;
          padding: 2rem 1.5rem 4rem;
          max-width: 900px;
          margin: 0 auto;
          z-index: 1;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .content-card {
          background: #151921;
          border: 1px solid #1e2530;
          border-radius: 8px;
          padding: 2rem;
          position: relative;
          overflow: hidden;
        }

        .content-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #00ff88, #00aaff);
        }

        .content-heading {
          font-size: 1.75rem;
          font-weight: 700;
          color: #e6edf3;
          margin-bottom: 1.25rem;
          font-family: 'JetBrains Mono', monospace;
        }

        .content-text {
          font-size: 1.05rem;
          line-height: 1.7;
          color: #8b949e;
          margin-bottom: 1rem;
        }

        .feature-grid-home {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.25rem;
          margin-top: 1.25rem;
        }

        .feature-item-home {
          background: #0a0e14;
          border: 1px solid #1e2530;
          border-radius: 6px;
          padding: 1.5rem;
        }

        .feature-icon-home {
          font-size: 1rem;
          font-weight: 700;
          color: #00ff88;
          font-family: 'JetBrains Mono', monospace;
          margin-bottom: 0.75rem;
          opacity: 0.6;
        }

        .feature-title-home {
          font-size: 1.05rem;
          font-weight: 700;
          color: #e6edf3;
          margin-bottom: 0.5rem;
          font-family: 'JetBrains Mono', monospace;
        }

        .feature-desc-home {
          font-size: 0.9rem;
          line-height: 1.6;
          color: #6e7681;
        }

        .why-sitrep-card {
          background: #151921;
          border: 1px solid #1e2530;
          border-radius: 8px;
          padding: 2rem;
          margin-top: 2rem;
          position: relative;
          overflow: hidden;
        }

        .why-sitrep-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #00aaff, #00ff88);
        }

        .comparison-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .comparison-col {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .comparison-header {
          font-family: 'JetBrains Mono', monospace;
          font-size: 1.1rem;
          font-weight: 700;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid #1e2530;
        }

        .comparison-item {
          font-size: 0.95rem;
          line-height: 1.5;
          padding: 0.5rem 0;
          padding-left: 1.5rem;
          position: relative;
        }

        .comparison-item::before {
          position: absolute;
          left: 0;
          font-size: 0.85rem;
        }

        .comparison-negative {
          color: #6e7681;
        }

        .comparison-negative::before {
          content: '✕';
          color: #f85149;
        }

        .comparison-positive {
          color: #e6edf3;
        }

        .comparison-positive::before {
          content: '✓';
          color: #00ff88;
        }

        .cta-banner {
          background: #0a0e14;
          border: 2px solid #00ff88;
          border-radius: 8px;
          padding: 2.5rem;
          text-align: center;
        }

        .cta-heading {
          font-size: 2rem;
          font-weight: 700;
          color: #e6edf3;
          margin-bottom: 1rem;
          font-family: 'JetBrains Mono', monospace;
        }

        .cta-text {
          font-size: 1.05rem;
          color: #8b949e;
          margin-bottom: 2rem;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .cta-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        /* Animations */
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .nav-links-desktop {
            display: none;
          }

          .mobile-menu-button {
            display: block;
          }

          .mobile-menu {
            display: flex;
          }

          .logo-text {
            font-size: 1rem;
          }

          .logo-hex {
            width: 32px;
            height: 32px;
          }

          .hero-section {
            padding: 3rem 1.5rem 2rem;
          }

          .badge {
            font-size: 0.7rem;
            padding: 0.4rem 0.8rem;
          }

          .badge-text-desktop {
            display: none;
          }

          .badge-text-mobile {
            display: inline;
          }

          .hero-heading {
            font-size: 2rem;
            margin-bottom: 1rem;
          }

          .hero-subtitle {
            font-size: 1rem;
            margin-bottom: 1.5rem;
          }

          .hero-buttons {
            flex-direction: column;
            margin-bottom: 2rem;
          }

          .btn-primary, .btn-secondary {
            width: 100%;
            justify-content: center;
            text-align: center;
          }

          .stats-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .stat-value {
            font-size: 2rem;
          }

          .stat-label {
            font-size: 0.8rem;
          }

          .content-section {
            padding: 1.5rem 1.5rem 3rem;
          }

          .content-card {
            padding: 1.5rem;
          }

          .content-heading {
            font-size: 1.4rem;
          }

          .content-text {
            font-size: 0.95rem;
          }

          .feature-grid-home {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .why-sitrep-card {
            padding: 1.5rem;
          }

          .comparison-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .comparison-header {
            font-size: 1rem;
          }

          .comparison-item {
            font-size: 0.9rem;
          }

          .cta-banner {
            padding: 1.5rem;
          }

          .cta-heading {
            font-size: 1.5rem;
          }

          .cta-buttons {
            flex-direction: column;
          }

          .cta-buttons .btn-primary,
          .cta-buttons .btn-secondary {
            width: 100%;
            justify-content: center;
            text-align: center;
          }
        }

        @media (max-width: 480px) {
          .nav-container {
            padding: 0.75rem 1rem;
          }

          .hero-heading {
            font-size: 1.75rem;
          }

          .hero-subtitle {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
}
