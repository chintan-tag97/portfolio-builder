import React, { useState, useEffect, useRef } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { IoMdColorFill } from 'react-icons/io';
import { MdOutlineFormatColorText } from 'react-icons/md';
import { ColorType } from '../../utils/colorSelector';
import { useColorSelection } from './ColorSelectionProvider';
import { colorPalette } from '../../constants';

interface ColorPickerProps {
  isOpen: boolean;
  onClose: () => void;
}

const opacityValues = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

const ColorPicker: React.FC<ColorPickerProps> = ({ 
  isOpen, 
  onClose
}) => {
  // Get context directly
  const { currentElement, currentColors, updateColor } = useColorSelection();
  
  const pickerRef = useRef<HTMLDivElement>(null);
  const [expandedPalette, setExpandedPalette] = useState<'text' | 'bg' | 'border' | null>(null);
  const [selectedOpacity, setSelectedOpacity] = useState<number>(100);
  
  // Reset selected color when color picker closes
  useEffect(() => {
    if (!isOpen) {
      setExpandedPalette(null);
      setSelectedOpacity(100);
    } else if (currentElement) {
      // Check if there's a preferred color type in the dataset
      const preferredType = currentElement.dataset.preferredColorType as ColorType;
      if (preferredType && (preferredType === 'text' || preferredType === 'bg' || preferredType === 'border')) {
        setExpandedPalette(preferredType);
        // Clean up after use
        delete currentElement.dataset.preferredColorType;
      }
    }
  }, [isOpen, currentElement]);
  
  // Handle clicking outside the color picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

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
  
  if (!isOpen) return null;
  
  // Toggle color palette visibility
  const togglePalette = (type: 'text' | 'bg' | 'border', e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setExpandedPalette(currentType => currentType === type ? null : type);
  };
  
  // Helper to get proper class for special colors
  const getColorClass = (color: string, shade: string, type: 'text' | 'bg' | 'border'): string => {
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
  
  // Handle direct color application
  const handleDirectColorApply = (colorClass: string, type: ColorType, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!currentElement) {
      return;
    }
    
    // Apply opacity if less than 100% and not "none"
    const colorWithOpacity = colorClass === 'none' 
      ? 'none' 
      : selectedOpacity < 100 
        ? `${colorClass}/${selectedOpacity}`
        : colorClass;
    
    console.log('Directly applying color:', {
      colorWithOpacity,
      type,
      element: currentElement
    });
    
    // Apply the color using context
    updateColor(colorWithOpacity, type);
    
    // Close the expanded palette after selection
    setTimeout(() => {
      setExpandedPalette(null);
    }, 300); // Small delay for better UX
    
    // Don't close the picker, just the palette
  };
  
  return (
    <div 
      ref={pickerRef}
      className="fixed left-1/2 lg:translate-x-1/12 md:translate-x-3/12 -translate-x-1/2 top-22 z-40 bg-gray-50/50 dark:bg-gray-950/60 shadow-lg border border-gray-200 dark:border-gray-600 backdrop-blur-sm rounded-lg p-2 flex flex-col items-center justify-center gap-2 w-fit pointer-events-auto animate-fade-in-fast"
      style={{ maxWidth: expandedPalette ? '90%' : 'fit-content' }}
      onMouseDown={(e) => e.preventDefault()}
    >
      {/* Close button - small x in the corner */}
      <button
        type="button"
        onClick={onClose}
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
                className={`absolute bottom-0 left-0 w-3 h-3 rounded-full ${currentColors.bg.split('/')[0] === 'bg-white' ? 'bg-white border border-gray-200' : currentColors.bg.split('/')[0] === 'bg-black' ? 'bg-black' : currentColors.bg.split('/')[0]}`}
              />
            )}
            {expandedPalette === 'bg' ? 
              <FiChevronUp className="absolute -bottom-1 -right-1 text-xs bg-white dark:bg-gray-800 rounded-full" /> : 
              <FiChevronDown className="absolute -bottom-1 -right-1 text-xs bg-white dark:bg-gray-800 rounded-full" />
            }
          </button>
        </div>
        
        {/* Border color button */}
        <div className="relative">
          <button
            type="button"
            data-toolbar-button="border"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={(e) => togglePalette('border', e)}
            className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 relative"
            title="Border color"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
            {currentColors.border && (
              <span 
                className={`absolute bottom-0 left-0 w-3 h-3 rounded-full ${currentColors.border.split('/')[0] === 'border-white' ? 'bg-white border border-gray-200' : currentColors.border.split('/')[0] === 'border-black' ? 'bg-black' : currentColors.border.replace('border-', 'bg-').split('/')[0]}`}
              />
            )}
            {expandedPalette === 'border' ? 
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

export default ColorPicker; 