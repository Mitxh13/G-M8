import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="landing-page">
      {/* Navbar */}
      <nav className={`landing-navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="navbar-container">
          <div className="navbar-logo">
            <span>🎓</span>
            GroupMate(G-M8)
          </div>
          <div className="navbar-links">
            <a href="#features" className="navbar-link">Features</a>
            <a href="#how-it-works" className="navbar-link">How It Works</a>
            <Link to="/login" className="navbar-link">Login</Link>
            <Link to="/signup" className="navbar-btn">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Collaborate, Create, and Manage Projects Seamlessly
          </h1>
          <p className="hero-subtitle">
            Empower teachers and students with a powerful platform for project collaboration, class management, and seamless communication.
          </p>
          <div className="hero-buttons">
            <Link to="/signup" className="hero-btn-primary">Get Started</Link>
            <a href="#features" className="hero-btn-secondary">Learn More</a>
          </div>
        </div>
        <div className="hero-illustration">
          <svg className="hero-svg" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor:'#1e40af', stopOpacity:1}} />
                <stop offset="100%" style={{stopColor:'#10b981', stopOpacity:1}} />
              </linearGradient>
            </defs>
            <circle cx="200" cy="150" r="80" fill="url(#grad1)" opacity="0.1"/>
            <circle cx="180" cy="130" r="20" fill="#1e40af"/>
            <circle cx="220" cy="130" r="20" fill="#10b981"/>
            <rect x="170" y="160" width="60" height="40" rx="20" fill="#f3f4f6"/>
            <text x="200" y="185" textAnchor="middle" fill="#1e40af" fontSize="12" fontWeight="bold">TEAM</text>
            <circle cx="160" cy="140" r="8" fill="#fbbf24"/>
            <circle cx="240" cy="140" r="8" fill="#fbbf24"/>
            <path d="M160 140 L170 150 L180 140" stroke="#fbbf24" strokeWidth="2" fill="none"/>
            <path d="M220 140 L230 150 L240 140" stroke="#fbbf24" strokeWidth="2" fill="none"/>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="landing-features">
        <div className="features-container">
          <h2 className="features-title">Why Choose GroupMate(G-M8)?</h2>
          <p className="features-subtitle">
            Discover the features that make project collaboration and class management effortless.
          </p>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">👩‍🏫</div>
              <h3 className="feature-title">Teacher Tools</h3>
              <p className="feature-description">
                Create classes, assign projects, and announce updates with ease.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎓</div>
              <h3 className="feature-title">Student Collaboration</h3>
              <p className="feature-description">
                Join classes, form groups, and manage deadlines efficiently.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3 className="feature-title">Group Chat</h3>
              <p className="feature-description">
                Communicate instantly with your team and stay connected.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📁</div>
              <h3 className="feature-title">File Sharing</h3>
              <p className="feature-description">
                Upload and access materials securely and conveniently.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="landing-how-it-works">
        <div className="how-it-works-container">
          <h2 className="how-it-works-title">How It Works</h2>
          <p className="how-it-works-subtitle">
            Get started with GroupMate(G-M8) in just a few simple steps.
          </p>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <h3 className="step-title">Sign Up</h3>
              <p className="step-description">
                Create your account as a teacher or student.
              </p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">2</div>
              <h3 className="step-title">Create or Join</h3>
              <p className="step-description">
                Teachers create classes, students join them.
              </p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">3</div>
              <h3 className="step-title">Collaborate</h3>
              <p className="step-description">
                Start working on projects and communicate.
              </p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">4</div>
              <h3 className="step-title">Succeed</h3>
              <p className="step-description">
                Achieve your goals with powerful tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-cta">
        <div className="cta-container">
          <h2 className="cta-title">Start Your First Project Today</h2>
          <p className="cta-subtitle">
            Join thousands of educators and students already using GroupMate(G-M8).
          </p>
          <div className="cta-buttons">
            <Link to="/signup" className="cta-btn">Get Started Free</Link>
            <Link to="/login" className="cta-btn">Sign In</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-links">
            <a href="#features" className="footer-link">Features</a>
            <a href="#how-it-works" className="footer-link">How It Works</a>
            <a href="#contact" className="footer-link">Contact</a>
            <a href="#privacy" className="footer-link">Privacy</a>
          </div>
          <p className="footer-copyright">
            © 2024 GroupMate(G-M8). All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
