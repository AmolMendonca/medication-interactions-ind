// src/components/auth/AuthForm.jsx - Rebuilt with Radix UI
import React, { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import * as Label from '@radix-ui/react-label';
import { AlertCircle, CheckCircle2, Loader2, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AuthForm() {
  const [activeTab, setActiveTab] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const { signUp, signIn } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (activeTab === 'signup') {
        await signUp(email, password);
        setMessage('Check your email for the confirmation link!');
        setEmail('');
        setPassword('');
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
    setError('');
    setMessage('');
    // Don't clear form fields - better UX
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* App Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl mb-4 shadow-lg shadow-red-500/30">
            <Shield className="w-8 h-8 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-2">
            MedSure
          </h1>
          <p className="text-gray-600 text-lg font-medium">
            Drug Interaction Checker
          </p>
        </div>

        {/* Auth Card with Radix Tabs */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200/60 overflow-hidden">
          <Tabs.Root value={activeTab} onValueChange={handleTabChange}>
            {/* Tab List - iOS Style Segmented Control */}
            <Tabs.List className="flex p-2 bg-gray-100/60 border-b border-gray-200/40">
              <Tabs.Trigger
                value="signin"
                className="flex-1 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
              >
                Sign In
              </Tabs.Trigger>
              <Tabs.Trigger
                value="signup"
                className="flex-1 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
              >
                Sign Up
              </Tabs.Trigger>
            </Tabs.List>

            {/* Tab Content */}
            <div className="p-8">
              {/* Error Alert */}
              {error && (
                <div 
                  className="mb-6 p-4 bg-red-50/80 border border-red-200 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300"
                  role="alert"
                >
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700 font-medium leading-relaxed">
                      {error}
                    </p>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {message && (
                <div 
                  className="mb-6 p-4 bg-green-50/80 border border-green-200 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300"
                  role="status"
                >
                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-green-700 font-medium leading-relaxed">
                      {message}
                    </p>
                  </div>
                </div>
              )}

              <Tabs.Content value="signin" className="focus:outline-none">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label.Root
                      htmlFor="signin-email"
                      className="block text-sm font-semibold text-gray-900"
                    >
                      Email Address
                    </Label.Root>
                    <input
                      id="signin-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all duration-200 text-base"
                      placeholder="you@example.com"
                      disabled={loading}
                    />
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label.Root
                      htmlFor="signin-password"
                      className="block text-sm font-semibold text-gray-900"
                    >
                      Password
                    </Label.Root>
                    <input
                      id="signin-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all duration-200 text-base"
                      placeholder="••••••••"
                      disabled={loading}
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 px-6 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold text-base shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-lg transition-all duration-200 active:scale-[0.98]"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Signing in...
                      </span>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                </form>
              </Tabs.Content>

              <Tabs.Content value="signup" className="focus:outline-none">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label.Root
                      htmlFor="signup-email"
                      className="block text-sm font-semibold text-gray-900"
                    >
                      Email Address
                    </Label.Root>
                    <input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all duration-200 text-base"
                      placeholder="you@example.com"
                      disabled={loading}
                    />
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label.Root
                      htmlFor="signup-password"
                      className="block text-sm font-semibold text-gray-900"
                    >
                      Password
                    </Label.Root>
                    <input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      autoComplete="new-password"
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all duration-200 text-base"
                      placeholder="••••••••"
                      disabled={loading}
                    />
                    <p className="text-xs text-gray-500 font-medium mt-1.5 flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                      <span>Minimum 6 characters</span>
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 px-6 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold text-base shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-lg transition-all duration-200 active:scale-[0.98]"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Creating account...
                      </span>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </form>
              </Tabs.Content>
            </div>
          </Tabs.Root>
        </div>

        {/* Security Notice */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100/60 rounded-full">
            <Shield className="w-4 h-4 text-gray-600" />
            <p className="text-xs text-gray-600 font-medium">
              Your medications are securely stored and synced across devices
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
