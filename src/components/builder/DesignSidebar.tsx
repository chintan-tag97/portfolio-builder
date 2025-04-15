import { useNavigate } from 'react-router-dom';
import { Section, Design } from '../../types';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { FaGripVertical, FaPalette, FaChevronDown } from 'react-icons/fa';
import { RxCross1 } from "react-icons/rx";
import { useState, useRef } from 'react';

interface DesignSidebarProps {
  activeSections: Section[];
  sidebarOpen: boolean;
  getDesignsBySectionId: (sectionId: number) => Design[];
  onToggleSidebar: () => void;
  isMobile: boolean;
}

const DesignSidebar = ({ 
  activeSections, 
  sidebarOpen, 
  getDesignsBySectionId,
  onToggleSidebar,
  isMobile
}: DesignSidebarProps) => {
  const navigate = useNavigate();
  const initializedRef = useRef<Record<number, boolean>>({});
  
  // Use a simple state with a function that checks the ref for initialization
  const [collapsedSections, setCollapsedSections] = useState<Record<number, boolean>>({});
  
  // Function to get the collapsed state, ensuring sections are collapsed by default
  const isCollapsed = (sectionId: number): boolean => {
    // If we haven't seen this section before, mark it as initialized and return true (collapsed)
    if (initializedRef.current[sectionId] === undefined) {
      initializedRef.current[sectionId] = true;
      
      // Update the state to match our ref (but this won't cause a re-render during the current render)
      setCollapsedSections(prev => ({
        ...prev,
        [sectionId]: true
      }));
      
      return true;
    }
    
    // Otherwise return the current state
    return collapsedSections[sectionId] !== false;
  };

  const toggleSection = (sectionId: number) => {
    const newValue = !isCollapsed(sectionId);
    initializedRef.current[sectionId] = true;
    
    setCollapsedSections(prev => ({
      ...prev,
      [sectionId]: newValue
    }));
  };

  return (
    <div 
      className={`
        ${isMobile 
          ? 'fixed bottom-0 left-0 right-0 flex flex-col-reverse' 
          : 'fixed left-0 top-14 bottom-0 flex'
        }
        transition-all duration-300
      `}
      style={{ zIndex: 50 }}
    >
      {/* Permanent sidebar */}
      <div 
        className={`
          ${isMobile 
            ? 'h-20 w-full bg-gray-800 dark:bg-gray-950 flex justify-around items-center shadow-lg z-50' 
            : 'w-16 bg-gray-800 dark:bg-gray-950 flex flex-col items-center py-4 shadow-lg z-50'
          }
        `}
      >
        <div className="flex flex-col items-center pb-2">
          <button
            type="button"
            onClick={onToggleSidebar}
            className={`p-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-all duration-200 cursor-pointer ${
              sidebarOpen ? 'text-white bg-gray-700' : ''
            }`}
            aria-label="Toggle Design Sidebar"
          >
            <FaPalette size={20} />
          </button>
          <span className="text-xs text-gray-400 min-lg:mt-1">Design</span>
        </div>
      </div>

      {/* Expandable sidebar */}
      <div 
        className={`
          bg-gray-100 dark:bg-gray-800 overflow-y-auto transition-all duration-300 shadow-lg z-40
          ${isMobile 
            ? `w-full ${sidebarOpen ? 'h-[35vh] shadow-black shadow-sidebar' : 'h-0'}`
            : `${sidebarOpen ? 'w-84' : 'w-0'}`
          }
        `}
      >
        <div className="p-4 min-h-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Design Elements</h2>
            <button
              type="button"
              onClick={onToggleSidebar}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-200 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
              aria-label="Close sidebar"
            >
              <RxCross1 size={20} />
            </button>
          </div>
          
          {activeSections.length === 0 ? (
            <div className="p-4 text-center rounded-lg border border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
              <p>No active sections found</p>
              <button 
                type="button"
                onClick={() => navigate('/sections')}
                className="mt-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                Go to Sections
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {activeSections.map(section => {
                const sectionDesigns = getDesignsBySectionId(section.id);
                const collapsed = isCollapsed(section.id);
                
                return (
                  <div key={section.docId} className={`bg-white dark:bg-gray-700 rounded-lg shadow transition-all duration-300 ease-in-out ${collapsed ? 'p-3 pb-1.5' : 'p-4'}`}>
                    <div 
                      className="flex items-center justify-between cursor-pointer mb-2 p-2 rounded-md group transition-all duration-200 ease-in-out hover:bg-gray-50 dark:hover:bg-gray-600"
                      onClick={() => toggleSection(section.id)}
                    >
                      <h3 className="font-medium text-gray-800 dark:text-white group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-200">{section.name}</h3>
                      <div className={`transform transition-transform duration-200 ${!collapsed ? 'rotate-180' : ''}`}>
                        <FaChevronDown className="text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300" />
                      </div>
                    </div>
                    
                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      collapsed ? 'max-h-0 opacity-0' : 'max-h-[1500px] opacity-100'
                    }`}>
                      {sectionDesigns.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400 p-2">No designs available</p>
                      ) : (
                        <Droppable droppableId={`sidebar-${section.name}`} isDropDisabled={true}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className="space-y-2"
                            >
                              {sectionDesigns.map((design, index) => (
                                <Draggable key={design.docId} draggableId={design.docId || `design-${design.id}`} index={index}>
                                  {(provided) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className="bg-gray-50 dark:bg-gray-600 p-2 rounded border border-gray-200 dark:border-gray-500 flex items-center"
                                    >
                                      <FaGripVertical className="text-gray-400 mr-2" />
                                      <span className="text-gray-700 dark:text-gray-200">{design.name}</span>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DesignSidebar; 