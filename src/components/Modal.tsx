import { ReactNode, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Handle animation states
  useEffect(() => {
    // Clear any existing timeouts
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    if (isOpen) {
      setShouldRender(true);
      // Small delay to ensure DOM is ready for animation
      animationTimeoutRef.current = setTimeout(() => {
        setIsAnimating(true);
      }, 50);
    } else {
      setIsAnimating(false);
      // Wait for animation to complete before unmounting
      animationTimeoutRef.current = setTimeout(() => {
        setShouldRender(false);
      }, 300);
    }

    // Cleanup function
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, [isOpen]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  // Close modal on escape key press
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  if (!shouldRender) return null;

  return createPortal(
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ease-in-out ${
        isAnimating 
          ? 'backdrop-blur-sm bg-black/30 dark:bg-black/50' 
          : 'backdrop-blur-0 bg-transparent'
      }`}
      aria-modal="true"
      role="dialog"
    >
      <div 
        ref={modalRef}
        className={`max-w-md min-lg:max-w-lg min-wide:max-w-xl w-full rounded-lg shadow-xl transition-all duration-300 ease-in-out bg-white text-gray-900 dark:bg-gray-800 dark:text-white ${
          isAnimating 
            ? 'opacity-100 transform translate-y-0 scale-100' 
            : 'opacity-0 transform -translate-y-8 scale-95'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none transition-colors duration-200"
            aria-label="Close modal"
          >
            <span className="sr-only ">Close</span>
            <svg className="h-6 w-6 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal; 