import React, { useState } from 'react';
import { Lock, User, ShieldCheck } from 'lucide-react';
import { loginUser, registerUser } from '../api/client';

const Auth = ({ onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [badgeNumber, setBadgeNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isSignUp) {
        await registerUser(badgeNumber, password);
        // After registration, immediately log them in
        const data = await loginUser(badgeNumber, password);
        localStorage.setItem('token', data.access_token || 'mock_token_until_backend_supports_jwt');
        onAuthSuccess();
      } else {
        const data = await loginUser(badgeNumber, password);
        localStorage.setItem('token', data.access_token || 'mock_token_until_backend_supports_jwt');
        onAuthSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Authentication failed. Check credentials or connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] flex flex-col justify-center items-center font-sans text-neutral-200">
      
      <div className="mb-8 flex flex-col items-center">
        <ShieldCheck className="w-16 h-16 text-blue-500 mb-4" />
        <h1 className="text-3xl font-bold tracking-widest text-white">SPARK</h1>
        <p className="text-neutral-400 tracking-widest text-sm uppercase mt-1">Intelligence Engine</p>
      </div>

      <div className="w-full max-w-md bg-neutral-900/80 backdrop-blur-md border border-neutral-800 rounded-2xl p-8 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-6 text-center">
          {isSignUp ? 'Initialize Operative Access' : 'Secure System Login'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-400 uppercase mb-1">Operative ID (Badge Number)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-neutral-500" />
              </div>
              <input 
                type="text" 
                required 
                value={badgeNumber}
                onChange={(e) => setBadgeNumber(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-neutral-950 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter Operative ID"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-400 uppercase mb-1">Access Key (Password)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-neutral-500" />
              </div>
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-neutral-950 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm font-medium text-center bg-red-950/50 py-2 rounded border border-red-900">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-3 mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 disabled:text-neutral-400 text-white font-bold rounded-lg transition-colors shadow-[0_0_15px_rgba(37,99,235,0.4)]"
          >
            {isLoading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Authenticate')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsSignUp(!isSignUp)} 
            className="text-sm text-neutral-400 hover:text-white transition-colors"
          >
            {isSignUp ? 'Already have access? Sign In' : 'Need clearance? Create Account'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
