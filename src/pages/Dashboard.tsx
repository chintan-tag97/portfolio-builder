import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAllTemplates, deleteTemplate } from "../services/templateService";
import { Template } from "../types";
import { FaLayerGroup, FaArrowRight, FaUsers } from "react-icons/fa";
import Loading from "../components/Loading";
import TemplateCard, { EmptyTemplateState } from "../components/template/TemplateCard";
import Modal from "../components/Modal";
import AOS from 'aos';

const Dashboard = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null);

  useEffect(() => {
    // Initialize AOS
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out-cubic'
    });
  }, []);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      navigate("/login");
    }
  }, [currentUser, authLoading, navigate]);

  useEffect(() => {
    const loadTemplates = async () => {
      if (authLoading) return;
      
      try {
        setTemplatesLoading(true);
        const allTemplates = await getAllTemplates();
        setTemplates(allTemplates);
      } catch (error) {
        console.error("Error loading templates:", error);
      } finally {
        setTemplatesLoading(false);
      }
    };

    if (currentUser) {
      loadTemplates();
    }
  }, [currentUser, authLoading]);

  // Show loading when either authentication or templates are loading
  if (authLoading || templatesLoading) {
    return <Loading />;
  }

  // Add this function to check if user has any templates
  const getUserTemplates = () => {
    return templates.filter((template) => template.userId === currentUser?.id);
  };

  const handleDeleteClick = (template: Template) => {
    setTemplateToDelete(template);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!templateToDelete) return;
    
    try {
      await deleteTemplate(templateToDelete.id);
      setTemplates(templates.filter(t => t.id !== templateToDelete.id));
      setDeleteModalOpen(false);
      setTemplateToDelete(null);
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Failed to delete template. Please try again.');
    }
  };

  const handleUseTemplate = (templateId: string) => {
    navigate(`/builder?template=${templateId}`);
  };

  return (
    <div className="min-h-[100dvh] bg-gray-50 dark:bg-gray-900 pt-16 pb-8">
      <div className="max-container mx-auto padding-x">
        {/* Integrated Banner */}
        <div className="relative mb-12">
          {/* Animated shapes with more subtle colors */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-purple-100/50 dark:bg-purple-900/10 rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
          <div
            className="absolute bottom-0 right-0 w-40 h-40 bg-indigo-100/50 dark:bg-indigo-900/10 rounded-full translate-x-1/4 translate-y-1/4 animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute top-1/2 right-1/4 w-24 h-24 bg-pink-100/50 dark:bg-pink-900/10 rounded-full animate-ping opacity-40"
            style={{ animationDuration: "3s" }}
          ></div>

          <div className="relative flex flex-col lg:flex-row items-center gap-8 z-10 py-8">
            {/* Banner Content */}
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Welcome{currentUser?.displayName ? `, ${currentUser.displayName}` : ""}!
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                Create beautiful portfolios in minutes. Start from scratch or
                use a template.
              </p>
              <button
                type="button"
                onClick={() => navigate("/builder?new=true")}
                className="inline-flex items-center gap-2 bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-400 hover:via-indigo-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 cursor-pointer"
              >
                Create New Portfolio
                <FaArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Animated illustration */}
            <div className="w-full lg:w-auto flex-shrink-0">
              <div className="relative w-64 h-64 mx-auto">
                {/* Simple animated portfolio illustration */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-40 h-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 animate-float">
                    <div className="w-full h-4 bg-purple-400 dark:bg-purple-600 rounded mb-3"></div>
                    <div className="w-3/4 h-2 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                    <div className="w-1/2 h-2 bg-gray-200 dark:bg-gray-600 rounded mb-4"></div>
                    <div className="w-full h-20 bg-indigo-100 dark:bg-indigo-900/50 rounded mb-3"></div>
                    <div className="w-full h-8 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                    <div className="w-full h-8 bg-gray-200 dark:bg-gray-600 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Your Templates Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FaLayerGroup className="text-indigo-500" />
              Your Templates
            </h2>
          </div>
          
          {getUserTemplates().length === 0 ? (
            <EmptyTemplateState 
              message="No Templates Found" 
              subMessage="Start creating your portfolio templates" 
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {getUserTemplates().map((template, index) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  index={index}
                  isUserTemplate={true}
                  onDelete={handleDeleteClick}
                  onUseTemplate={handleUseTemplate}
                />
              ))}
            </div>
          )}
        </div>

        {/* Other Templates Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FaUsers className="text-indigo-500" />
              Other Templates
            </h2>
          </div>

          {templates.filter((template) => template.userId !== currentUser?.id).length === 0 ? (
            <EmptyTemplateState message="No Other Templates Found" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {templates
                .filter((template) => template.userId !== currentUser?.id)
                .map((template, index) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    index={index}
                    onUseTemplate={handleUseTemplate}
                  />
                ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setTemplateToDelete(null);
        }}
        title="Confirm Delete"
      >
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to delete the template "{templateToDelete?.name}"? 
        </p>
        
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => {
              setDeleteModalOpen(false);
              setTemplateToDelete(null);
            }}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDeleteConfirm}
            className="px-4 py-2 bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-400 hover:via-indigo-500 hover:to-purple-500 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;
