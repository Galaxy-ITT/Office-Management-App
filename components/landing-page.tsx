"use client"

import "./styles/landing.css"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="landing-page">
      <header>
        <div className="container">
          <div className="logo">OfficeOS</div>
          <nav>
            <Link href="#features">Features</Link>
            <Link href="#contact">Contact</Link>
            <Link href="/pages/admins-login" className="btn btn-primary">
              Login
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="container">
            <h1>Streamline Your Office Management</h1>
            <p>
              OfficeOS provides a comprehensive solution to manage your office operations efficiently. Boost
              productivity and simplify administration with our powerful tools.
            </p>
            <Link href="/pages/admins-login" className="btn btn-large btn-primary">
              Get Started
            </Link>
          </div>
        </section>

        <section id="features" className="features">
          <div className="container">
            <h2>Key Features</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3>Secure Access</h3>
                <p>Role-based authentication and authorization for maximum security.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </div>
                <h3>Centralized Management</h3>
                <p>Manage all office operations from a single, intuitive dashboard.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3>Advanced Analytics</h3>
                <p>Gain valuable insights with comprehensive reporting and analytics tools.</p>
              </div>
            </div>
          </div>
        </section>

      </main>

      <footer>
        <div className="container">
          <p>&copy; {new Date().getFullYear()} OfficeOS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

