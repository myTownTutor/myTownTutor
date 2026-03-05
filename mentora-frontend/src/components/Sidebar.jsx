import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBrowseFilters } from '../context/BrowseFiltersContext';

const Sidebar = ({ mobileOpen, onClose }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
      isActive(path)
        ? 'bg-primary-light text-primary font-semibold'
        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
    }`;

  const hasRole = (role) => user?.role === role;
  const browseFilters = useBrowseFilters();
  const onBrowsePage = location.pathname === '/browse-mentors';

  const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-primary transition bg-gray-50';

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`fixed top-14 left-0 h-[calc(100vh-56px)] w-64 bg-white border-r border-gray-200 z-40 flex flex-col overflow-y-auto transition-transform duration-200
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        {/* Profile card (when logged in) */}
        {isAuthenticated && user && (
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">
                  {user.first_name} {user.last_name}
                </p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  user.role === 'super_admin'
                    ? 'bg-purple-100 text-purple-700'
                    : user.role === 'mentor'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {user.role === 'super_admin' ? 'Admin' : user.role === 'mentor' ? 'Mentor' : 'Student'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Nav links */}
        <nav className="flex-1 p-3 space-y-1">

          {/* Always visible */}
          <Link to="/" className={linkClass('/')} onClick={onClose}>
            <span></span> Home
          </Link>
          <Link to="/browse-mentors" className={linkClass('/browse-mentors')} onClick={onClose}>
            <span></span> Browse Tutors
          </Link>
          <Link to="/about" className={linkClass('/about')} onClick={onClose}>
            <span></span> About
          </Link>

          {/* Student links */}
          {hasRole('student') && (
            <>
              <hr className="my-2 border-gray-100" />
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider px-3 py-1">Student</p>
              <Link to="/student-dashboard" className={linkClass('/student-dashboard')} onClick={onClose}>
                <span></span> Dashboard
              </Link>
              <Link to="/my-chats" className={linkClass('/my-chats')} onClick={onClose}>
                <span>💬</span> My Chats
              </Link>
            </>
          )}

          {/* Mentor links */}
          {hasRole('mentor') && (
            <>
              <hr className="my-2 border-gray-100" />
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider px-3 py-1">Mentor</p>
              <Link to="/mentor-dashboard" className={linkClass('/mentor-dashboard')} onClick={onClose}>
                <span></span> Dashboard
              </Link>
              <Link to="/my-chats" className={linkClass('/my-chats')} onClick={onClose}>
                <span>💬</span> My Chats
              </Link>
            </>
          )}

          {/* Admin links */}
          {hasRole('super_admin') && (
            <>
              <hr className="my-2 border-gray-100" />
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider px-3 py-1">Admin</p>
              <Link to="/admin-dashboard" className={linkClass('/admin-dashboard')} onClick={onClose}>
                <span>🛡️</span> Dashboard
              </Link>
              <Link to="/admin-users" className={linkClass('/admin-users')} onClick={onClose}>
                <span>👥</span> Manage Users
              </Link>
              <Link to="/admin-contacts" className={linkClass('/admin-contacts')} onClick={onClose}>
                <span>💬</span> All Contacts
              </Link>
            </>
          )}
        </nav>

        {/* Browse Mentors — Filter Panel */}
        {onBrowsePage && browseFilters && (
          <div className="p-4 border-t border-gray-100 space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Filter Tutors</p>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Search</label>
              <input
                type="text" name="search"
                value={browseFilters.filters.search}
                onChange={browseFilters.handleFilterChange}
                placeholder="Name or expertise…"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
              <input
                type="text" name="city"
                value={browseFilters.filters.city}
                onChange={browseFilters.handleFilterChange}
                placeholder="e.g. Delhi, Mumbai"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Gender</label>
              <select name="gender" value={browseFilters.filters.gender} onChange={browseFilters.handleFilterChange} className={inputCls}>
                <option value="">All</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={browseFilters.applyFilters}
                className="flex-1 bg-primary text-white py-1.5 rounded-full text-xs font-semibold hover:bg-primary-dark transition-colors"
              >
                Apply
              </button>
              <button
                onClick={browseFilters.resetFilters}
                className="flex-1 border border-gray-200 text-gray-600 py-1.5 rounded-full text-xs font-medium hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        )}

      </aside>
    </>
  );
};

export default Sidebar;
