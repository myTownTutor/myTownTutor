import React from 'react';
import { Link } from 'react-router-dom';

const Bullet = ({ children }) => (
  <li className="flex items-start gap-2">
    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
    <span>{children}</span>
  </li>
);

const AccountDeletion = () => {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-8">
        <h1 className="text-2xl font-bold text-gray-900">Account Deletion &amp; Data Requests</h1>

        {/* Deleting Your Account */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Deleting Your Account</h2>
          <div className="text-gray-600 text-sm leading-relaxed space-y-3">
            <p>Users can delete their account at any time from their account settings.</p>
            <p>Once an account deletion request is submitted:</p>
            <ul className="space-y-1 ml-2">
              <Bullet>Your profile will be removed from public view immediately.</Bullet>
              <Bullet>Access to the account will be disabled.</Bullet>
              <Bullet>Personal data will be permanently deleted within 90 days.</Bullet>
            </ul>
            <p>
              Certain information (such as payment records) may be retained where required for
              legal, tax, or fraud-prevention purposes.
            </p>
            <p className="mt-4">
              You can delete your account directly from your{' '}
              <Link to="/student-dashboard" className="text-primary hover:underline font-medium">
                Student Dashboard
              </Link>{' '}
              or{' '}
              <Link to="/mentor-dashboard" className="text-primary hover:underline font-medium">
                Mentor Dashboard
              </Link>{' '}
              under the Danger Zone section.
            </p>
          </div>
        </div>

        {/* Requesting Your Data */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Requesting Your Data</h2>
          <div className="text-gray-600 text-sm leading-relaxed space-y-3">
            <p>You may request:</p>
            <ul className="space-y-1 ml-2">
              <Bullet>A copy of the personal data we store about you.</Bullet>
              <Bullet>Correction of inaccurate information.</Bullet>
              <Bullet>Deletion of your personal data.</Bullet>
            </ul>
            <p className="mt-2">To make a data request, contact:</p>
            <p>
              <a href="mailto:mytowntutor@gmail.com" className="text-primary hover:underline font-medium">
                mytowntutor@gmail.com
              </a>
            </p>
            <p>We may verify your identity before processing the request.</p>
          </div>
        </div>

        {/* Important */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <h2 className="text-base font-bold text-amber-800 mb-2">Important</h2>
          <p className="text-amber-700 text-sm leading-relaxed">
            If you have communicated with other users outside the platform (email, phone, social
            media), we cannot delete data stored outside our system.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccountDeletion;
