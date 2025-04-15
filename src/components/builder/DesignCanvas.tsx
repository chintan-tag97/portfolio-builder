import { useNavigate, useSearchParams } from 'react-router-dom';
import { Section, CanvasDesigns, Design } from '../../types';
import { Droppable } from '@hello-pangea/dnd';
import { useEffect, useRef, useImperativeHandle, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDesigns } from '../../context/DesignContext';
import { useSections } from '../../context/SectionContext';
import { getCanvasDesigns } from '../../services/canvasService';
import { makeTextElementsEditable, removeEditability } from '../../utils/editableContent';
import ColorSelectionProvider from './ColorSelectionProvider';
import EditableToolbar from './EditableToolbar';
import Loading from '../Loading';

interface DesignCanvasProps {
  activeSections: Section[];
  canvasDesigns: CanvasDesigns;
  removeDesignFromCanvas: (sectionName: string) => void;
  setCanvasDesigns: (designs: CanvasDesigns) => void;
  ref?: React.RefObject<DesignCanvasRef | null>;
}

export interface DesignCanvasRef {
  reapplyEditability: () => void;
}

const DesignCanvas = ({ 
  activeSections, 
  canvasDesigns, 
  removeDesignFromCanvas,
  setCanvasDesigns,
  ref
}: DesignCanvasProps) => {
  const { currentUser } = useAuth();
  const { designs } = useDesigns();
  const designRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isLoading: sectionsLoading } = useSections();

  // Function to get clean HTML for saving/exporting
  const getCleanHtml = useCallback((sectionName: string): string => {
    const container = designRefs.current[sectionName];
    if (!container) return canvasDesigns[sectionName]?.html || '';
    
    // Clean HTML directly
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = container.innerHTML;
    
    // Remove contenteditable attributes
    const editableElements = tempDiv.querySelectorAll('[contenteditable]');
    editableElements.forEach(element => {
      element.removeAttribute('contenteditable');
    });
    
    // Remove data attributes and inline styles related to interactivity
    const elementsWithDataAttrs = tempDiv.querySelectorAll(
      '[data-original-pointer-events], [data-original-text], [data-original-cursor], [data-color-selection-enabled], [data-color-selection-handler], [data-color-editing], [data-original-outline], [data-original-outline-offset]'
    );
    
    elementsWithDataAttrs.forEach(element => {
      element.removeAttribute('data-original-pointer-events');
      element.removeAttribute('data-original-text');
      element.removeAttribute('data-original-cursor');
      element.removeAttribute('data-color-selection-enabled');
      element.removeAttribute('data-color-selection-handler');
      element.removeAttribute('data-color-editing');
      element.removeAttribute('data-original-outline');
      element.removeAttribute('data-original-outline-offset');
      
      (element as HTMLElement).style.pointerEvents = '';
      (element as HTMLElement).style.cursor = '';
      (element as HTMLElement).style.outline = '';
      (element as HTMLElement).style.outlineOffset = '';
    });
    
    return tempDiv.innerHTML;
  }, [canvasDesigns]);

  // Update the canvasDesigns with the edited content before saving
  const updateDesignHtml = useCallback((sectionName: string) => {
    if (!canvasDesigns[sectionName]) return;
    
    const cleanHtml = getCleanHtml(sectionName);
    const updatedDesign = {
      ...canvasDesigns[sectionName],
      html: cleanHtml
    };
    
    setCanvasDesigns({
      ...canvasDesigns,
      [sectionName]: updatedDesign as Design
    });
  }, [canvasDesigns, setCanvasDesigns, getCleanHtml]);

  useEffect(() => {
    const loadSavedDesigns = async () => {
      if (!currentUser) return;
      
      // Only load saved designs if we're not creating a new portfolio or loading a template
      const templateId = searchParams.get('template');
      const isNewPortfolio = searchParams.get('new') === 'true';
      
      if (!templateId && !isNewPortfolio) {
        try {
          const savedDesigns = await getCanvasDesigns(currentUser.id, designs);
          if (savedDesigns) {
            setCanvasDesigns(savedDesigns);
          }
        } catch (error) {
          console.error('Error loading saved designs:', error);
        }
      }
    };

    loadSavedDesigns();
  }, [currentUser, designs, setCanvasDesigns, searchParams]);

  // Apply editability to designs when they're rendered
  useEffect(() => {
    // Capture current refs at the time the effect runs
    const currentRefs = designRefs.current;
    
    // Apply editability to all design containers
    Object.keys(currentRefs).forEach(key => {
      const container = currentRefs[key];
      if (container) {
        makeTextElementsEditable(container);
      }
    });

    // Set up event listener for color updates
    const handleColorUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { container } = customEvent.detail;
      
      // Find the section name for this container
      const sectionName = Object.keys(currentRefs).find(key => currentRefs[key] === container);
      
      if (sectionName) {
        // Add a small delay to ensure all DOM updates are complete
        const timeout = setTimeout(() => {
          updateDesignHtml(sectionName);
        }, 100);
        return () => clearTimeout(timeout);
      }
    };

    // Add the color update listener to each container
    Object.keys(currentRefs).forEach(key => {
      const container = currentRefs[key];
      if (container) {
        // Remove any existing listeners to prevent duplicates
        container.removeEventListener('color-update', handleColorUpdate);
        // Add new listener
        container.addEventListener('color-update', handleColorUpdate);
      }
    });

    // Cleanup function to remove editability when component unmounts
    return () => {
      console.log('removing editability');
      Object.keys(currentRefs).forEach(key => {
        const container = currentRefs[key];
        if (container) {
          removeEditability(container);
          container.removeEventListener('color-update', handleColorUpdate);
        }
      });
    };
  }, [canvasDesigns, updateDesignHtml]);

  // Function to reapply editability to all designs
  const reapplyEditability = () => {
    Object.keys(designRefs.current).forEach(key => {
      const container = designRefs.current[key];
      if (container) {
        makeTextElementsEditable(container);
      }
    });
  };

  // Expose the reapplyEditability function through the ref
  useImperativeHandle(ref, () => ({
    reapplyEditability
  }));

  // When design HTML is injected, add data-design-container attribute
  useEffect(() => {
    // Wait for designs to be rendered
    const timer = setTimeout(() => {
      // Find all design containers and add the data-design-container attribute
      const designContainers = document.querySelectorAll('.design-content') as NodeListOf<HTMLElement>;
      designContainers.forEach(container => {
        container.setAttribute('data-design-container', 'true');
        
        // Also make sure all contenteditable elements inside are properly marked
        const editableElements = container.querySelectorAll('[contenteditable]') as NodeListOf<HTMLElement>;
        editableElements.forEach(element => {
          // Ensure it has the correct attribute value
          element.setAttribute('contenteditable', 'true');
        });
      });
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  if (sectionsLoading) {
    return <Loading message='Loading sections...' />
  }

  return (
    <ColorSelectionProvider>
      <div className="flex-1 overflow-y-auto bg-transparent dark:bg-gray-900 p-6 h-full relative">
        <EditableToolbar />
        <div className="max-w-5xl mx-auto min-h-full">
          {activeSections.length === 0 ? (
            <div className="p-8 text-center rounded-lg border border-gray-200 bg-white text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Portfolio Builder</h1>
              <p className="text-lg mb-4">No active sections found</p>
              <p>Go to the Sections page to create and activate sections for your portfolio.</p>
              <button 
                type="button"
                onClick={() => navigate('/sections')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
              >
                Go to Sections
              </button>
            </div>
          ) : (
            <div className="space-y-8 max-md:max-w-[90vw]">
              {activeSections.map(section => (
                <div 
                  key={section.docId}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700"
                >
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">{section.name}</h3>
                  
                  <Droppable droppableId={`canvas-${section.name}`}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`min-h-[150px] p-4 rounded-lg border-2 ${
                          snapshot.isDraggingOver && !canvasDesigns[section.name]
                            ? 'border-blue-400 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20' 
                            : 'border-dashed border-gray-300 dark:border-gray-600'
                        } transition-colors duration-200`}
                      >
                        {canvasDesigns[section.name] ? (
                          <div className="space-y-3">
                            <div 
                              className="bg-white dark:bg-gray-700 rounded-lg shadow border border-gray-200 dark:border-gray-600 relative"
                              data-design-container="true"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  // Update HTML before removing
                                  updateDesignHtml(section.name);
                                  removeDesignFromCanvas(section.name);
                                }}
                                className="absolute top-2 left-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all p-2 rounded-md cursor-pointer"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </button>
                              
                              <div className="pt-13">
                                <div 
                                  ref={(el: HTMLDivElement | null) => { designRefs.current[section.name] = el; }}
                                  dangerouslySetInnerHTML={{ __html: canvasDesigns[section.name]?.html || '' }}
                                  onBlur={() => updateDesignHtml(section.name)}
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full py-8 text-center text-gray-500 dark:text-gray-400">
                            <p>Drag and drop a design for the {section.name} section</p>
                            {provided.placeholder}
                          </div>
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ColorSelectionProvider>
  );
};

export default DesignCanvas; 