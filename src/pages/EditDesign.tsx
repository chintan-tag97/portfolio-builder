import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useDesigns } from '../context/DesignContext';
import { useSections } from '../context/SectionContext';
import { useAuth } from '../context/AuthContext';
import { Design } from '../types';
import DesignEditor from '../components/design/DesignEditor';

const EditDesign = () => {
  const navigate = useNavigate();
  const { designId } = useParams<{ designId: string }>();
  const location = useLocation();
  const { currentUser, loading: authLoading } = useAuth();
  const { sections } = useSections();
  const { designs, updateDesignById } = useDesigns();
  
  const [design, setDesign] = useState<Design | null>(null);
  const [name, setName] = useState('');
  const [html, setHtml] = useState('');
  const [sectionId, setSectionId] = useState<number | undefined>(undefined);
  const [active, setActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    html: '',
    section: ''
  });

  // Get the design from the location state if available, otherwise find it in the designs array
  useEffect(() => {
    if (location.state?.design) {
      const designData = location.state.design as Design;
      setDesign(designData);
      setName(designData.name);
      setHtml(designData.html);
      setSectionId(designData.pageSection.id);
      setActive(designData.active);
      setIsLoading(false);
    } else if (designId) {
      const foundDesign = designs.find(d => d.docId === designId);
      if (foundDesign) {
        setDesign(foundDesign);
        setName(foundDesign.name);
        setHtml(foundDesign.html);
        setSectionId(foundDesign.pageSection.id);
        setActive(foundDesign.active);
      } else {
        setError('Design not found');
      }
      setIsLoading(false);
    }
  }, [designId, designs, location.state]);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      navigate('/login');
    }
  }, [currentUser, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!design) {
      setError('Design not found');
      return;
    }
    
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
      
      await updateDesignById(design.docId!, {
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

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!design) {
    return (
      <div className="max-container p-6 mt-16 padding-x">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Design not found. <button onClick={() => navigate('/designs')} className="underline">Go back to designs</button>
        </div>
      </div>
    );
  }

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
        submitButtonText="Save Changes"
        onCancel={() => navigate('/designs')}
        onBackToEditor={() => setShowForm(false)}
        fieldErrors={fieldErrors}
        showForm={showForm}
        setShowForm={setShowForm}
      />
    </div>
  );
};

export default EditDesign; 