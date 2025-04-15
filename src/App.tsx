import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SectionProvider } from './context/SectionContext';
import { DesignProvider } from './context/DesignContext';
import { ThemeProvider } from './context/ThemeContext';
import { Suspense, lazy, useEffect } from 'react';
import { Navbar, ProtectedRoute, PageTransition, Loading } from './components';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/toast/toast.css';
import { useToastConfig } from './hooks';
import { AnimatePresence } from 'framer-motion';

// Lazy load page components
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Sections = lazy(() => import('./pages/Sections'));
const Designs = lazy(() => import('./pages/Designs'));
const AddDesign = lazy(() => import('./pages/AddDesign'));
const EditDesign = lazy(() => import('./pages/EditDesign'));
const Builder = lazy(() => import('./pages/Builder'));
const NotFound = lazy(() => import('./pages/NotFound'));

const App = () => {
  const toastConfig = useToastConfig();
  useEffect(() => {
    AOS.init({
      duration: 500, // Animation duration (in ms)
      easing: 'ease-in-cubic', // Animation easing
      once: false,
      mirror: false, // Whether elements should animate out while scrolling past them
    });
  }, []);
  
  return (
    <div>
      <Router>
        <ThemeProvider>
          <AuthProvider>
            <SectionProvider>
              <DesignProvider>
                <Navbar/>
                <Suspense fallback={<Loading/>}>
                  <AppRoutes />
                </Suspense>
                <ToastContainer {...toastConfig} />
              </DesignProvider>
            </SectionProvider>
          </AuthProvider>
        </ThemeProvider>
      </Router>
    </div>
  );
};

// Routes component defined inline in the same file
const AppRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
          <Route path="/sections" element={<PageTransition><Sections /></PageTransition>} />
          <Route path="/designs" element={<PageTransition><Designs /></PageTransition>} />
          <Route path="/designs/add" element={<PageTransition><AddDesign /></PageTransition>} />
          <Route path="/designs/edit/:designId" element={<PageTransition><EditDesign /></PageTransition>} />
          <Route path="/builder" element={<PageTransition><Builder /></PageTransition>} />
        </Route>
        {/* 404 Route */}
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

export default App;