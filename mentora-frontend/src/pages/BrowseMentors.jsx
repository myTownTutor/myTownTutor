import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBrowseFilters } from '../context/BrowseFiltersContext';
import api from '../services/api';

const BrowseMentors = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { filters, triggerSearch } = useBrowseFilters();
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => { fetchMentors(); }, [currentPage, triggerSearch]);

  // Reset to page 1 whenever triggerSearch fires (not on mount)
  const [isFirstRender, setIsFirstRender] = useState(true);
  useEffect(() => {
    if (isFirstRender) { setIsFirstRender(false); return; }
    setCurrentPage(1);
  }, [triggerSearch]);

  const fetchMentors = async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, per_page: 12, search: filters.search, city: filters.city, gender: filters.gender };
      const response = await api.get('/mentors/approved', { params });
      setMentors(response.data.mentors);
      setTotalPages(response.data.pages);
    } catch (err) { setError('Failed to load mentors'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4 pb-[100px]">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Browse Tutors</h1>
          <p className="text-gray-500 text-sm">Find the right tutor for your goals</p>
        </div>
       
      </div>

      {/* Tutor Grid */}
      <div>
          {error && <div className="error-message">{error}</div>}

          {loading ? (
            <div className="text-center py-10 text-gray-400 text-sm">Loading Tutors</div>
          ) : mentors.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400 text-sm">
              No Tutors found. Try adjusting your filters.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                {mentors.map((mentor) => {
                  return (
                    <div key={mentor.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex min-h-[172px] sm:min-h-[208px]">

                      {/* Left half — profile picture area */}
                      <div className="w-1/2 flex-shrink-0 bg-white relative overflow-hidden flex flex-col items-center justify-center gap-2 border-r border-gray-100">
                        {mentor.profile_photo_url ? (
                          <div className="p-4 flex items-center justify-center w-full h-full">
                            <img src={mentor.profile_photo_url} alt={mentor.first_name}
                              className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 shadow-sm relative z-10" />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center font-black text-2xl text-primary select-none">
                            {mentor.first_name.charAt(0)}{mentor.last_name.charAt(0)}
                          </div>
                        )}
                        {/* Name always shown below picture */}
                        <p className="text-gray-800 text-xs font-semibold text-center px-2 leading-tight">
                          {mentor.first_name} {mentor.last_name}
                        </p>
                        {!mentor.profile_photo_url && (
                          <p className="text-gray-500 text-xs text-center px-2 leading-tight">
                            {mentor.expertise?.split(',')[0] || 'Tutor'}
                          </p>
                        )}
</div>

                      {/* Right half — info */}
                      <div className="w-1/2 flex flex-col justify-between p-4">
                        <div className="space-y-1.5">
                          <h3 className="font-bold text-primary text-sm leading-tight truncate">
                            {mentor.expertise || 'Tutor'}
                          </h3>
                          {mentor.city && (
                            <p className="text-gray-500 text-xs flex items-center gap-1 truncate">
                              <span>📍</span> {mentor.city}
                            </p>
                          )}
                          {mentor.gender && (
                            <p className="text-gray-500 text-xs flex items-center gap-1">
                              <span>👤</span> {mentor.gender}
                            </p>
                          )}
                          {mentor.education && (
                            <p className="text-gray-500 text-xs flex items-center gap-1 truncate">
                              <span>🎓</span> {mentor.education}
                            </p>
                          )}
                          {!mentor.education && mentor.university && (
                            <p className="text-gray-500 text-xs flex items-center gap-1 truncate">
                              <span>🏫</span> {mentor.university}
                            </p>
                          )}
                          {mentor.experience_years && (
                            <p className="text-gray-500 text-xs flex items-center gap-1">
                              <span>💼</span> {mentor.experience_years}+ yrs exp
                            </p>
                          )}
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col gap-1.5 mt-2">
                          <Link to={`/mentor/${mentor.id}`}
                            className="w-full text-center border border-gray-200 text-gray-700 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors">
                            View Profile
                          </Link>
                          {isAuthenticated && user?.role === 'student' ? (
                            <Link to={`/contact-mentor/${mentor.id}`}
                              className="w-full text-center bg-primary hover:bg-primary-dark text-white py-1.5 rounded-lg text-xs font-semibold transition-colors">
                              Contact
                            </Link>
                          ) : (
                            <button onClick={() => navigate('/login')}
                              className="w-full bg-primary hover:bg-primary-dark text-white py-1.5 rounded-lg text-xs font-semibold transition-colors">
                              Contact
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-6">
                  <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors">
                    ← Previous
                  </button>
                  <span className="text-sm text-gray-500">Page {currentPage} of {totalPages}</span>
                  <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors">
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
    </div>
  );
};

export default BrowseMentors;
