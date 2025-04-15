/**
 * Makes text elements editable and form elements/buttons uninteractable
 * @param containerElement - The container element with the HTML content
 */
export const makeTextElementsEditable = (containerElement: HTMLElement): void => {
  // Flag to track if right mouse button is pressed
  let isRightMouseDown = false;
  
  // Create a WeakMap to store event handlers for cleanup
  if (typeof window !== 'undefined') {
    if (!window.__mouseTrackingHandlers) {
      window.__mouseTrackingHandlers = new WeakMap();
    }
  }
  
  // Add container level event listener to track right mouse button state
  const trackRightMouseDown = (e: Event) => {
    const mouseEvent = e as MouseEvent;
    isRightMouseDown = mouseEvent.button === 2;
  };
  
  const trackRightMouseUp = () => {
    isRightMouseDown = false;
  };
  
  const trackContextMenu = () => {
    // Ensure right mouse flag is reset after context menu
    setTimeout(() => {
      isRightMouseDown = false;
    }, 0);
  };
  
  // Add listeners to track mouse state at container level
  document.addEventListener('mousedown', trackRightMouseDown, true);
  document.addEventListener('mouseup', trackRightMouseUp, true);
  document.addEventListener('contextmenu', trackContextMenu, true);
  
  // Store these listeners for cleanup
  containerElement.setAttribute('data-mouse-tracking-added', 'true');
  
  // Store handlers for cleanup
  if (typeof window !== 'undefined') {
    if (!window.__mouseTrackingHandlers) {
      window.__mouseTrackingHandlers = new WeakMap();
    }
    
    window.__mouseTrackingHandlers.set(containerElement, {
      mousedown: trackRightMouseDown,
      mouseup: trackRightMouseUp,
      contextmenu: trackContextMenu
    });
  }
  
  // Make form elements and buttons uninteractable
  const interactiveElements = containerElement.querySelectorAll('button, input, select, textarea, a');
  interactiveElements.forEach(element => {
    (element as HTMLElement).setAttribute('data-original-pointer-events', (element as HTMLElement).style.pointerEvents || '');
    (element as HTMLElement).style.pointerEvents = 'none';
    
    // Make text content of buttons and links editable
    if (element.textContent?.trim()) {
      element.setAttribute('data-original-text', element.textContent);
      element.setAttribute('contenteditable', 'true');
      // Store original cursor style if it exists
      const htmlElement = element as HTMLElement;
      htmlElement.setAttribute('data-original-cursor', htmlElement.style.cursor || '');
      htmlElement.style.cursor = 'text';
      
      // Add CSS class to help prevent right-click focus
      element.classList.add('prevent-right-click-focus');
      
      // Prevent default on mousedown for right click
      const preventRightClickDefault = (e: Event) => {
        const mouseEvent = e as MouseEvent;
        if (mouseEvent.button === 2) {
          e.preventDefault();
          e.stopPropagation();
        }
      };
      
      // Prevent focus on right click
      const preventFocusOnRightClick = (e: Event) => {
        if (isRightMouseDown) {
          e.preventDefault();
          e.stopPropagation();
          (e.target as HTMLElement).blur();
          // Return focus to body or other safe element
          document.body.focus();
        }
      };
      
      // Add event listeners with capture
      element.addEventListener('mousedown', preventRightClickDefault, true);
      element.addEventListener('focus', preventFocusOnRightClick, true);
      
      // Store handlers for cleanup
      if (typeof window !== 'undefined') {
        if (!window.__editableHandlers) {
          window.__editableHandlers = new WeakMap();
        }
        
        // Store the handlers with the element as the key
        window.__editableHandlers.set(element, {
          mousedown: preventRightClickDefault,
          focus: preventFocusOnRightClick
        });
      }
      
      // Mark element for cleanup
      element.setAttribute('data-right-click-handlers', 'true');
    }
  });

  // Make text elements editable
  const textElements = containerElement.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div:not(:has(*))');
  textElements.forEach(element => {
    // Skip elements that are children of buttons, links, or form elements
    if (element.closest('input, select, textarea')) {
      return;
    }
    
    // Only make elements with text content editable
    if (element.textContent?.trim()) {
      element.setAttribute('contenteditable', 'true');
      
      // Add CSS class to help prevent right-click focus
      element.classList.add('prevent-right-click-focus');
      
      // Prevent default on mousedown for right click
      const preventRightClickDefault = (e: Event) => {
        const mouseEvent = e as MouseEvent;
        if (mouseEvent.button === 2) {
          e.preventDefault();
          e.stopPropagation();
        }
      };
      
      // Prevent focus on right click
      const preventFocusOnRightClick = (e: Event) => {
        if (isRightMouseDown) {
          e.preventDefault();
          e.stopPropagation();
          (e.target as HTMLElement).blur();
          // Return focus to body or other safe element
          document.body.focus();
        }
      };
      
      // Add event listeners with capture
      element.addEventListener('mousedown', preventRightClickDefault, true);
      element.addEventListener('focus', preventFocusOnRightClick, true);
      
      // Store handlers for cleanup
      if (typeof window !== 'undefined') {
        if (!window.__editableHandlers) {
          window.__editableHandlers = new WeakMap();
        }
        
        // Store the handlers with the element as the key
        window.__editableHandlers.set(element, {
          mousedown: preventRightClickDefault,
          focus: preventFocusOnRightClick
        });
      }
      
      // Mark element for cleanup
      element.setAttribute('data-right-click-handlers', 'true');
    }
  });
  
  // Add style to document to prevent right-click focus via CSS
  if (!document.getElementById('prevent-right-click-focus-style')) {
    const style = document.createElement('style');
    style.id = 'prevent-right-click-focus-style';
    style.textContent = `
      .prevent-right-click-focus:focus-visible {
        outline: none !important;
      }
      
      [contenteditable="true"]:focus {
        outline: 2px solid #673ab7 !important;
        outline-offset: 2px !important;
      }
    `;
    document.head.appendChild(style);
  }

  // Add the container's event listener for context menu (right-click)
  setupColorSelectionListeners(containerElement);
};

// Extend the Window interface to include our custom properties
declare global {
  interface Window {
    __editableHandlers?: WeakMap<Element, {
      mousedown: EventListener;
      focus: EventListener;
    }>;
    __mouseTrackingHandlers?: WeakMap<Element, {
      mousedown: EventListener;
      mouseup: EventListener;
      contextmenu: EventListener;
    }>;
  }
}

/**
 * Removes editability and restores interactivity
 * @param containerElement - The container element with the HTML content
 */
export const removeEditability = (containerElement: HTMLElement): void => {
  // Clean up mouse tracking listeners if we added them
  if (containerElement.hasAttribute('data-mouse-tracking-added')) {
    if (typeof window !== 'undefined' && window.__mouseTrackingHandlers) {
      const handlers = window.__mouseTrackingHandlers.get(containerElement);
      if (handlers) {
        document.removeEventListener('mousedown', handlers.mousedown, true);
        document.removeEventListener('mouseup', handlers.mouseup, true);
        document.removeEventListener('contextmenu', handlers.contextmenu, true);
        window.__mouseTrackingHandlers.delete(containerElement);
      }
    }
    containerElement.removeAttribute('data-mouse-tracking-added');
  }
  
  // Remove contenteditable from text elements
  const editableElements = containerElement.querySelectorAll('[contenteditable="true"]');
  editableElements.forEach(element => {
    element.removeAttribute('contenteditable');
    element.classList.remove('prevent-right-click-focus');
    
    // Remove the event listeners if we added them
    if (element.hasAttribute('data-right-click-handlers')) {
      if (typeof window !== 'undefined' && window.__editableHandlers) {
        const handlers = window.__editableHandlers.get(element);
        if (handlers) {
          element.removeEventListener('mousedown', handlers.mousedown, true);
          element.removeEventListener('focus', handlers.focus, true);
          window.__editableHandlers.delete(element);
        }
      }
      element.removeAttribute('data-right-click-handlers');
    }
  });

  // Restore interactivity to form elements and buttons
  const interactiveElements = containerElement.querySelectorAll('[data-original-pointer-events]');
  interactiveElements.forEach(element => {
    const originalPointerEvents = element.getAttribute('data-original-pointer-events');
    if (originalPointerEvents) {
      (element as HTMLElement).style.pointerEvents = originalPointerEvents;
    } else {
      (element as HTMLElement).style.pointerEvents = '';
    }
    
    // Restore original cursor style if it exists
    const originalCursor = element.getAttribute('data-original-cursor');
    if (originalCursor !== null) {
      (element as HTMLElement).style.cursor = originalCursor;
    }
    
    element.removeAttribute('data-original-pointer-events');
    element.removeAttribute('data-original-text');
    element.removeAttribute('data-original-cursor');
  });

  // Remove color selection related attributes
  removeColorSelectionListeners(containerElement);
  
  // Remove the style tag if it exists and no other editable container exists
  if (document.getElementById('prevent-right-click-focus-style') && 
      !document.querySelector('[data-right-click-handlers]')) {
    const styleElement = document.getElementById('prevent-right-click-focus-style');
    if (styleElement && styleElement.parentNode) {
      styleElement.parentNode.removeChild(styleElement);
    }
  }
};

/**
 * Sets up event listeners for color selection in a container element
 * @param containerElement - The container element to add color selection to
 */
export const setupColorSelectionListeners = (containerElement: HTMLElement): void => {
  // Mark the container as having color selection enabled
  containerElement.setAttribute('data-color-selection-enabled', 'true');
  
  // Event handler reference for cleanup
  const handleContextMenu = (event: MouseEvent) => {
    // Check if the clicked element or any of its parents is a contenteditable element in focus
    const target = event.target as HTMLElement;
    const isContentEditableInFocus = 
      target.isEqualNode(document.activeElement) || 
      target.closest('[contenteditable="true"]')?.isEqualNode(document.activeElement);
    
    // If a contenteditable element is in focus, allow the default context menu
    if (isContentEditableInFocus) {
      return;
    }
    
    // Otherwise prevent the default context menu and show the color picker
    event.preventDefault();
    
    // Create a custom event with position and container
    const customEvent = new CustomEvent('show-color-picker', {
      bubbles: true,
      detail: {
        x: event.clientX,
        y: event.clientY,
        container: containerElement
      }
    });
    
    // Dispatch the event
    document.dispatchEvent(customEvent);
  };
  
  // Add event listener to the container
  containerElement.removeEventListener('contextmenu', handleContextMenu);
  containerElement.addEventListener('contextmenu', handleContextMenu);
  
  // Store the handler reference for cleanup
  containerElement.setAttribute('data-color-selection-handler', 'true');
  
  // Store handler function reference in a global map for cleanup
  if (typeof window !== 'undefined') {
    // Define interface for the window object with our custom property
    interface WindowWithHandlers extends Window {
      __colorSelectionHandlers: Map<HTMLElement, (event: MouseEvent) => void>;
    }
    
    // Initialize the handlers map if it doesn't exist
    if (!((window as unknown) as WindowWithHandlers).__colorSelectionHandlers) {
      ((window as unknown) as WindowWithHandlers).__colorSelectionHandlers = new Map();
    }
    
    // Store the handler with the container as the key
    ((window as unknown) as WindowWithHandlers).__colorSelectionHandlers.set(containerElement, handleContextMenu);
  }
};

/**
 * Removes color selection event listeners from the container element
 * @param containerElement - The container to remove listeners from
 */
const removeColorSelectionListeners = (containerElement: HTMLElement): void => {
  containerElement.removeAttribute('data-color-selection-enabled');
  containerElement.removeAttribute('data-color-selection-handler');
  
  // Explicit removal of event handlers is not possible here since we can't access the original function references
  // The handlers will be removed when the element is unmounted
};

/**
 * Cleans HTML content for export by removing editing attributes and classes
 * @param htmlContent - The HTML content string to clean
 * @returns The cleaned HTML string
 */
export const cleanHTMLForExport = (htmlContent: string): string => {
  // Create a temporary div to clean the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  
  // Clean all contenteditable attributes and classes
  const editableElements = tempDiv.querySelectorAll('[contenteditable], .editable-text');
  editableElements.forEach(element => {
    element.removeAttribute('contenteditable');
    element.classList.remove('editable-text');
  });
  
  // Remove data attributes and inline styles related to interactivity
  const elementsWithDataAttrs = tempDiv.querySelectorAll(
    '[data-original-pointer-events], [data-original-text], [data-original-cursor], [data-editable-container], ' +
    '[data-color-selection-enabled], [data-color-selection-handler], [data-color-editing], ' +
    '[data-original-outline], [data-original-outline-offset]'
  );
  
  elementsWithDataAttrs.forEach(element => {
    element.removeAttribute('data-original-pointer-events');
    element.removeAttribute('data-original-text');
    element.removeAttribute('data-original-cursor');
    element.removeAttribute('data-editable-container');
    element.removeAttribute('data-color-selection-enabled');
    element.removeAttribute('data-color-selection-handler');
    element.removeAttribute('data-color-editing');
    element.removeAttribute('data-original-outline');
    element.removeAttribute('data-original-outline-offset');
    
    (element as HTMLElement).style.removeProperty('pointer-events');
    (element as HTMLElement).style.removeProperty('cursor');
    (element as HTMLElement).style.removeProperty('outline');
    (element as HTMLElement).style.removeProperty('outline-offset');
  });
  
  return tempDiv.innerHTML;
}; 