import { Building2, Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';

export default function Footer() {
  const { user } = useApp();
  const homeRoute = user ? (user.role === 'seeker' ? '/job-seeker/dashboard' : '/recruiter/dashboard') : '/';

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div>
          <Link className="brand footer-brand" to={homeRoute} aria-label="HireHub Home">
            <span className="brand-icon">
              <img src="/assets/hirehub-icon.png" alt="HireHub" className="brand-icon-img" />
            </span>
            <span className="brand-text">hirehub</span>
          </Link>
          <p>Good work starts with the right opportunity.</p>
        </div>

        {user?.role === 'seeker' ? (
          <>
            <div className="footer-column">
              <strong>Your Workspace</strong>
              <Link to="/job-seeker/dashboard">My Dashboard</Link>
              <Link to="/jobs">Find Jobs</Link>
              <Link to="/job-seeker/applications">My Applications</Link>
              <Link to="/job-seeker/saved-jobs">Saved Jobs</Link>
            </div>
            <div className="footer-column">
              <strong>Career & Prep</strong>
              <Link to="/job-seeker/up-skill">Up Skill & Prep</Link>
              <Link to="/job-seeker/profile">My Profile</Link>
              <Link to="/job-seeker/notifications">Notifications</Link>
              <Link to="/job-seeker/settings">Settings</Link>
            </div>
            <div className="footer-column">
              <strong>Contact & Support</strong>
              <a href="tel:+918041235678" className="footer-contact-item" title="Toll-Free Support">
                <Phone size={13} /> +91 (080) 4123-5678
              </a>
              <a href="tel:+919876543210" className="footer-contact-item" title="Candidate Helpline">
                <Phone size={13} /> +91 98765 43210
              </a>
              <a href="mailto:support@hirehub.in" className="footer-contact-item">
                <Mail size={13} /> support@hirehub.in
              </a>
              <a href="mailto:careers@hirehub.in" className="footer-contact-item">
                <Mail size={13} /> careers@hirehub.in
              </a>
              <span className="footer-contact-item" title="Corporate Office">
                <MapPin size={13} /> Rajpura, Punjab 140401
              </span>
              <span className="footer-location-chip">
                <MapPin size={13} /> Active Across India & Punjab
              </span>
            </div>
          </>
        ) : user?.role === 'recruiter' ? (
          <>
            <div className="footer-column">
              <strong>Hiring Workspace</strong>
              <Link to="/recruiter/dashboard">Recruiter Dashboard</Link>
              <Link to="/recruiter/jobs">Manage Jobs</Link>
              <Link to="/recruiter/jobs/create">Post a Job</Link>
              <Link to="/recruiter/candidates">Candidate Search</Link>
            </div>
            <div className="footer-column">
              <strong>Platform & Tools</strong>
              <Link to="/jobs">Public Job Board</Link>
              <Link to="/recruiter/notifications">Notifications</Link>
              <Link to="/recruiter/settings">Company Settings</Link>
              <Link to="/job-seeker/up-skill">Candidate Prep Hub</Link>
            </div>
            <div className="footer-column">
              <strong>Recruiter Support</strong>
              <a href="tel:+918041239900" className="footer-contact-item" title="Hiring Solutions Desk">
                <Phone size={13} /> +91 (080) 4123-9900
              </a>
              <a href="tel:+919845011223" className="footer-contact-item" title="Account Manager Hotline">
                <Phone size={13} /> +91 98450 11223
              </a>
              <a href="mailto:recruiter-team@hirehub.in" className="footer-contact-item">
                <Mail size={13} /> recruiter-team@hirehub.in
              </a>
              <a href="mailto:enterprise@hirehub.in" className="footer-contact-item">
                <Mail size={13} /> enterprise@hirehub.in
              </a>
              <span className="footer-contact-item" title="Punjab HQ">
                <Building2 size={13} /> Rajpura, Punjab 140401
              </span>
              <span className="footer-location-chip">
                <MapPin size={13} /> Nationwide Talent Reach
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="footer-column">
              <strong>Explore</strong>
              <Link to="/jobs">Find Jobs</Link>
              <Link to="/#companies">Featured Companies</Link>
              <Link to="/login">Sign In</Link>
              <Link to="/register">Create an Account</Link>
            </div>
            <div className="footer-column">
              <strong>For Teams</strong>
              <Link to="/register?role=recruiter">Hire with HireHub</Link>
              <Link to="/login">Recruiter Portal</Link>
              <Link to="/jobs">Browse Roles</Link>
            </div>
            <div className="footer-column">
              <strong>Contact & Helpdesk</strong>
              <a href="tel:+918041235678" className="footer-contact-item" title="General Desk">
                <Phone size={13} /> +91 (080) 4123-5678
              </a>
              <a href="tel:+919876543210" className="footer-contact-item" title="Candidate Support Line">
                <Phone size={13} /> +91 98765 43210
              </a>
              <a href="mailto:hello@hirehub.in" className="footer-contact-item">
                <Mail size={13} /> hello@hirehub.in
              </a>
              <a href="mailto:support@hirehub.in" className="footer-contact-item">
                <Mail size={13} /> support@hirehub.in
              </a>
              <span className="footer-contact-item" title="HQ Office">
                <MapPin size={13} /> Rajpura, Punjab 140401
              </span>
              <span className="footer-location-chip">
                <MapPin size={13} /> India's Skills-First Platform
              </span>
            </div>
          </>
        )}
      </div>
      <div className="footer-bottom">
        <span>© 2026 HireHub · A local demo for skills-first hiring</span>
        <span>Rajpura, Punjab · India</span>
      </div>
    </footer>
  );
}
