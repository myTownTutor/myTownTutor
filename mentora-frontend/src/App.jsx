import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import SignUp from './pages/SignUp';
import LogIn from './pages/LogIn';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import StudentDashboard from './pages/StudentDashboard';
import BrowseMentors from './pages/BrowseMentors';
import MentorProfile from './pages/MentorProfile';
import ContactMentor from './pages/ContactMentor';
import MyContacts from './pages/MyContacts';
import MentorDashboard from './pages/MentorDashboard';
import MentorProfileSetup from './pages/MentorProfileSetup';
import PaymentPage from './pages/PaymentPage';
import ViewEnquiries from './pages/ViewEnquiries';
import AdminDashboard from './pages/AdminDashboard';
import ManageUsers from './pages/ManageUsers';
import ViewAllContacts from './pages/ViewAllContacts';
import MyChats from './pages/MyChats';
import ChatBox from './pages/ChatBox';

import { BrowseFiltersProvider } from './context/BrowseFiltersContext';
import './styles/index.css';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Router>
      <AuthProvider>
        <BrowseFiltersProvider>
        <div className="min-h-screen bg-linkedin-bg flex flex-col font-sans">
          {/* Top Navbar */}
          <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

          {/* Body: Sidebar + Content */}
          <div className="flex pt-14 flex-1">
            {/* Sidebar */}
            <Sidebar
              mobileOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
            />

            {/* Main content */}
            <main className="flex-1 min-w-0 lg:ml-64">
              <div className="px-4 py-4">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/login" element={<LogIn />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/browse-mentors" element={<BrowseMentors />} />
                  <Route path="/mentor/:mentorId" element={<MentorProfile />} />

                  {/* Student Routes */}
                  <Route
                    path="/student-dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <StudentDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/contact-mentor/:mentorId"
                    element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <ContactMentor />
                      </ProtectedRoute>
                    }
                  />
                  {/* Mentor Routes */}
                  <Route
                    path="/mentor-dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['mentor']}>
                        <MentorDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/mentor-profile-setup"
                    element={
                      <ProtectedRoute allowedRoles={['mentor']}>
                        <MentorProfileSetup />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/payment"
                    element={
                      <ProtectedRoute allowedRoles={['mentor']}>
                        <PaymentPage />
                      </ProtectedRoute>
                    }
                  />
                  {/* Chat Routes (student + mentor) */}
                  <Route
                    path="/my-chats"
                    element={
                      <ProtectedRoute allowedRoles={['student', 'mentor']}>
                        <MyChats />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/chat/:conversationId"
                    element={
                      <ProtectedRoute allowedRoles={['student', 'mentor']}>
                        <ChatBox />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Routes */}
                  <Route
                    path="/admin-dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['super_admin']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin-users"
                    element={
                      <ProtectedRoute allowedRoles={['super_admin']}>
                        <ManageUsers />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin-contacts"
                    element={
                      <ProtectedRoute allowedRoles={['super_admin']}>
                        <ViewAllContacts />
                      </ProtectedRoute>
                    }
                  />

                  {/* 404 */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
              <Footer />
            </main>
          </div>

        </div>
        </BrowseFiltersProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

