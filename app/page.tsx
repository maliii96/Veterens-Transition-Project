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
            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} style={{ color: '#8b949e', textDecoration: 'none', fontWeight: 500, padding: '1rem' }}>
              Dashboard
            </Link>
            <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="launch-button-mobile">
              Launch Platform →
            </Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        {/* Badge */}
        <div className="badge">
          <span className="badge-dot" />
          <span className="badge-text-desktop">OPERATIONAL // 1,200+ VETERANS SUPPORTED</span>
          <span className="badge-text-mobile">OPERATIONAL</span>
        </div>

        {/* Heading */}
        <h1 className="hero-heading">
          Don't Take Your<br />Next Job Blind
        </h1>

        {/* Subtitle */}
        <p className="hero-subtitle">
          Data-driven job security analysis for transitioning service members.
          Assess stability, calculate financial runway, compare offers—all in one platform.
        </p>

        {/* Buttons */}
        <div className="hero-buttons">
          <Link href="/signup" className="btn-primary">
            Start Your Assessment →
          </Link>
          <Link href="/dashboard" className="btn-secondary">
            See How It Works
          </Link>
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
            <div className="stat-value">
              2,800+
            </div>
            <div className="stat-label">
              Companies Analyzed
            </div>
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
