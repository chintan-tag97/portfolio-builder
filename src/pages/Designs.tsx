import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSections } from '../context/SectionContext';
import { useDesigns } from '../context/DesignContext';
import { DesignCard, Loading } from '../components';
import { Design } from '../types';
import { FiPlus, FiChevronDown, FiFilter } from 'react-icons/fi';

const Designs = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const { sections, isLoading: sectionsLoading } = useSections();
  const { designs, isLoading: designsLoading, getDesignsBySectionId } = useDesigns();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<string>('all');
  const [filteredDesigns, setFilteredDesigns] = useState<Design[]>([]);
  const [refreshKey, setRefreshKey] = useState(0); // Added for animation refresh
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      navigate('/login');
    }
  }, [currentUser, authLoading, navigate]);

  useEffect(() => {
    if (activeTab === 'all') {
      setFilteredDesigns(designs);
    } else {
      const sectionId = Number(activeTab);
      const sectionDesigns = getDesignsBySectionId(sectionId);
      setFilteredDesigns(sectionDesigns);
    }
    // Refresh the key to restart animations when tab changes
    setRefreshKey(prev => prev + 1);
  }, [activeTab, designs, getDesignsBySectionId]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAddDesign = () => {
    // Navigate to the add design page with the selected section ID if a specific section is selected
    if (activeTab !== 'all') {
      navigate('/designs/add', { state: { selectedSectionId: Number(activeTab) } });
    } else {
      navigate('/designs/add');
    }
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setDropdownOpen(false);
  };

  const getActiveTabName = () => {
    if (activeTab === 'all') return 'All Designs';
    const section = sections.find(s => s.id.toString() === activeTab);
    return section ? section.name : 'All Designs';
  };

  const loading = authLoading || sectionsLoading || designsLoading;

  if (loading) {
    return <Loading message="Loading designs..." />;
  }

  return (
    <div className='overflow-y-auto max-h-[91dvh] mt-14'>
      <div className="max-container p-8 padding-x">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Designs</h1>
          <button
            type='button'
            onClick={handleAddDesign}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
          >
            <FiPlus className='mr-2'/>
            Add New Design
          </button>
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Browse and manage design templates for different sections of your portfolio.
        </p>
        
        {/* Tabs for desktop */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6 hidden md:block">
          <nav className="flex flex-wrap -mb-px">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`mr-4 py-2 px-4 text-sm font-medium transition-all duration-200 cursor-pointer ${
                activeTab === 'all'
                  ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-500 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 border-b-2 border-transparent hover:border-indigo-400'
              }`}
            >
              All Designs
            </button>
            
            {sections.map(section => (
              <button
                key={section.id}
                type='button'
                onClick={() => setActiveTab(section.id.toString())}
                className={`mr-4 py-2 px-4 text-sm font-medium transition-all duration-200 cursor-pointer ${
                  activeTab === section.id.toString()
                    ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-500 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 border-b-2 border-transparent hover:border-indigo-400'
                }`}
              >
                {section.name}
              </button>
            ))}
          </nav>
        </div>
        
        {/* Dropdown for mobile/tablet */}
        <div className="md:hidden mb-6 relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
          >
            <div className="flex items-center">
              <FiFilter className="mr-2 text-indigo-500" />
              <span className="font-medium text-gray-700 dark:text-gray-200">
                {getActiveTabName()}
              </span>
            </div>
            <FiChevronDown className={`text-gray-500 transition-transform duration-300 ${dropdownOpen ? 'transform rotate-180' : ''}`} />
          </button>
          
          {dropdownOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden transition-all duration-200 transform origin-top scale-100">
              <div className="max-h-60 overflow-y-auto py-1">
                <button
                  type="button"
                  onClick={() => handleTabChange('all')}
                  className={`w-full text-left px-4 py-3 text-sm ${
                    activeTab === 'all'
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  All Designs
                </button>
                
                {sections.map(section => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => handleTabChange(section.id.toString())}
                    className={`w-full text-left px-4 py-3 text-sm ${
                      activeTab === section.id.toString()
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {section.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Design Cards */}
        {filteredDesigns.length > 0 ? (
          <div key={refreshKey} className="flex flex-col space-y-4">
            {filteredDesigns.map((design, index) => (
              <DesignCard 
                key={design.docId} 
                design={design} 
                animationDelay={index * 100}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400">
              {activeTab === 'all' 
                ? 'No designs found. Click "Add New Design" to create one.' 
                : `No designs found for this section. Click "Add New Design" to create one.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Designs; 