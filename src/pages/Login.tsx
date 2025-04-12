import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Mail, Lock, AlertCircle, Loader, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isResetMode, setIsResetMode] = useState(false);

  const validatePassword = (password: string): string | null => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    return null;
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      });

      if (resetError) throw resetError;

      setError('Password reset instructions have been sent to your email.');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate password for sign up
    if (!isLogin) {
      const passwordError = validatePassword(password);
      if (passwordError) {
        setError(passwordError);
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (signInError) {
          if (signInError.message === 'Invalid login credentials') {
            throw new Error('Invalid email or password. Please try again.');
          }
          throw signInError;
        }
        
        navigate('/home');
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (signUpError) {
          if (signUpError.message.includes('already registered')) {
            throw new Error('This email is already registered. Please try logging in instead.');
          }
          throw signUpError;
        }

        setError('Please check your email to confirm your account.');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMode = (newIsLogin: boolean) => {
    setIsLogin(newIsLogin);
    setError(null);
    setEmail('');
    setPassword('');
    setIsResetMode(false);
  };

  const renderResetPassword = () => (
    <form onSubmit={handlePasswordReset} className="space-y-6">
      <button
        type="button"
        onClick={() => setIsResetMode(false)}
        className="flex items-center text-gray-600 hover:text-pink-500 transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to login
      </button>
      
      <div>
        <label className="block text-gray-700 text-sm font-medium mb-2 flex items-center">
          <Mail className="w-4 h-4 mr-2 text-pink-500" />
          Email
        </label>
        <input
          type="email"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all bg-gray-50"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          disabled={loading}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all transform hover:scale-[1.02] flex items-center justify-center space-x-2 font-medium text-lg disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <span>Send Reset Instructions</span>
        )}
      </button>
    </form>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block p-4 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 mb-4">
            <Heart className="w-10 h-10 text-pink-500" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">LoveLens</h1>
          <p className="text-gray-600 text-lg">Your relationship insight companion</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-lg backdrop-filter">
          {error && (
            <div className={`mb-6 p-4 rounded-lg flex items-center ${
              error.includes('Please check your email') || error.includes('Password reset instructions')
                ? 'bg-green-50 text-green-600' 
                : 'bg-red-50 text-red-600'
            }`}>
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {!isResetMode && (
            <div className="flex mb-8">
              <button
                className={`flex-1 py-3 text-center text-lg font-medium transition-colors ${
                  isLogin
                    ? 'text-pink-500 border-b-2 border-pink-500'
                    : 'text-gray-500 hover:text-pink-400'
                }`}
                onClick={() => handleToggleMode(true)}
              >
                Login
              </button>
              <button
                className={`flex-1 py-3 text-center text-lg font-medium transition-colors ${
                  !isLogin
                    ? 'text-pink-500 border-b-2 border-pink-500'
                    : 'text-gray-500 hover:text-pink-400'
                }`}
                onClick={() => handleToggleMode(false)}
              >
                Sign Up
              </button>
            </div>
          )}

          {isResetMode ? (
            renderResetPassword()
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2 flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-pink-500" />
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all bg-gray-50"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2 flex items-center">
                    <Lock className="w-4 h-4 mr-2 text-pink-500" />
                    Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all bg-gray-50"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={`Enter your password${!isLogin ? ' (min. 6 characters)' : ''}`}
                    required
                    disabled={loading}
                    minLength={6}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all transform hover:scale-[1.02] flex items-center justify-center space-x-2 font-medium text-lg disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>{isLogin ? 'Login' : 'Sign Up'}</span>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-gray-600">
                {isLogin ? (
                  <>
                    <p>
                      Don't have an account?{' '}
                      <button
                        onClick={() => handleToggleMode(false)}
                        className="text-pink-500 hover:text-pink-600 font-medium"
                      >
                        Sign up
                      </button>
                    </p>
                    <button
                      onClick={() => setIsResetMode(true)}
                      className="text-pink-500 hover:text-pink-600 font-medium mt-2"
                    >
                      Forgot your password?
                    </button>
                  </>
                ) : (
                  <p>
                    Already have an account?{' '}
                    <button
                      onClick={() => handleToggleMode(true)}
                      className="text-pink-500 hover:text-pink-600 font-medium"
                    >
                      Login
                    </button>
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}