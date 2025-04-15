import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signIn } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { FaEnvelope, FaLock, FaArrowRight } from 'react-icons/fa';
import AnimatedBackground from '../components/auth/AnimatedBackground';



const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  // Handle autofill styling
  useEffect(() => {
    // This helps detect autofilled inputs and apply appropriate styling
    const checkAutofill = () => {
      const inputs = document.querySelectorAll('input');
      inputs.forEach(input => {
        // Check if the background color is the browser's autofill color
        const backgroundColor = window.getComputedStyle(input).backgroundColor;
        if (backgroundColor.includes('rgb(232, 240, 254)') || backgroundColor.includes('rgb(250, 255, 189)')) {
          // Add a class to indicate this input is autofilled
          input.classList.add('is-autofilled');
          
          // For dark mode, we need to override the browser's styling
          if (document.documentElement.classList.contains('dark')) {
            input.style.backgroundColor = '#1f2937';
            input.style.color = 'white';
            input.style.borderColor = '#4B5563';
          }
        }
      });
    };

    // Check immediately and then periodically
    checkAutofill();
    const interval = setInterval(checkAutofill, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await signIn(email, password);
      navigate('/');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in';
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen max-container flex items-center justify-center padding bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
      <AnimatedBackground /> 
      
      <div className="max-w-md w-full space-y-8 relative z-10 animate-fade-in">
        <div className="animate-slide-down">
          <h2 className="mt-6 text-center text-4xl font-bold text-gray-900 dark:text-white">
            Welcome back
          </h2>
          <p className="mt-2 text-center text-lg text-gray-600 dark:text-gray-300">
            Sign in to continue building your portfolio
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
        
        <form className="mt-8 space-y-6 animate-fade-in-up-login [animation-fill-mode:forwards] opacity-0" onSubmit={handleSubmit}>
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
            <div className="flex items-center border-b border-gray-200 dark:border-gray-700">
              <div className="px-3 py-3">
                <FaLock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <div className="flex-1">
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-3 border-0 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none  focus:z-10 sm:text-sm bg-transparent"
                  placeholder="Password"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between animate-fade-in opacity-0 [animation-fill-mode:forwards] [animation-delay:0.4s]" >
            <div className="text-sm">
              <Link
                to="/reset-password"
                className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 focus:outline-none focus:underline transition duration-150 ease-in-out hover:scale-105 inline-block"
              >
                Forgot your password?
              </Link>
            </div>
            <div className="text-sm">
              <Link to="/register" className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 focus:outline-none focus:underline transition duration-150 ease-in-out hover:scale-105 inline-block">
                Create account
              </Link>
            </div>
          </div>

          <div className="animate-fade-in opacity-0 [animation-fill-mode:forwards] [animation-delay:0.6s]" >
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 hover:shadow-lg"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <FaLock className="h-4 w-4 text-indigo-300 group-hover:text-indigo-200 transition-colors duration-200" aria-hidden="true" />
              </span>
              <span className="flex items-center">
                {isSubmitting ? 'Signing in...' : 'Sign in'}
                <FaArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 