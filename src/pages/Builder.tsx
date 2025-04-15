import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSections } from "../context/SectionContext";
import { useDesigns } from "../context/DesignContext";
import { Section, Design, CanvasDesigns, StoredTemplateDesign, Template } from "../types";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { DesignSidebar, DesignCanvas } from "../components/builder";
import { DesignCanvasRef } from "../components/builder/DesignCanvas";
import { useMediaQuery } from "../hooks";
import { generateHTML } from "../utils/generator";
import Loading from "../components/Loading";
import Modal from "../components/Modal";
import { saveCanvasDesigns } from "../services/canvasService";
import { saveTemplate } from "../services/templateService";
import { FaImage } from "react-icons/fa";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Collections } from '../services/collections';
import { toast } from 'react-toastify';
import { toastStyles } from "../styles/toast/toastStyles";

const Builder = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const { sections, isLoading: sectionsLoading } = useSections();
  const { designs, isLoading: designsLoading } = useDesigns();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const canvasRef = useRef<DesignCanvasRef>(null);

  const [activeSections, setActiveSections] = useState<Section[]>([]);
  const [canvasDesigns, setCanvasDesigns] = useState<CanvasDesigns>({});
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [isPreview, setIsPreview] = useState(false);
  const [previewHTML, setPreviewHTML] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [showTemplateNameInput, setShowTemplateNameInput] = useState(false);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  const [templateNameError, setTemplateNameError] = useState("");

  // Toggle sidebar when mobile state changes
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const handleCanvasClick = useCallback(() => {
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [isMobile, sidebarOpen]);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      navigate("/login");
    }
  }, [currentUser, authLoading, navigate]);

  // Load template if template ID is in URL
  useEffect(() => {
    const loadTemplate = async () => {
      const templateId = searchParams.get('template');
      if (!templateId || isLoadingTemplate) return;

      try {
        setIsLoadingTemplate(true);
        const templateRef = doc(db, Collections.TEMPLATES_COLLECTION, templateId);
        const templateDoc = await getDoc(templateRef);

        if (templateDoc.exists()) {
          const templateData = templateDoc.data() as Template;

          // Start with all active sections from the sections context
          const allSections = sections
            .filter(section => section.active)
            .sort((a, b) => a.order - b.order);

          // Set all sections as active sections
          setActiveSections(allSections);

          // Initialize canvas designs with null for all sections
          const loadedDesigns: CanvasDesigns = {};
          allSections.forEach(section => {
            loadedDesigns[section.name] = null;
          });
          if (templateData.canvasDesigns as Template['canvasDesigns']) {
            Object.entries(templateData.canvasDesigns).forEach(([sectionName, storedDesign]: [string, StoredTemplateDesign | null]) => {
              if (storedDesign) {
                // Find the full design from designs array
                const fullDesign = designs.find(d => d.id === storedDesign.id);
                if (fullDesign) {
                  loadedDesigns[sectionName] = {
                    ...fullDesign,
                    html: storedDesign.html || fullDesign.html,
                    pageSection: storedDesign.pageSection
                  };
                }
              }
            });
          }

          setCanvasDesigns(loadedDesigns);
          setTemplateName(templateData.name);
        }
      } catch (error) {
        console.error('Error loading template:', error);
        toast.error('Failed to load template. Please try again.', toastStyles.error);
      } finally {
        setIsLoadingTemplate(false);
      }
    };

    if (sections.length > 0 && designs.length > 0) {
      loadTemplate();
    }
  }, [searchParams, sections, designs]);

  // Only initialize empty canvas if no template is being loaded
  useEffect(() => {
    if (!searchParams.get('template') && sections.length > 0) {
      const filtered = sections
        .filter((section) => section.active)
        .sort((a, b) => a.order - b.order);

      setActiveSections(filtered);

      // Initialize canvas designs with null for each section
      const initialCanvasDesigns: CanvasDesigns = {};
      filtered.forEach((section) => {
        initialCanvasDesigns[section.name] = null;
      });
      setCanvasDesigns(initialCanvasDesigns);
    }
  }, [sections, searchParams]);

  const getDesignsBySectionId = (sectionId: number): Design[] => {
    return designs.filter(
      (design) => design.active && design.pageSection.id === sectionId
    );
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    // Dropped outside a valid dropzone
    if (!destination) return;

    const sourceId = source.droppableId;
    const destId = destination.droppableId;

    // If source is from sidebar (starts with 'sidebar-')
    if (sourceId.startsWith("sidebar-")) {
      const sectionName = sourceId.replace("sidebar-", "");
      const sectionWithName = activeSections.find(
        (section) => section.name === sectionName
      );
      if (!sectionWithName) return;

      const designIndex = source.index;
      const sectionDesigns = getDesignsBySectionId(sectionWithName.id);

      // If destination is a canvas dropzone (starts with 'canvas-')
      if (destId.startsWith("canvas-")) {
        const canvasSectionName = destId.replace("canvas-", "");

        // Only allow dropping if section names match
        if (sectionName === canvasSectionName) {
          const designToAdd = sectionDesigns[designIndex];

          setCanvasDesigns((prev) => ({
            ...prev,
            [canvasSectionName]: designToAdd
          }));
        }
      }
    }
    // We've removed the canvas-to-canvas drag functionality
  };

  const removeDesignFromCanvas = (sectionName: string) => {
    setCanvasDesigns((prev) => ({
      ...prev,
      [sectionName]: null
    }));
  };

  const handleGenerateHTML = () => {
    // Generate HTML from canvas designs
    const html = generateHTML(canvasDesigns, activeSections);
    setPreviewHTML(html);
    setIsPreview(true);
  };

  const closePreview = () => {
    setIsPreview(false);
    // Reapply editability after closing preview
    setTimeout(() => {
      if (canvasRef.current) {
        canvasRef.current.reapplyEditability();
      }
    }, 100); // Small delay to ensure DOM is updated
  };

  const downloadHTML = () => {
    // Create a blob with the HTML content
    const blob = new Blob([previewHTML], { type: "text/html" });

    // Create a URL for the blob
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor element
    const a = document.createElement("a");
    a.href = url;
    a.download = "portfolio.html";

    // Trigger the download
    document.body.appendChild(a);
    a.click();

    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSaveDesigns = async () => {
    if (!currentUser) return;

    try {
      // Make sure we're saving the latest edited content
      const designsToSave = { ...canvasDesigns };
      // Save the designs
      await saveCanvasDesigns(currentUser.id, designsToSave);
      toast.success('Designs saved successfully!', toastStyles.success);
    } catch (error) {
      console.error('Error saving designs:', error);
      toast.error('Failed to save designs. Please try again.', toastStyles.error);
    }
  };

  const handleSaveTemplate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentUser) return;

    // Validate template name
    if (!templateName.trim()) {
      setTemplateNameError("Please enter a template name");
      return;
    }

    try {
      //save the templates
      await saveTemplate(currentUser.id, templateName, canvasDesigns, currentUser.displayName || null);
      setShowTemplateNameInput(false);
      setTemplateName("");
      setTemplateNameError("");
      toast.success('Template saved successfully!', toastStyles.success);
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template. Please try again.', toastStyles.error);
    }
  };

  // Add this function to check if all sections are inactive
  const areAllSectionsInactive = () => {
    return sections.length > 0 && sections.every(section => !section.active);
  };

  // Add this function to check if canvas is blank
  const isCanvasBlank = () => {
    return Object.values(canvasDesigns).every(design => design === null);
  };

  const loading = authLoading || sectionsLoading || designsLoading || isLoadingTemplate;

  if (loading) {
    return <Loading />;
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div
        className={`flex flex-col h-[91dvh] ${isMobile ? "pt-16 pb-14 h-[97dvh]" : "mt-14"
          }`}
      >
        <div className="flex-1 flex overflow-hidden relative">
          {/* Canvas Component */}
          <div
            onClick={handleCanvasClick}
            className={`flex-1 transition-all duration-300 ${sidebarOpen
                ? isMobile
                  ? "h-[55vh]"
                  : "ml-[25rem]"
                : isMobile
                  ? "h-full"
                  : "ml-14"
              }`}
          >
            <DesignCanvas
              ref={canvasRef}
              activeSections={activeSections}
              canvasDesigns={canvasDesigns}
              removeDesignFromCanvas={removeDesignFromCanvas}
              setCanvasDesigns={setCanvasDesigns}
            />
          </div>

          {/* Sidebar Component */}
          <DesignSidebar
            activeSections={activeSections}
            sidebarOpen={sidebarOpen}
            getDesignsBySectionId={getDesignsBySectionId}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            isMobile={isMobile}
          />

          {/* Action Buttons */}
          {!loading && (
            <div className="fixed bottom-4 right-4 max-md:bottom-24 max-md:right-4 flex gap-2 z-50">
              <button
                type="button"
                onClick={handleSaveDesigns}
                disabled={areAllSectionsInactive() || isCanvasBlank()}
                className={`bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium py-3 px-5 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2 ${
                  (areAllSectionsInactive() || isCanvasBlank()) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                <span className="hidden md:inline">Save</span>
              </button>

              <button
                type="button"
                onClick={handleGenerateHTML}
                disabled={isCanvasBlank() || areAllSectionsInactive()}
                className={`bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-5 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2 ${
                  (isCanvasBlank() || areAllSectionsInactive()) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="hidden md:inline">Preview Portfolio</span>
              </button>
            </div>
          )}
        </div>

        {/* Template Name Input Modal */}
        <Modal
          isOpen={showTemplateNameInput}
          onClose={() => {
            setShowTemplateNameInput(false);
            setTemplateName("");
            setTemplateNameError("");
          }}
          title="Save as Template"
        >
          <form onSubmit={handleSaveTemplate}>
            <div className="mb-4">
              <input
                type="text"
                value={templateName}
                onChange={(e) => {
                  setTemplateName(e.target.value);
                  setTemplateNameError("");
                }}
                placeholder="Enter template name"
                className={`w-full px-3 py-2 border bg-gray-50 text-gray-900 ${
                  templateNameError 
                    ? 'border-red-500 dark:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600'
                } rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white`}
              />
              {templateNameError && (
                <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                  {templateNameError}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <button type="button"
                onClick={() => {
                  setShowTemplateNameInput(false);
                  setTemplateName("");
                  setTemplateNameError("");
                }}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-md hover:bg-gray-400 dark:hover:bg-gray-500  cursor-pointer"
                >
                Cancel
              </button>
              <button type="submit"
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-md transition-all duration-200 cursor-pointer"
              >
                Save Template
              </button>
            </div>
          </form>
        </Modal>

        {/* Preview Modal */}
        {!loading && isPreview && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
            {/* Floating action buttons - Horizontal for mobile and tablet */}
            <div className="absolute flex flex-row gap-2 top-4 right-4 lg:flex-col lg:gap-3 lg:top-10 lg:right-10 z-20 animate-float-in transition-delay-500 opacity-0 animation-fill-mode-forwards ">
              <button
                type="button"
                onClick={closePreview}
                className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white p-2 lg:p-3 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 transform hover:scale-110 cursor-pointer"
                aria-label="Close Preview"
                title="Close Preview"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 lg:h-6 lg:w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={downloadHTML}
                className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white p-2 lg:p-3 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 transform hover:scale-110 cursor-pointer"
                aria-label="Download HTML"
                title="Download HTML"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 lg:h-6 lg:w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setShowTemplateNameInput(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white p-2 lg:p-3 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 transform hover:scale-110 cursor-pointer"
                aria-label="Save as Template"
                title="Save as Template"
              >
                <FaImage className="h-5 w-5 lg:h-6 lg:w-6" />
              </button>

            </div>

            {/* Full-size iframe without header padding */}
            <div className="relative w-[95%] md:w-[90%] lg:w-[85%] h-[90%] bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 animate-scale-in">
              <iframe
                srcDoc={previewHTML}
                title="Portfolio Preview"
                className="w-full h-full border-0 bg-white"
                sandbox="allow-scripts"
              />
            </div>
          </div>
        )}
      </div>
    </DragDropContext>
  );
};

export default Builder;
