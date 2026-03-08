import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SignUp = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [role, setRole] = useState('');
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '', password: '', confirm_password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.password) {
      setError('All fields are required'); return;
    }
    if (!role) { setError('Please select whether you are looking for a tutor or want to become one'); return; }
    if (formData.password !== formData.confirm_password) { setError('Passwords do not match'); return; }
    if (formData.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (!/[A-Za-z]/.test(formData.password) || !/\d/.test(formData.password)) {
      setError('Password must contain at least one letter and one number'); return;
    }
    setLoading(true);
    try {
      const data = await register(formData.email, formData.password, formData.first_name, formData.last_name, role);
      navigate('/verify-email', { state: { email: data.email, role: data.role } });
    } catch (err) {
      if (!err.response) {
        setError('Cannot connect to server. Make sure the backend is running on port 8000.');
      } else {
        setError(err.response?.data?.error || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-primary transition";

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-4 sm:py-8 px-2 sm:px-0">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
            <p className="text-gray-500 text-sm mt-1"></p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {['student', 'mentor'].map(r => (
              <button key={r} type="button" onClick={() => setRole(r)}
                className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                  role === r ? 'border-primary bg-blue-50 text-primary' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}>
                <div className="font-semibold capitalize">{r === 'student' ? "Looking for Tutor" : "Become a Tutor"}</div>
                <div className="text-xs text-gray-400 mt-0.5">{r === 'student' ? 'Find & contact tutors' : 'Share your expertise'}</div>
              </button>
            ))}
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} placeholder="" required className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} placeholder="" required className={inputCls} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Min. 12 characters" required className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input type="password" name="confirm_password" value={formData.confirm_password} onChange={handleChange} placeholder="Repeat password" required className={inputCls} />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-primary text-white py-2.5 rounded-full font-semibold text-sm hover:bg-primary-dark transition-colors disabled:opacity-60 mt-1">
              {loading ? 'Creating account…' : 'I agree to the Terms & Conditions and Join'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
