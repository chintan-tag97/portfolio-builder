import { useState, FormEvent, useEffect } from 'react';
import { Section } from '../types';

interface SectionFormProps {
  onSubmit: (sectionData: Omit<Section, 'id' | 'docId'>) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  existingSections?: Section[];
}

const SectionForm = ({ onSubmit, onCancel, isSubmitting, existingSections = [] }: SectionFormProps) => {
  const [name, setName] = useState('');
  const [order, setOrder] = useState(0);
  const [active, setActive] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isVisible, setIsVisible] = useState(false);

  // Animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);
  
  // Handle autofill styling for dark mode
  useEffect(() => {
    // This helps detect autofilled inputs and apply appropriate styling
    const checkAutofill = () => {
      const inputs = document.querySelectorAll('input');
      inputs.forEach(input => {
        // Check if the background color is the browser's autofill color
        const backgroundColor = window.getComputedStyle(input).backgroundColor;
        if (backgroundColor.includes('rgb(232, 240, 254)') || backgroundColor.includes('rgb(250, 255, 189)')) {
          // Add a class to indicate this input is autofilled
          input.classList.add('is-autofilled');
          
          // For dark mode, we need to override the browser's styling
          if (document.documentElement.classList.contains('dark')) {
            input.style.backgroundColor = '#1f2937';
            input.style.color = 'white';
            input.style.borderColor = '#4B5563';
          }
        }
      });
    };

    // Check immediately and then periodically
    checkAutofill();
    const interval = setInterval(checkAutofill, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else {
      // Check if name starts with capital letter
      if (!/^[A-Z]/.test(name)) {
        newErrors.name = 'Name must start with a capital letter';
      }
      
      // Check if name contains spaces, special characters, or numbers
      if (/[\s\W\d]/.test(name)) {
        newErrors.name = 'Name cannot contain spaces, special characters, or numbers';
      }
    }
    
    if (order < 0) {
      newErrors.order = 'Order must be a positive number';
    } else {
      // Check if order is unique
      const isDuplicateOrder = existingSections.some(section => section.order === order);
      if (isDuplicateOrder) {
        newErrors.order = 'Order must be unique. This order is already in use.';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    onSubmit({
      name,
      order,
      active
    });
  };

  const inputClasses = `bg-white w-full px-3 py-2 border rounded-md focus:outline-none focus:bg-gray-50 focus:ring-2 focus:ring-blue-500 transition-all duration-200 placeholder-gray-500 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-300 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:bg-gray-600 focus:z-10`;

  return (
    <form 
      onSubmit={handleSubmit}
      className={`transition-all duration-300 ease-in-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="space-y-4">
        <div>
          <label 
            htmlFor="name" 
            className="block mb-1 font-medium text-gray-700 dark:text-gray-200"
          >
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClasses}
            placeholder="Section name"
            autoFocus
          />
          {errors.name && (
            <p 
              className="mt-1 text-sm text-red-500" 
              data-aos="fade-in" 
              data-aos-duration="200"
            >
              {errors.name}
            </p>
          )}
        </div>
        
        <div>
          <label 
            htmlFor="order" 
            className="block mb-1 font-medium text-gray-700 dark:text-gray-200"
          >
            Order
          </label>
          <input
            id="order"
            type="number"
            value={order}
            onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
            className={inputClasses}
            min="0"
          />
          {errors.order && (
            <p 
              className="mt-1 text-sm text-red-500" 
              data-aos="fade-in" 
              data-aos-duration="200"
            >
              {errors.order}
            </p>
          )}
        </div>
        
        <div className="flex items-center">
          <input
            id="active"
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600 transition-colors duration-200"
          />
          <label 
            htmlFor="active" 
            className="ml-2 font-medium text-gray-700 dark:text-gray-200"
          >
            Active
          </label>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 rounded-md transition-all duration-200 bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 relative"
        >
          {isSubmitting ? (
            <>
              <span className="opacity-0">Save Section</span>
              <span className="absolute inset-0 flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
            </>
          ) : 'Save Section'}
        </button>
      </div>
    </form>
  );
};

export default SectionForm;