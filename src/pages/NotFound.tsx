import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full text-center">
        <h1 className="text-9xl font-bold text-gray-200 dark:text-gray-600">404</h1>
        <h2 className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-gray-100">Page not found</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="text-base font-medium text-indigo-600 hover:text-indigo-500"
          >
            Go back home<span aria-hidden="true"> &rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 