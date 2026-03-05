import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-50 flex items-center px-4 gap-4 shadow-sm">
      {/* Mobile hamburger */}
      <button
        onClick={onToggleSidebar}
        className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100 transition-colors"
        aria-label="Toggle sidebar"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Logo */}
      <Link to="/" className="flex items-center hover:opacity-90 transition-opacity flex-shrink-0">
        <img src="/logo.png" alt="MyTown Tutor" className="h-9 w-auto object-contain" />
      </Link>

      {/* Search bar (decorative, linked to browse) */}
      <div className="hidden md:flex flex-1 max-w-sm">
        <div
          className="w-full flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 cursor-pointer hover:bg-gray-200 transition-colors"
          onClick={() => navigate('/browse-mentors')}
        >
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-sm text-gray-400">Search Tutors</span>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right nav */}
      <nav className="flex items-center gap-2">
        {!isAuthenticated ? (
          <>
            <Link
              to="/login"
              className="text-sm font-medium text-gray-700 hover:text-primary px-3 py-1.5 rounded-full hover:bg-blue-50 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="text-sm font-semibold bg-primary text-white px-4 py-1.5 rounded-full hover:bg-primary-dark transition-colors"
            >
              Join Now
            </Link>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-gray-600 font-medium">
              Hi, {user?.first_name}
            </span>
            <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm cursor-pointer select-none">
              {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
            </div>
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-gray-600 hover:text-red-600 px-3 py-1.5 rounded-full hover:bg-red-50 transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;

