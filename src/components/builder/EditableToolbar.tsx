import React, { useEffect, useRef, useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { IoMdColorFill } from 'react-icons/io';
import { MdOutlineFormatColorText } from 'react-icons/md';
import { ColorType } from '../../utils/colorSelector';
import { useColorSelection } from './ColorSelectionProvider';
import { colorPalette } from '../../constants';

interface EditableToolbarProps {
  onClose?: () => void;
}

// Available opacity options
const opacityValues = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

const EditableToolbar: React.FC<EditableToolbarProps> = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const { selectElement, currentElement, currentColors, updateColor } = useColorSelection();
  const toolbarRef = useRef<HTMLDivElement>(null);
  const originalElementRef = useRef<HTMLElement | null>(null);
  
  // Track expanded color palettes - changed from 'text' | 'bg' | 'border' to just 'text' | 'bg'
  const [expandedPalette, setExpandedPalette] = useState<'text' | 'bg' | null>(null);
  
  // Added state for opacity
  const [selectedOpacity, setSelectedOpacity] = useState<number>(100);

  // Handle manual close
  const handleClose = () => {
    setIsVisible(false);
    setExpandedPalette(null);
    if (onClose) {
      onClose();
    }
  };

  // Monitor focus events on contenteditable elements
  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.hasAttribute('contenteditable') && target.getAttribute('contenteditable') === 'true') {
        setIsVisible(true);
        selectElement(target);
        // Store the original focused element
        originalElementRef.current = target;
      }
    };
    
    const handleFocusOut = (e: FocusEvent) => {
      // Check if we're focusing another contenteditable element
      const relatedTarget = e.relatedTarget as HTMLElement;
      
      // Don't hide if clicking on the toolbar itself
      if (toolbarRef.current && (toolbarRef.current.contains(relatedTarget) || toolbarRef.current === relatedTarget)) {
        return;
      }
      
      // Don't hide if clicking on any toolbar button
      if (relatedTarget && relatedTarget.closest('[data-toolbar-button]')) {
        return;
      }
      
      // If we're not focusing another contenteditable, hide the toolbar
      if (!relatedTarget || !relatedTarget.hasAttribute('contenteditable')) {
        setIsVisible(false);
        setExpandedPalette(null); // Close any expanded palette
        if (onClose) {
          onClose();
        }
      }
    };
    
    // Handle mouse down events on the document
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // If clicking on the toolbar or its buttons, don't do anything special
      if (toolbarRef.current && 
          (toolbarRef.current.contains(target) || 
           target.closest('[data-toolbar-button]'))) {
        return;
      }
      
      // If we're clicking outside the toolbar, close the expanded palette
      if (expandedPalette) {
        setExpandedPalette(null);
      }
      
      // If we're clicking in a different contenteditable element
      if (target.hasAttribute('contenteditable') && 
          target.getAttribute('contenteditable') === 'true' &&
          originalElementRef.current !== target) {
        originalElementRef.current = target;
        selectElement(target);
        return;
      }
    };
    
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
    document.addEventListener('mousedown', handleMouseDown);
    
    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [selectElement, expandedPalette, onClose]);
  
  // Extract current opacity from color class when palette changes
  useEffect(() => {
    if (expandedPalette && currentColors[expandedPalette]) {
      const currentColor = currentColors[expandedPalette] || '';
      if (currentColor && currentColor !== 'none') {
        const parts = currentColor.split('/');
        if (parts.length > 1) {
          const opacityValue = parseInt(parts[1], 10);
          if (!isNaN(opacityValue)) {
            setSelectedOpacity(opacityValue);
            return;
          }
        }
      }
      // Default to 100% if no opacity found
      setSelectedOpacity(100);
    }
  }, [expandedPalette, currentColors]);
  
  // Handle direct color application
  const handleDirectColorApply = (colorClass: string, type: ColorType, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const elementToUse = originalElementRef.current || currentElement;
    if (!elementToUse) {
      return;
    }
    
    // Make sure the original element is selected
    selectElement(elementToUse);
    
    // First, remove any existing color classes of this type
    const existingClasses = elementToUse.className.split(' ');
    const prefix = `${type}-`; // e.g., 'text-', 'bg-'
    const filteredClasses = existingClasses.filter(cls => !cls.startsWith(prefix));
    
    // Apply opacity if less than 100% and not "none"
    const colorWithOpacity = colorClass === 'none' 
      ? 'none' 
      : selectedOpacity < 100 
        ? `${colorClass}/${selectedOpacity}`
        : colorClass;
    
    console.log('Directly applying color:', {
      colorWithOpacity,
      type,
      element: elementToUse,
      existingClasses,
      filteredClasses
    });
    
    // Use the updateColor function from context
    updateColor(colorWithOpacity, type);
    
    // Keep focus on the original element
    if (elementToUse.hasAttribute('contenteditable')) {
      elementToUse.focus();
    }
    
    // Close the expanded palette
    setTimeout(() => {
      setExpandedPalette(null);
    }, 300); // Small delay for better UX
  };
  
  // Toggle color palette visibility - for text and bg only
  const togglePalette = (type: 'text' | 'bg', e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setExpandedPalette(currentType => currentType === type ? null : type);
  };
  
  // Helper to get proper class for special colors
  const getColorClass = (color: string, shade: string, type: 'text' | 'bg'): string => {
    if (color === 'white') {
      return `${type}-white`;
    } else if (color === 'black') {
      return `${type}-black`;
    } else {
      return `${type}-${color}-${shade}`;
    }
  };
  
  // Helper to get proper preview class for color buttons
  const getPreviewClass = (color: string, shade: string): string => {
    if (color === 'white') {
      return 'bg-white border border-gray-200';
    } else if (color === 'black') {
      return 'bg-black';
    } else {
      return `bg-${color}-${shade}`;
    }
  };
  
  if (!isVisible) return null;
  
  return (
    <div 
      ref={toolbarRef}
      className="fixed left-1/2 lg:translate-x-1/12 md:translate-x-3/12 -translate-x-1/2 top-22 z-40 bg-gray-50/50 dark:bg-gray-950/60 shadow-lg border border-gray-200 dark:border-gray-600 backdrop-blur-sm rounded-lg p-2 flex flex-col items-center justify-center gap-2 w-fit pointer-events-auto animate-fade-in-fast"
      style={{ maxWidth: expandedPalette ? '90%' : 'fit-content' }}
      onMouseDown={(e) => {
        e.preventDefault();
      }}
    >
      {/* Close button - small x in the corner */}
      <button
        type="button"
        onClick={handleClose}
        className="absolute right-1 top-1 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      <div className="flex items-center justify-center gap-4 px-2">
        {/* Text color button */}
        <div className="relative">
          <button
            type="button"
            data-toolbar-button="text"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={(e) => togglePalette('text', e)}
            className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 relative"
            title="Text color"
          >
            <MdOutlineFormatColorText className="text-lg" />
            {currentColors.text && (
              <span 
                className={`absolute bottom-0 left-0 w-3 h-3 rounded-full ${currentColors.text.split('/')[0] === 'text-white' ? 'bg-white border border-gray-200' : currentColors.text.split('/')[0] === 'text-black' ? 'bg-black' : currentColors.text.replace('text-', 'bg-').split('/')[0]}`}
              />
            )}
            {expandedPalette === 'text' ? 
              <FiChevronUp className="absolute -bottom-1 -right-1 text-xs bg-white dark:bg-gray-800 rounded-full" /> : 
              <FiChevronDown className="absolute -bottom-1 -right-1 text-xs bg-white dark:bg-gray-800 rounded-full" />
            }
          </button>
        </div>
        
        {/* Background color button */}
        <div className="relative">
          <button
            type="button"
            data-toolbar-button="bg"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={(e) => togglePalette('bg', e)}
            className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 relative"
            title="Background color"
          >
            <IoMdColorFill className="text-lg" />
            {currentColors.bg && (
              <span 
                className={`absolute bottom-0 left-0 w-3 h-3 rounded-full ${currentColors.bg.split('/')[0]}`}
              />
            )}
            {expandedPalette === 'bg' ? 
              <FiChevronUp className="absolute -bottom-1 -right-1 text-xs bg-white dark:bg-gray-800 rounded-full" /> : 
              <FiChevronDown className="absolute -bottom-1 -right-1 text-xs bg-white dark:bg-gray-800 rounded-full" />
            }
          </button>
        </div>
        
        {/* Separator */}
        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
        
        {/* Quick white color button */}
        <button
          type="button"
          data-toolbar-button="quick-white"
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => {
            // Apply white to the current color type or text if none expanded
            const type = expandedPalette || 'text';
            const colorClass = `${type}-white`;
            handleDirectColorApply(colorClass, type, e);
          }}
          className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:ring-1 hover:ring-gray-300"
          title="White"
        />
        
        {/* Quick black color button */}
        <button
          type="button"
          data-toolbar-button="quick-black"
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => {
            // Apply black to the current color type or text if none expanded
            const type = expandedPalette || 'text';
            const colorClass = `${type}-black`;
            handleDirectColorApply(colorClass, type, e);
          }}
          className="w-6 h-6 rounded-full bg-black flex items-center justify-center hover:ring-1 hover:ring-gray-400"
          title="Black"
        />
        
        {/* Remove button */}
        <button
          type="button"
          data-toolbar-button="quick-reset"
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => {
            // Remove color for currently expanded palette or text if none
            const type = expandedPalette || 'text';
            handleDirectColorApply('none', type, e);
          }}
          className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
          title="Remove color"
        >
          <span className="text-md">X</span>
        </button>
      </div>
      
      {/* Color palette display - shown when palette is expanded */}
      {expandedPalette && (
        <div className="mt-2 p-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 w-full max-w-screen-md">
          {/* Opacity selector */}
          <div className="mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-600 dark:text-gray-400">Opacity: {selectedOpacity}%</span>
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {opacityValues.map(opacity => (
                <button
                  key={opacity}
                  type="button"
                  onClick={() => setSelectedOpacity(opacity)}
                  className={`text-xs px-1.5 py-0.5 rounded 
                    ${selectedOpacity === opacity 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                    }`}
                >
                  {opacity}
                </button>
              ))}
            </div>
          </div>
          
          {/* Color grid */}
          <div className="grid grid-cols-11 auto-rows-min gap-2 overflow-y-auto max-h-60">
            {colorPalette.map(color => (
              <div key={color.name} className="flex flex-col items-center gap-1">
                {color.values.map(shade => {
                  const colorClass = getColorClass(color.name, shade, expandedPalette);
                  const previewClass = getPreviewClass(color.name, shade);
                  
                  // Check if this color is currently selected
                  const currentColorBase = currentColors[expandedPalette]?.split('/')[0] || '';
                  const isSelected = currentColorBase === colorClass;
                  
                  return (
                    <button
                      key={`${color.name}-${shade || 'base'}`}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={(e) => handleDirectColorApply(colorClass, expandedPalette, e)}
                      className={`w-5 h-5 rounded-full ${previewClass} ${isSelected ? 'ring-2 ring-offset-1 ring-blue-500 animate-color-pulse' : 'hover:ring-1 hover:ring-offset-1 hover:ring-gray-400'}`}
                      title={`${color.name}${shade ? `-${shade}` : ''}${selectedOpacity < 100 ? ` (${selectedOpacity}%)` : ''}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EditableToolbar; 