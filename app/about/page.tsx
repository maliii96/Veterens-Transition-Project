'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function AboutPage() {
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
            <span className="logo-text">SITREP</span>
          </div>

          {/* Desktop Navigation */}
          <div className="nav-links-desktop">
            <Link href="/" style={{ color: '#8b949e', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>
              Home
            </Link>
            <Link href="/about" style={{ color: '#00ff88', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>
              About
            </Link>
            <Link href="/dashboard" style={{ color: '#8b949e', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem' }}>
              Dashboard
            </Link>
            <Link href="/login" className="launch-button">
              Launch Platform →
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
            <Link href="/about" onClick={() => setMobileMenuOpen(false)} style={{ color: '#00ff88', textDecoration: 'none', fontWeight: 500, padding: '1rem' }}>
              About
            </Link>
            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} style={{ color: '#8b949e', textDecoration: 'none', fontWeight: 500, padding: '1rem' }}>
              Dashboard
            </Link>
            <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="launch-button-mobile">
              Launch Platform →
            </Link>
          </div>
        )}
      </nav>

      {/* Content */}
      <div className="content-wrapper">
        <div className="content-container">
          {/* Header */}
          <div className="header-section">
            <div className="badge">
              <span className="badge-dot" />
              <span>MISSION BRIEF</span>
            </div>
            <h1 className="page-title">
              You Planned Every Mission.<br />
              Why Wing Your Next Job?
            </h1>
          </div>

          {/* Story Section */}
          <div className="story-section">
            <div className="story-card">
              <h2 className="section-heading">The Problem</h2>
              <p className="story-text">
                You spent years learning to assess threats, calculate risks, and execute with precision.
                But when it comes to your transition, you're expected to take the biggest career decision
                of your life on gut feeling and a recruiter's pitch.
              </p>
              <p className="story-text">
                <strong style={{ color: '#00ff88' }}>Sound familiar?</strong>
              </p>
              <ul className="story-list">
                <li>Company says they're "growing fast" — but you have no idea if they're profitable or burning cash</li>
                <li>Recruiter promises "competitive pay" — but you don't know if you can survive a layoff</li>
                <li>Everyone tells you "it's a great opportunity" — but nobody shows you the data</li>
              </ul>
              <p className="story-text">
                We planned every patrol down to the last detail. We rehearsed contingencies. We never went in blind.
                <br /><br />
                <strong style={{ color: '#e6edf3' }}>So why are we doing exactly that with our careers?</strong>
              </p>
            </div>

            <div className="story-card">
              <h2 className="section-heading">Why I Built This</h2>
              <p className="story-text">
                After I separated, I watched too many brothers and sisters take jobs that looked good on paper
                but fell apart within months. Layoffs. Toxic leadership. Companies that didn't give a damn about veterans
                beyond the PR value.
              </p>
              <p className="story-text">
                The pattern was clear: <strong style={{ color: '#ff4444' }}>we were making life-changing decisions without intel.</strong>
              </p>
              <p className="story-text">
                SITREP exists because you deserve better. You deserve to know:
              </p>
              <ul className="story-list">
                <li><strong>How stable is this company?</strong> Revenue trends, funding status, layoff history</li>
                <li><strong>Can I survive financially if this goes south?</strong> Calculate your runway based on real numbers</li>
                <li><strong>Which offer is actually better?</strong> Compare jobs on data, not just base salary</li>
              </ul>
              <p className="story-text">
                This isn't LinkedIn motivation BS. This is operational planning for your transition.
              </p>
            </div>

            <div className="story-card">
              <h2 className="section-heading">How It Helps You</h2>
              <p className="story-text">
                SITREP gives you the intelligence you need to make confident decisions:
              </p>

              <div className="feature-grid">
                <div className="feature-item">
                  <div className="feature-icon">📊</div>
                  <h3 className="feature-title">Company Stability Analysis</h3>
                  <p className="feature-desc">
                    Financial health scores, funding status, layoff history, and revenue trends
                    for 2,800+ companies — so you know what you're walking into.
                  </p>
                </div>

                <div className="feature-item">
                  <div className="feature-icon">💰</div>
                  <h3 className="feature-title">Financial Runway Calculator</h3>
                  <p className="feature-desc">
                    Input your savings, expenses, and benefits. Know exactly how long you can survive
                    if the job doesn't work out. Plan for the worst, hope for the best.
                  </p>
                </div>

                <div className="feature-item">
                  <div className="feature-icon">⚖️</div>
                  <h3 className="feature-title">Offer Comparison Tool</h3>
                  <p className="feature-desc">
                    Compare multiple job offers side-by-side. Factor in stability, benefits, location costs,
                    and total compensation — not just the base salary recruiters lead with.
                  </p>
                </div>

                <div className="feature-item">
                  <div className="feature-icon">🎯</div>
                  <h3 className="feature-title">Risk Assessment</h3>
                  <p className="feature-desc">
                    Get a clear risk score for each opportunity. Red flags, green lights, and
                    everything in between — presented the way we're used to getting briefings.
                  </p>
                </div>
              </div>
            </div>

            <div className="story-card">
              <h2 className="section-heading">Built By Veterans, For Veterans</h2>
              <p className="story-text">
                This platform was created by someone who's been exactly where you are. I know what it's like to
                translate your MOS into civilian speak, to wonder if you're underselling yourself, to feel lost
                in a world that doesn't understand what you bring to the table.
              </p>
              <p className="story-text">
                SITREP doesn't solve every transition challenge. But it gives you one thing you didn't have before:
                <strong style={{ color: '#00ff88' }}> actionable intelligence on the jobs you're considering.</strong>
              </p>
              <p className="story-text">
                You planned every mission. Now plan your transition with the same level of precision.
              </p>
            </div>

            {/* CTA Section */}
            <div className="cta-section">
              <h2 className="cta-heading">Ready to Get Your SITREP?</h2>
              <p className="cta-text">
                Stop guessing. Start planning. Assess your next opportunity with the same rigor you applied to every mission.
              </p>
              <div className="cta-buttons">
                <Link href="/signup" className="btn-primary">
                  Start Free Assessment →
                </Link>
                <Link href="/dashboard" className="btn-secondary">
                  See How It Works
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
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

        /* Content */
        .content-wrapper {
          position: relative;
          z-index: 1;
          padding: 2rem 1.5rem 4rem;
        }

        .content-container {
          max-width: 900px;
          margin: 0 auto;
        }

        .header-section {
          margin-bottom: 3rem;
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
          margin-bottom: 1.5rem;
          font-family: 'JetBrains Mono', monospace;
        }

        .badge-dot {
          width: 8px;
          height: 8px;
          background: #00ff88;
          border-radius: 50%;
          animation: blink 2s ease-in-out infinite;
        }

        .page-title {
          font-size: 2.5rem;
          font-weight: 700;
          line-height: 1.2;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #e6edf3, #00ff88);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .story-section {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .story-card {
          background: #151921;
          border: 1px solid #1e2530;
          border-radius: 8px;
          padding: 2rem;
          position: relative;
        }

        .story-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #00ff88, #00aaff);
        }

        .section-heading {
          font-size: 1.75rem;
          font-weight: 700;
          color: #e6edf3;
          margin-bottom: 1.25rem;
          font-family: 'JetBrains Mono', monospace;
        }

        .story-text {
          font-size: 1.1rem;
          line-height: 1.7;
          color: #8b949e;
          margin-bottom: 1.25rem;
        }

        .story-list {
          list-style: none;
          padding-left: 0;
          margin: 1.5rem 0;
        }

        .story-list li {
          font-size: 1.05rem;
          line-height: 1.6;
          color: #8b949e;
          margin-bottom: 0.75rem;
          padding-left: 1.75rem;
          position: relative;
        }

        .story-list li::before {
          content: '▸';
          position: absolute;
          left: 0;
          color: #00ff88;
          font-weight: 700;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
          margin-top: 1.5rem;
        }

        .feature-item {
          background: #0a0e14;
          border: 1px solid #1e2530;
          border-radius: 6px;
          padding: 1.5rem;
        }

        .feature-icon {
          font-size: 2rem;
          margin-bottom: 0.75rem;
        }

        .feature-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #e6edf3;
          margin-bottom: 0.5rem;
          font-family: 'JetBrains Mono', monospace;
        }

        .feature-desc {
          font-size: 0.95rem;
          line-height: 1.6;
          color: #6e7681;
        }

        .cta-section {
          background: #0a0e14;
          border: 2px solid #00ff88;
          border-radius: 8px;
          padding: 2.5rem;
          text-align: center;
          margin-top: 3rem;
        }

        .cta-heading {
          font-size: 2rem;
          font-weight: 700;
          color: #e6edf3;
          margin-bottom: 1rem;
          font-family: 'JetBrains Mono', monospace;
        }

        .cta-text {
          font-size: 1.1rem;
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

        .btn-primary {
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          font-weight: 600;
          background: linear-gradient(135deg, #00ff88, #00cc6a);
          color: #0a0e14;
          box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
          text-decoration: none;
          font-size: 0.95rem;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          white-space: nowrap;
        }

        .btn-secondary {
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          font-weight: 600;
          background: transparent;
          border: 2px solid #1e2530;
          color: #e6edf3;
          text-decoration: none;
          font-size: 0.95rem;
          white-space: nowrap;
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

          .page-title {
            font-size: 1.75rem;
          }

          .section-heading {
            font-size: 1.4rem;
          }

          .story-text {
            font-size: 1rem;
          }

          .story-card {
            padding: 1.5rem;
          }

          .feature-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .cta-section {
            padding: 1.5rem;
          }

          .cta-heading {
            font-size: 1.5rem;
          }

          .cta-buttons {
            flex-direction: column;
          }

          .btn-primary, .btn-secondary {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .page-title {
            font-size: 1.5rem;
          }

          .section-heading {
            font-size: 1.25rem;
          }

          .story-text {
            font-size: 0.95rem;
          }
        }
      `}</style>
    </div>
  );
}
