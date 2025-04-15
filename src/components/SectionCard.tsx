import { useState } from 'react';
import { updateSection, deleteSection } from '../services/sectionService';
import { FiTrash2, FiEdit, FiCheck, FiX } from 'react-icons/fi';
import { Section } from '../types';
import Modal from './Modal';

interface SectionCardProps {
  section: Section;
  onDelete: (docId: string) => void;
  onUpdate: (docId: string, data: Partial<Omit<Section, 'id' | 'docId'>>) => void;
  animationDelay?: number;
  existingSections?: Section[];
}

const SectionCard = ({ 
  section, 
  onDelete, 
  onUpdate, 
  animationDelay = 0,
  existingSections = [] 
}: SectionCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(section.name);
  const [editOrder, setEditOrder] = useState(section.order);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleToggleActive = async () => {
    try {
      await updateSection(section.docId!, { active: !section.active });
      onUpdate(section.docId!, { active: !section.active });
    } catch (error) {
      console.error('Failed to update section:', error);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteSection(section.docId!);
      onDelete(section.docId!);
    } catch (error) {
      console.error('Failed to delete section:', error);
      setIsDeleting(false);
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleEdit = () => {
    setEditName(section.name);
    setEditOrder(section.order);
    setErrors({});
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setErrors({});
  };

  const validateEdit = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!editName.trim()) {
      newErrors.name = 'Name is required';
    } else {
      // Check if name starts with capital letter
      if (!/^[A-Z]/.test(editName)) {
        newErrors.name = 'Name must start with a capital letter';
      }
      
      // Check if name contains spaces, special characters, or numbers
      if (/[\s\W\d]/.test(editName)) {
        newErrors.name = 'Name cannot contain spaces, special characters, or numbers';
      }
    }
    
    if (editOrder < 0) {
      newErrors.order = 'Order must be a positive number';
    } else {
      // Check if order is unique (excluding current section)
      const isDuplicateOrder = existingSections
        .filter(s => s.docId !== section.docId)
        .some(s => s.order === editOrder);
      
      if (isDuplicateOrder) {
        newErrors.order = 'Order must be unique';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveEdit = async () => {
    if (!validateEdit()) {
      return;
    }
    
    try {
      const updates = {
        name: editName,
        order: editOrder
      };
      
      await updateSection(section.docId!, updates);
      onUpdate(section.docId!, updates);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update section:', error);
    }
  };

  return (
    <>
      <div 
        className={`rounded-lg shadow-md p-4 transition-all duration-300 ease-in-out hover:shadow-lg bg-white border border-gray-200 hover:border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-gray-600 ${section.active ? 'border-blue-500 dark:border-blue-400' : ''} relative opacity-0 animate-fade-in-up [animation-fill-mode:forwards] card-hover`}
        style={{ animationDelay: `${animationDelay}ms` }}
      >
        <div className="flex justify-between items-center mb-2">
          <div className="flex-grow">
            <div className="flex items-center">
              <span className="inline-block px-2 py-1 w-10.5 text-xs font-semibold rounded-full mr-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 id-badge">
                ID: {section.id}
              </span>
              
              {isEditing ? (
                <div className="flex-grow">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-3/4 px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 bg-white border-gray-300 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    autoFocus
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                  )}
                </div>
              ) : (
                <h3 className="font-medium text-lg text-gray-900 dark:text-white truncate">
                  {section.name}
                </h3>
              )}
            </div>
          </div>
          
          <div className="flex items-center">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="text-green-500 hover:text-green-700 dark:hover:text-green-400 focus:outline-none transition-all duration-200 mr-2 cursor-pointer hover-scale"
                  aria-label="Save edits"
                >
                  <FiCheck size={18} />
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-400 focus:outline-none transition-all duration-200 mr-2 cursor-pointer hover-scale"
                  aria-label="Cancel edits"
                >
                  <FiX size={18} />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleEdit}
                className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 focus:outline-none transition-all duration-200 mr-2 cursor-pointer hover-scale opacity-70 hover:opacity-100"
                aria-label="Edit section"
              >
                <FiEdit size={18} />
              </button>
            )}
            
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              disabled={isDeleting || isEditing}
              className={`text-red-500 hover:text-red-700 dark:hover:text-red-400 focus:outline-none transition-all duration-200 cursor-pointer hover-scale opacity-70 hover:opacity-100 ${
                isEditing ? 'opacity-30 hover:opacity-30' : ''
              }`}
              aria-label="Delete section"
            >
              <FiTrash2 size={18} className={isDeleting ? 'animate-pulse' : ''} />
            </button>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 gap-2 sm:gap-0">
          <div className="flex items-center">
            {isEditing ? (
              <div>
                <div className="flex items-center">
                  <span className="mr-2 text-sm text-gray-600 dark:text-gray-300">
                    Order:
                  </span>
                  <input
                    type="number"
                    value={editOrder}
                    onChange={(e) => setEditOrder(parseInt(e.target.value) || 0)}
                    className="w-16 px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 bg-white border-gray-300 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    min="0"
                  />
                </div>
                {errors.order && (
                  <p className="mt-1 text-xs text-red-500">{errors.order}</p>
                )}
              </div>
            ) : (
              <span className="mr-2 text-sm text-gray-600 dark:text-gray-300">
                Order: {section.order}
              </span>
            )}
          </div>
          
          <div className="flex items-center">
            <span className="mr-2 text-sm text-gray-600 dark:text-gray-300">
              Active
            </span>
            <label 
              className="relative inline-flex items-center cursor-pointer toggle-hover"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <input
                type="checkbox"
                className="sr-only peer"
                checked={section.active}
                onChange={handleToggleActive}
                disabled={isDeleting || isEditing}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Delete"
      >
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to delete the section "{section.name}"? 
        </p>
        
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => setShowDeleteModal(false)}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-400 hover:via-indigo-500 hover:to-purple-500 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </Modal>
    </>
  );
};

export default SectionCard; 