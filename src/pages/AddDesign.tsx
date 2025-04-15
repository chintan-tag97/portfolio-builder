import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDesigns } from '../context/DesignContext';
import { useSections } from '../context/SectionContext';
import { useAuth } from '../context/AuthContext';
import DesignEditor from '../components/design/DesignEditor';

const AddDesign = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, loading: authLoading } = useAuth();
  const { sections } = useSections();
  const { addDesign } = useDesigns();
  
  // Get the selected section ID from the location state if available
  const selectedSectionId = location.state?.selectedSectionId;
  
  const [name, setName] = useState('');
  const [html, setHtml] = useState('');
  const [sectionId, setSectionId] = useState<number | undefined>(selectedSectionId);
  const [active, setActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    html: '',
    section: ''
  });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      navigate('/login');
    }
  }, [currentUser, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset field errors
    setFieldErrors({
      name: '',
      html: '',
      section: ''
    });

    let hasErrors = false;
    const newFieldErrors = {
      name: '',
      html: '',
      section: ''
    };
    
    if (!name.trim()) {
      newFieldErrors.name = 'Design name is required';
      hasErrors = true;
    }
    
    if (!html.trim()) {
      newFieldErrors.html = 'HTML content is required';
      hasErrors = true;
    }
    
    if (!sectionId) {
      newFieldErrors.section = 'Please select a section';
      hasErrors = true;
    }

    if (hasErrors) {
      setFieldErrors(newFieldErrors);
      return;
    }
    
    const selectedSection = sections.find(section => section.id === sectionId);
    
    if (!selectedSection) {
      setError('Invalid section selected');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      await addDesign({
        name,
        html,
        active,
        pageSection: selectedSection
      });
      
      navigate('/designs');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-container p-6 mt-16 padding-x">
      
      
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
      <DesignEditor
        name={name}
        setName={setName}
        html={html}
        setHtml={setHtml}
        sectionId={sectionId}
        setSectionId={setSectionId}
        active={active}
        setActive={setActive}
        sections={sections}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitButtonText="Add Design"
        onCancel={() => navigate('/designs')}
        onBackToEditor={() => setShowForm(false)}
        fieldErrors={fieldErrors}
        showForm={showForm}
        setShowForm={setShowForm}
      />
    </div>
  );
};

export default AddDesign; 