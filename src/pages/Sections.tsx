import { useEffect } from 'react';
import { FiPlus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import SectionCard from '../components/SectionCard';
import SectionForm from '../components/SectionForm';
import { useAuth } from '../context/AuthContext';
import { useSections } from '../context/SectionContext';
import { Section } from '../types';
import { useState } from 'react';
import AOS from 'aos';
import { Loading } from '../components';

// Extend Window interface to include AOS
declare global {
  interface Window {
    AOS: typeof AOS;
  }
}

const Sections = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const { 
    sections, 
    isLoading: sectionsLoading, 
    error: sectionsError, 
    addSection,
    updateSectionById,
    deleteSectionById
  } = useSections();
  const navigate = useNavigate();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Used to trigger animation refresh

  useEffect(() => {
    if (!authLoading && !currentUser) {
      navigate('/login');
    }
  }, [currentUser, authLoading, navigate]);

  const handleCreateSection = async (sectionData: Omit<Section, 'id' | 'docId'>) => {
    try {
      setIsSubmitting(true);
      
      await addSection(sectionData);
      
      setIsModalOpen(false);
      // Trigger animation refresh
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error('Failed to create section:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSection = (docId: string, data: Partial<Omit<Section, 'id' | 'docId'>>) => {
    updateSectionById(docId, data);
  };

  const handleDeleteSection = (docId: string) => {
    deleteSectionById(docId);
  };

  if (authLoading || sectionsLoading) {
    return <Loading message="Loading sections..." />;
  }

  return (
    <div className="min-h-[91dvh] mt-14 overflow-y-auto">
      <div className="max-container padding-x pt-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
            Sections Manager
          </h1>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
          >
            <FiPlus className="mr-2" />
            Add New Section
          </button>
        </div>
        
        <p className="mb-8 text-gray-600 dark:text-gray-400">
          Manage the different sections of your portfolio here.
        </p>
        
        {sectionsError && (
          <div 
            className="p-4 mb-6 rounded-md bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-200"
            data-aos="fade-in"
            data-aos-duration="600"
          >
            {sectionsError}
          </div>
        )}
        
        {sections.length === 0 ? (
          <div 
            className="p-8 text-center rounded-lg border border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
            data-aos="fade-up"
            data-aos-duration="800"
          >
            <p className="text-lg mb-4">No sections found</p>
            <p>Click the "Add New Section" button to create your first section.</p>
          </div>
        ) : (
          <div key={refreshKey} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {sections.map((section, index) => (
              <SectionCard
                key={section.docId}
                section={section}
                onDelete={handleDeleteSection}
                onUpdate={handleUpdateSection}
                animationDelay={index * 100} // Staggered animation
                existingSections={sections}
              />
            ))}
          </div>
        )}
      </div>
      
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Section"
      >
        <SectionForm
          onSubmit={handleCreateSection}
          onCancel={() => setIsModalOpen(false)}
          isSubmitting={isSubmitting}
          existingSections={sections}
        />
      </Modal>
    </div>
  );
};

export default Sections; 