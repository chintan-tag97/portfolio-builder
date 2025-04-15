import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { resetPassword } from '../services/authService';
import { FaEnvelope, FaArrowRight } from 'react-icons/fa';
import AnimatedBackground from '../components/auth/AnimatedBackground';


const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle autofill styling
  useEffect(() => {
    const checkAutofill = () => {
      const inputs = document.querySelectorAll('input');
      inputs.forEach(input => {
        const backgroundColor = window.getComputedStyle(input).backgroundColor;
        if (backgroundColor.includes('rgb(232, 240, 254)') || backgroundColor.includes('rgb(250, 255, 189)')) {
          input.classList.add('is-autofilled');
          
          if (document.documentElement.classList.contains('dark')) {
            input.style.backgroundColor = '#1f2937';
            input.style.color = 'white';
            input.style.borderColor = '#4B5563';
          }
        }
      });
    };

    checkAutofill();
    const interval = setInterval(checkAutofill, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await resetPassword(email);
      setSuccessMessage('Password reset email sent. Please check your inbox.');
      setEmail('');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send reset email';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
      <AnimatedBackground />
      
      <div className="max-w-md w-full space-y-8 relative z-10 animate-fade-in">
        <div className="animate-slide-down">
          <h2 className="mt-6 text-center text-4xl font-bold text-gray-900 dark:text-white">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-lg text-gray-600 dark:text-gray-300">
            Enter your email to receive reset instructions
          </p>
        </div>
        
        {error && (
          <div className="rounded-xl p-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 animate-shake">
            <div className="flex">
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
              </div>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="rounded-xl p-4 bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-800">
            <div className="flex">
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">{successMessage}</p>
              </div>
            </div>
          </div>
        )}
        
        <form className="mt-8 space-y-6 animate-fade-in-up" onSubmit={handleSubmit}>
          <div className="rounded-xl shadow-sm bg-white dark:bg-gray-800 overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="flex items-center border-b border-gray-200 dark:border-gray-700">
              <div className="px-3 py-3">
                <FaEnvelope className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <div className="flex-1">
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-3 border-0 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none  focus:z-10 sm:text-sm bg-transparent"
                  placeholder="Email address"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between animate-fade-in opacity-0 [animation-fill-mode:forwards] [animation-delay:0.4s]" >
            <div className="text-sm">
              <Link
                to="/login"
                className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 focus:outline-none focus:underline transition duration-150 ease-in-out hover:scale-105 inline-block"
              >
                Back to sign in
              </Link>
            </div>
          </div>

          <div className="animate-fade-in [animation-delay:0.6s] opacity-0 [animation-fill-mode:forwards]" >
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 hover:shadow-lg"
            >
              <span className="flex items-center">
                {isSubmitting ? 'Sending reset email...' : 'Send reset email'}
                <FaArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword; 