import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !currentUser) {
      navigate('/login');
    } else if (!loading && currentUser) {
      // Redirect authenticated users to dashboard
      navigate('/dashboard');
    }
  }, [currentUser, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <div className="flex-grow flex items-center justify-center p-4 mt-16">
        <div className="max-w-md w-full rounded-lg shadow-md p-8 bg-white dark:bg-gray-800">
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-gray-100">Welcome to Portfolio Builder</h1>
          <p className="text-center text-gray-600 dark:text-gray-400">
            You are being redirected to the dashboard...
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home; 