import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-white font-bold text-lg mb-3">🎓 myTown Tutor</h3>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Connecting students with skilled tutors to make learning simple and effective.
            </p>
            <div className="flex gap-3">
              {[
                { label: 'in', href: 'https://linkedin.com' },
                { label: '📧', href: 'mailto:mytowntutor@gmail.com' },
                { label: 'f', href: 'https://facebook.com' },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-gray-700 hover:bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Students */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">For Students</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">How It Works</Link></li>
              <li><Link to="/browse-mentors" className="hover:text-white transition-colors">Find a Tutor</Link></li>
              
            </ul>
          </div>

          {/* Mentors */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">For Tutors</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/signup" className="hover:text-white transition-colors">Become a Tutor</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">Resources</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-white transition-colors">About us</Link></li>
              <li><a href="mailto:mytowntutor@gmail.com" className="hover:text-white transition-colors">Contact/Support</a></li>
              
              <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms &amp; Conditions</Link></li>
              <li><Link to="/refund-policy" className="hover:text-white transition-colors">Refund Policy</Link></li>
              <li><Link to="/account-deletion" className="hover:text-white transition-colors">Account Deletion</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-500">
          &copy; {currentYear} myTown Tutor. All rights reserved. Aligarh, India.
        </div>
      </div>
    </footer>
  );
};

export default Footer;


