import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import ColorPicker from './ColorPicker';
import { findTargetElement, applyColorClass, ColorType, getCurrentColors } from '../../utils/colorSelector';

interface ColorSelectionContextType {
  selectElement: (element: HTMLElement) => void;
  currentElement: HTMLElement | null;
  currentColors: Record<ColorType, string | null>;
  updateColor: (colorClass: string, colorType: ColorType) => void;
}

const ColorSelectionContext = createContext<ColorSelectionContextType | null>(null);

export const useColorSelection = () => {
  const context = useContext(ColorSelectionContext);
  if (!context) {
    throw new Error('useColorSelection must be used within a ColorSelectionProvider');
  }
  return context;
};

interface ColorSelectionProviderProps {
  children: React.ReactNode;
}

const ColorSelectionProvider: React.FC<ColorSelectionProviderProps> = ({ children }) => {
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [colorPickerPosition, setColorPickerPosition] = useState({ x: 0, y: 0 });
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const [currentContainer, setCurrentContainer] = useState<HTMLElement | null>(null);
  const [currentColors, setCurrentColors] = useState<Record<ColorType, string | null>>({
    text: null,
    bg: null,
    border: null
  });

  // Update current colors whenever the selected element changes
  useEffect(() => {
    if (selectedElement) {
      setCurrentColors(getCurrentColors(selectedElement));
    } else {
      setCurrentColors({ text: null, bg: null, border: null });
    }
  }, [selectedElement]);

  // Add/remove selection outline when an element is selected
  useEffect(() => {
    if (selectedElement) {
      // Add a highlight outline to show which element is selected
      selectedElement.setAttribute('data-color-editing', 'true');
      
      // Store the original outline to restore later
      if (!selectedElement.hasAttribute('data-original-outline')) {
        selectedElement.setAttribute('data-original-outline', selectedElement.style.outline || '');
        selectedElement.setAttribute('data-original-outline-offset', selectedElement.style.outlineOffset || '');
      }
      
      // Apply a visual indicator
      selectedElement.style.outline = '2px dashed rgba(59, 130, 246, 0.5)';
      selectedElement.style.outlineOffset = '2px';
    }
    
    return () => {
      if (selectedElement) {
        // Clean up the selection highlight
        selectedElement.removeAttribute('data-color-editing');
        
        // Restore original outline
        const originalOutline = selectedElement.getAttribute('data-original-outline');
        const originalOutlineOffset = selectedElement.getAttribute('data-original-outline-offset');
        
        if (originalOutline !== null) {
          selectedElement.style.outline = originalOutline;
        } else {
          selectedElement.style.removeProperty('outline');
        }
        
        if (originalOutlineOffset !== null) {
          selectedElement.style.outlineOffset = originalOutlineOffset;
        } else {
          selectedElement.style.removeProperty('outline-offset');
        }
        
        selectedElement.removeAttribute('data-original-outline');
        selectedElement.removeAttribute('data-original-outline-offset');
      }
    };
  }, [selectedElement]);

  // Handle showing the color picker
  const handleShowColorPicker = useCallback((event: Event) => {
    const customEvent = event as CustomEvent;
    const { x, y, container, colorType, targetElement } = customEvent.detail;
    
    console.log('Show color picker event received:', { 
      x, y, container, colorType, 
      hasTargetElement: !!targetElement,
      targetElementInfo: targetElement ? {
        tagName: targetElement.tagName,
        id: targetElement.id,
        className: targetElement.className
      } : null
    });
    
    // If a target element was provided directly (from toolbar), use it
    // Otherwise find the target element near the click coordinates
    const element = targetElement || findTargetElement(container, x, y);
    
    if (element) {
      // Set the selected element
      console.log('Setting selected element:', element);
      setSelectedElement(element);
      
      // Set picker position and open it
      setColorPickerPosition({ x, y });
      setIsColorPickerOpen(true);
      setCurrentContainer(container);
      
      // If a specific color type was provided from the toolbar, use it
      // This is used to pre-select the tab in the ColorPicker
      if (colorType) {
        // Pass this to the ColorPicker somehow
        // We can add a property to the element's dataset as a temporary solution
        element.dataset.preferredColorType = colorType;
      }
    } else {
      console.log('No target element found for color picker');
    }
  }, []);

  // Add global event listener for the custom event
  useEffect(() => {
    document.addEventListener('show-color-picker', handleShowColorPicker);
    
    return () => {
      document.removeEventListener('show-color-picker', handleShowColorPicker);
    };
  }, [handleShowColorPicker]);

  // Directly select an element (used by the toolbar)
  const selectElement = useCallback((element: HTMLElement) => {
    setSelectedElement(element);
    const container = element.closest('[data-design-container]') || document.body;
    setCurrentContainer(container as HTMLElement);
  }, []);

  // Close the color picker
  const handleCloseColorPicker = () => {
    // Always trigger a final update to ensure we save the latest state
    if (selectedElement && currentContainer) {
      triggerUpdate(selectedElement, currentContainer);
    }
    
    setIsColorPickerOpen(false);
  };

  // Function to trigger the update event
  const triggerUpdate = (element: HTMLElement, container: HTMLElement) => {
    const updateEvent = new CustomEvent('color-update', {
      bubbles: true,
      detail: {
        element,
        container
      }
    });
    
    container.dispatchEvent(updateEvent);
  };

  // Apply color to the selected element
  const handleColorSelect = (colorClass: string, colorType: ColorType) => {
    // Additional check to ensure we got passed a valid element
    if (!selectedElement) {
      console.error('No element selected for color application');
      return;
    }
    
    console.log('Applying color class from picker:', {
      colorClass, 
      colorType, 
      element: selectedElement,
      elementId: selectedElement.id,
      tagName: selectedElement.tagName,
      before: selectedElement.className
    });
    
    try {
      // Apply the color class directly
      applyColorClass(selectedElement, colorClass, colorType);
      
      // Log the resulting classes to debug
      console.log('Element classes after color application:', selectedElement.className);
      
      // Update our internal state to keep UI in sync
      setCurrentColors(prevColors => ({
        ...prevColors,
        [colorType]: colorClass === 'none' ? null : colorClass
      }));
      
      // Force focus back to the selected element if it's contenteditable
      if (selectedElement.hasAttribute('contenteditable')) {
        selectedElement.focus();
      }
      
      // Trigger update event for parent components
      if (currentContainer) {
        // Use a small timeout to ensure the DOM has updated with the new classes
        setTimeout(() => {
          console.log('Triggering color update event for container:', currentContainer);
          triggerUpdate(selectedElement, currentContainer);
        }, 50);
      }
    } catch (error) {
      console.error('Error applying color class:', error);
    }
  };

  // Context value
  const contextValue: ColorSelectionContextType = {
    selectElement,
    currentElement: selectedElement,
    currentColors,
    updateColor: handleColorSelect
  };

  return (
    <ColorSelectionContext.Provider value={contextValue}>
      {children}
      <ColorPicker
        isOpen={isColorPickerOpen}
        onClose={handleCloseColorPicker}
        position={colorPickerPosition}
      />
    </ColorSelectionContext.Provider>
  );
};

export default ColorSelectionProvider; 