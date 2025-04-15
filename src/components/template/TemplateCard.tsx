import { Template } from "../../types";
import { FaTrash } from "react-icons/fa";

interface EmptyTemplateStateProps {
  message: string;
  subMessage?: string;
}

export const EmptyTemplateState = ({ message, subMessage }: EmptyTemplateStateProps) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center border border-gray-100 dark:border-gray-700">
    <div className="text-gray-500 dark:text-gray-400">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
      <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">{message}</p>
      {subMessage && <p className="text-sm text-gray-500 dark:text-gray-400">{subMessage}</p>}
    </div>
  </div>
);

interface TemplateCardProps {
  template: Template;
  index: number;
  isUserTemplate?: boolean;
  onDelete?: (template: Template) => void;
  onUseTemplate: (templateId: string) => void;
}

const TemplateCard = ({ template, index, isUserTemplate, onDelete, onUseTemplate }: TemplateCardProps) => (
  <div
    data-aos="fade-up"
    data-aos-delay={100 * index}
    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 group"
  >
    <div className="aspect-video bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
    <div className="p-4">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-900 dark:text-white">{template.name}</h3>
        {isUserTemplate && onDelete && (
          <button
            type="button"
            onClick={() => onDelete(template)}
            className="text-red-500 hover:text-red-600 transition-colors duration-200 cursor-pointer"
          >
            <FaTrash className="h-4 w-4" />
          </button>
        )}
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
        Created: {template.createdAt.toLocaleDateString('en-GB')}
      </p>
      {template.displayName && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">By: {template.displayName}</p>
      )}
      <button
        type="button"
        onClick={() => onUseTemplate(template.id)}
        className="w-full bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-400 hover:via-indigo-500 hover:to-purple-500 text-white py-2 px-4 rounded-lg transition-colors duration-300 cursor-pointer"
      >
        Use Template
      </button>
    </div>
  </div>
);

export default TemplateCard; 