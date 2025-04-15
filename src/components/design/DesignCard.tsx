import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Design } from '../../types';
import { useDesigns } from '../../context/DesignContext';
import { FaEye, FaPencilAlt, FaTrash, FaCode, FaExpand } from 'react-icons/fa';
import Modal from '../Modal';

interface DesignCardProps {
  design: Design;
  animationDelay?: number;
}

const DesignCard: React.FC<DesignCardProps> = ({ design, animationDelay = 0 }) => {
  const navigate = useNavigate();
  const { deleteDesignById, updateDesignById } = useDesigns();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingActive, setIsTogglingActive] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Add effect to handle body scroll lock
  useEffect(() => {
    if (showPreviewModal || showDeleteConfirm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showPreviewModal, showDeleteConfirm]);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteDesignById(design.docId!);
    } catch (error) {
      console.error('Failed to delete design:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleToggleActive = async () => {
    try {
      setIsTogglingActive(true);
      await updateDesignById(design.docId!, { active: !design.active });
    } catch (error) {
      console.error('Failed to toggle design active state:', error);
    } finally {
      setIsTogglingActive(false);
    }
  };

  const handleEdit = () => {
    navigate(`/designs/edit/${design.docId}`, { state: { design } });
  };

  return (
    <>
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 opacity-0 animate-fade-in-up [animation-fill-mode:forwards] card-hover"
        style={{ animationDelay: `${animationDelay}ms` }}
      >
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{design.name}</h3>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setShowPreviewModal(true)}
                title="Full Preview"
                className="w-8 h-8 flex items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 cursor-pointer"
                aria-label="Full preview"
              >
                <FaExpand size={16} />
              </button>
              <button
                type="button"
                onClick={() => setShowCode(!showCode)}
                title="Show Code"
                className="w-8 h-8 flex items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 cursor-pointer"
                aria-label={showCode ? 'Show preview' : 'Show code'}
              >
                {showCode ? <FaEye size={18} /> : <FaCode size={18} />}
              </button>
              <button
                type="button"
                onClick={handleEdit}
                title="Edit Design"
                className="w-8 h-8 flex items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 cursor-pointer"
              >
                <FaPencilAlt size={16} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(true);
                }}
                title="Delete Design"
                className="w-8 h-8 flex items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 cursor-pointer"
              >
                <FaTrash size={16} />
              </button>
              <button
                type="button"
                title="Active Status"
                onClick={handleToggleActive}
                disabled={isTogglingActive}
                className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                style={{ backgroundColor: design.active ? '#3b82f6' : '#d1d5db' }}
                role="switch"
                aria-checked={design.active}
              >
                <span
                  className={`${
                    design.active ? 'translate-x-5' : 'translate-x-0'
                  } pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                >
                  <span
                    className={`${
                      design.active ? 'opacity-0 duration-100 ease-out' : 'opacity-100 duration-200 ease-in'
                    } absolute inset-0 flex h-full w-full items-center justify-center transition-opacity`}
                    aria-hidden="true"
                  >
                    <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 12 12">
                      <path
                        d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span
                    className={`${
                      design.active ? 'opacity-100 duration-200 ease-in' : 'opacity-0 duration-100 ease-out'
                    } absolute inset-0 flex h-full w-full items-center justify-center transition-opacity`}
                    aria-hidden="true"
                  >
                    <svg className="h-3 w-3 text-blue-600" fill="currentColor" viewBox="0 0 12 12">
                      <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
                    </svg>
                  </span>
                </span>
              </button>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Section: {design.pageSection.name}
          </p>
          
          <div className="space-y-4">
            {showCode ? (
              <div className="border border-gray-200 dark:border-gray-700 rounded-md p-2 bg-gray-50 dark:bg-gray-900 overflow-auto max-h-32">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">HTML Code:</div>
                <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {design.html.length > 150 
                    ? `${design.html.substring(0, 150)}...` 
                    : design.html}
                </pre>
              </div>
            ) : (
              <div className="border border-gray-200 dark:border-gray-700 rounded-md p-2 bg-white dark:bg-gray-800 overflow-auto max-h-96">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Preview:</div>
                <div 
                  className="preview-content text-sm"
                  dangerouslySetInnerHTML={{ __html: design.html }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Confirm Delete"
      >
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to delete the design "{design.name}"?
        </p>
        
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(false)}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </Modal>


      

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="min-h-screen px-4 py-6 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-4xl relative">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                  {design.name} - Full Preview
                </h3>
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 cursor-pointer"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="overflow-auto max-h-[calc(100vh-10rem)]">
                <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4 bg-white dark:bg-gray-900">
                  <div 
                    className="preview-content"
                    dangerouslySetInnerHTML={{ __html: design.html }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DesignCard; 