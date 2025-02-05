import Link from "next/link"
import "./styles/landing.css"

export default function LandingPage() {
  const loginPortals = [
    {
      title: "Administrative Portal",
      description: "Access administrative controls and system settings",
      path: "/pages/administrative-login",
      gradient: "linear-gradient(to right, #3b82f6, #06b6d4)",
    },
    {
      title: "Boss Portal",
      description: "Management dashboard and oversight tools",
      path: "/pages/boss-login",
      gradient: "linear-gradient(to right, #8b5cf6, #ec4899)",
    },
    {
      title: "Employee Portal",
      description: "Access your work dashboard and tools",
      path: "/pages/employee-login",
      gradient: "linear-gradient(to right, #10b981, #14b8a6)",
    },
    {
      title: "HR Admin Portal",
      description: "Human resources administration and management",
      path: "/pages/hr-admin-login",
      gradient: "linear-gradient(to right, #f97316, #ef4444)",
    },
    {
      title: "HR Portal",
      description: "Access HR tools and employee management",
      path: "/pages/human-resource-login",
      gradient: "linear-gradient(to right, #f43f5e, #ec4899)",
    },
    {
      title: "Super Admin Portal",
      description: "Complete system control and administration",
      path: "/pages/super-admin-login",
      gradient: "linear-gradient(to right, #6366f1, #8b5cf6)",
    },
  ]

  return (
    <div>
      <header className="header">
        <div className="container header-content">
          <div className="logo">OfficeOS</div>
          <nav className="nav-links">
            <Link href="#portals" className="nav-link">
              Login Portals
            </Link>
            <Link href="#features" className="nav-link">
              Features
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="container">
            <h1>Office Management System</h1>
            <p>
              Streamline your office operations with our comprehensive management solution. Select your portal to access
              your dashboard.
            </p>
          </div>
        </section>

        <section id="portals" className="portals-section">
          <div className="container">
            <h2>Login Portals</h2>
            <div className="portals-grid">
              {loginPortals.map((portal, index) => (
                <Link href={portal.path} key={index} className="portal-card">
                  <div className="portal-gradient" style={{ background: portal.gradient }}></div>
                  <div className="portal-content">
                    <h3 className="portal-title">{portal.title}</h3>
                    <p className="portal-description">{portal.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="features-section">
          <div className="container">
            <h2>System Features</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon" style={{ backgroundColor: "rgba(59, 130, 246, 0.1)" }}>
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h3 className="feature-title">Secure Access</h3>
                <p className="feature-description">Role-based authentication and authorization</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon" style={{ backgroundColor: "rgba(16, 185, 129, 0.1)" }}>
                  <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <h3 className="feature-title">Centralized Management</h3>
                <p className="feature-description">All office operations in one place</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon" style={{ backgroundColor: "rgba(139, 92, 246, 0.1)" }}>
                  <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="feature-title">Advanced Analytics</h3>
                <p className="feature-description">Comprehensive reporting and insights</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          <p className="footer-text">&copy; {new Date().getFullYear()} OfficeOS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

