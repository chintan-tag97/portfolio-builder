// Color selection types
export type ColorType = 'text' | 'bg' | 'border';

/**
 * Applies a Tailwind color class to an element
 * @param element - The element to apply the color to
 * @param colorClass - The Tailwind color class to apply (e.g. 'text-red-500')
 * @param colorType - The type of color being applied (text, bg, border)
 */
export const applyColorClass = (
  element: HTMLElement,
  colorClass: string,
  colorType: ColorType
): void => {
  
  // Get a regex pattern for matching color classes of the given type
  const colorPattern = new RegExp(`^${colorType}-(white|black|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone|transparent)(-\\d+)?(/\\d+)?$`);
  
  // Get all the classes as an array to work with
  const classes = Array.from(element.classList);
  
  // Find and remove existing color classes of the same type
  const removedClasses: string[] = [];
  classes.forEach(className => {
    if (colorPattern.test(className)) {
      element.classList.remove(className);
      removedClasses.push(className);
    }
  });

  // Special case for removing the class
  if (colorClass === 'none') {
    return; // Don't add a new class, just remove the existing ones
  }

  // Add the new color class
  element.classList.add(colorClass);
  
  // If it's a border color, ensure the element has a border width
  if (colorType === 'border' && !element.classList.contains('border') && 
      !classes.some(cls => /^border(-\d+)?$/.test(cls))) {
    element.classList.add('border');
  }
};

/**
 * Gets the current colors applied to an element
 * @param element - The element to get colors from
 * @returns Object with text, bg, and border color classes
 */
export const getCurrentColors = (element: HTMLElement): Record<ColorType, string | null> => {
  const colors: Record<ColorType, string | null> = {
    text: null,
    bg: null,
    border: null
  };

  // Get all the classes as an array to work with
  const classes = Array.from(element.classList);
  
  // Check for text color classes - now with support for opacity and white/black
  const textColorClass = classes.find(cls => 
    /^text-(white|black|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone|transparent)(-\d+)?(\/(10|20|30|40|50|60|70|80|90|100))?$/.test(cls)
  );
  if (textColorClass) {
    colors.text = textColorClass;
  }
  
  // Check for background color classes - now with support for opacity and white/black
  const bgColorClass = classes.find(cls => 
    /^bg-(white|black|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone|transparent)(-\d+)?(\/(10|20|30|40|50|60|70|80|90|100))?$/.test(cls)
  );
  if (bgColorClass) {
    colors.bg = bgColorClass;
  }
  
  // Check for border color classes - now with support for opacity and white/black
  const borderColorClass = classes.find(cls => 
    /^border-(white|black|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone|transparent)(-\d+)?(\/(10|20|30|40|50|60|70|80|90|100))?$/.test(cls)
  );
  if (borderColorClass) {
    colors.border = borderColorClass;
  }

  return colors;
};

/**
 * Finds if the clicked point is within or near a text, button, or link element
 * @param container - The container element to search within
 * @param x - The x coordinate of the click
 * @param y - The y coordinate of the click
 * @returns The element that was clicked, or null if none was found
 */
export const findTargetElement = (
  container: HTMLElement,
  x: number,
  y: number
): HTMLElement | null => {
  // Get the element at the clicked coordinates
  const clickedElement = document.elementFromPoint(x, y) as HTMLElement;
  
  if (!clickedElement || !container.contains(clickedElement)) {
    return null;
  }

  // Skip text-related tags (h1-h6, span, p, label, etc.)
  const textTags = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'SPAN', 'P', 'LABEL', 'EM', 'STRONG', 'B', 'I', 'SMALL', 'MARK'];
  console.log('Clicked element:', clickedElement);
  
  // Check if the clicked element is a text tag
  if (textTags.includes(clickedElement.tagName)) {
    console.log('Clicked on a text tag, finding parent container');
    // Find the closest container element
    return findClosestColorableElement(clickedElement.parentElement as HTMLElement);
  }

  // Find the closest colorable element
  const colorableElement = findClosestColorableElement(clickedElement);
  return colorableElement;
};

/**
 * Finds the closest element that can have color applied (div, section, footer, header, article, aside, main)
 * @param element - The starting element to search from
 * @returns The closest colorable element, or null if none was found
 */
const findClosestColorableElement = (element: HTMLElement): HTMLElement | null => {
  // Only allow specific container elements
  const allowedTags = ['DIV', 'SECTION', 'FOOTER', 'HEADER', 'ARTICLE', 'ASIDE', 'MAIN', 'NAV', 'FORM'];
  
  // Check if the current element is one of the allowed container tags
  if (allowedTags.includes(element.tagName)) {
    return element;
  }
  
  // If not, find the closest container element
  const containerElement = element.closest('div, section, footer, header, article, aside, main, nav, form') as HTMLElement;
  
  // Only return the element if it exists and is within our container
  if (containerElement) {
    return containerElement;
  }
  
  // If we're here, no suitable element was found
  return null;
}; 