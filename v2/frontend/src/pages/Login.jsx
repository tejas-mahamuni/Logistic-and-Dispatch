import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Truck } from 'lucide-react';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const user = await login(username, password);

      // Route to user's primary dashboard by role
      if (from === '/') {
        switch (user.role) {
          case 'ADMIN':
            navigate('/admin');
            break;
          case 'MANAGER':
            navigate('/manager');
            break;
          case 'DISPATCHER':
            navigate('/dispatcher');
            break;
          case 'DRIVER':
            navigate('/driver');
            break;
          case 'CUSTOMER':
            navigate('/customer');
            break;
          default:
            navigate('/');
        }
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid username or password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-sm p-8">
        <div className="text-center mb-6 flex flex-col items-center">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/25 mb-3">
            <span className="absolute -left-1.5 top-3 w-3 h-0.5 bg-blue-300 rounded-full"></span>
            <span className="absolute -left-2.5 top-5 w-4 h-0.5 bg-blue-200 rounded-full"></span>
            <span className="absolute -left-2 top-7 w-3 h-0.5 bg-blue-300 rounded-full"></span>
            <Truck className="w-6 h-6 -rotate-2" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight font-sans">
            Ship<span className="text-blue-600">Xpress</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Intelligent Hub-and-Spoke Logistics & Dispatch Management
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
              placeholder="e.g. admin or hinjawadi.mgr"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-md transition-colors disabled:opacity-50"
          >
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};
