import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { emmetHTML, emmetCSS } from "emmet-monaco-es";
import { DesignEditorProps } from "../../types";
import { useTheme } from "../../context/ThemeContext";
import { useScrollPosition } from "../../hooks/useScrollPosition";
import Modal from "../Modal";
import { FiArrowLeft, FiChevronRight, FiChevronLeft } from "react-icons/fi";
import {
  PanelGroup,
  Panel,
  PanelResizeHandle,
  ImperativePanelHandle,
} from "react-resizable-panels";

// Extend Window interface to include monaco
declare global {
  interface Window {
    monaco: typeof monaco;
  }
}

// Custom resize handle component
const ResizeHandle = React.memo(() => (
  <PanelResizeHandle className="w-0.5 hover:bg-indigo-400 bg-gray-300 dark:bg-gray-600 transition-colors duration-150 cursor-col-resize flex items-center justify-center">
    <div className="w-0 h-8 rounded-full bg-gray-400 dark:bg-gray-500"></div>
  </PanelResizeHandle>
));

const DesignEditor: React.FC<DesignEditorProps> = ({
  name,
  setName,
  html,
  setHtml,
  sectionId,
  setSectionId,
  active,
  setActive,
  sections,
  onSubmit,
  isSubmitting,
  submitButtonText,
  onCancel,
  onBackToEditor,
  fieldErrors,
  showForm,
  setShowForm,
}) => {
  // const [isEditorReady, setIsEditorReady] = useState(false);
  const [isEditorCollapsed, setIsEditorCollapsed] = useState(false);
  const [isPreviewCollapsed, setIsPreviewCollapsed] = useState(false);
  const editorPanelRef = useRef<ImperativePanelHandle>(null);
  const previewPanelRef = useRef<ImperativePanelHandle>(null);
  const editorRef = useRef<any>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { theme, toggleTheme } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(theme === "dark");

  // Track scroll position for the preview panel
  const previewScrollPosition = useScrollPosition(
    previewRef as React.RefObject<HTMLElement>
  );

  // Log scroll positions (optional, for debugging)
  useEffect(() => {
    console.log("Preview scroll position:", previewScrollPosition);
  }, [previewScrollPosition]);

  useEffect(() => {
    if (theme === "dark") {
      setIsDarkMode(true);
    } else {
      setIsDarkMode(false);
    }
  }, [theme, toggleTheme]);

  const editorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
    minimap: { enabled: false },
    fontSize: 14,
    fontFamily: "font-mono",
    wordWrap: "on",
    automaticLayout: true,
    scrollBeyondLastLine: false,
    lineNumbers: "on",
    renderWhitespace: "selection",
    tabSize: 2,
    formatOnPaste: true,
    formatOnType: true,
    quickSuggestions: {
      other: true,
      comments: true,
      strings: true,
    },
    suggestOnTriggerCharacters: true,
    acceptSuggestionOnEnter: "on",
    tabCompletion: "on",
    snippetSuggestions: "top",
    wordBasedSuggestions: "matchingDocuments",
    parameterHints: {
      enabled: true,
    },
    bracketPairColorization: {
      enabled: true,
    },
    guides: {
      indentation: true,
      bracketPairs: true,
    },
  };

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    emmetHTML(window.monaco);
    emmetCSS(window.monaco);
    // setIsEditorReady(true);

    // Set up scroll tracking for the editor
    const editorDom = editor.getDomNode();
    if (editorDom) {
      editorDom.addEventListener(
        "scroll",
        () => {
          console.log("Editor scroll position:", {
            x: editorDom.scrollLeft,
            y: editorDom.scrollTop,
          });
        },
        { passive: true }
      );
    }
  };

  // Toggle functions for the panels
  const maximizeEditor = () => {
    if (editorPanelRef.current && previewPanelRef.current) {
      editorPanelRef.current.resize(100);
      previewPanelRef.current.resize(0);
      setIsEditorCollapsed(false);
      setIsPreviewCollapsed(true);
    }
  };
  const [isPreviewMaximized, setIsPreviewMaximized] = useState(false);
  const [isEditorMaximized, setIsEditorMaximized] = useState(false);

  const handleTogglePreview = () => {
    if (isPreviewMaximized) {
      resetPanels(); // Restore both panels
    } else {
      maximizePreview(); // Maximize preview
    }
    setIsPreviewMaximized(!isPreviewMaximized);
  };

  const handleToggleEditor = () => {
    if (isEditorMaximized) {
      resetPanels(); // Restore both panels
    } else {
      maximizeEditor(); // Maximize Editor
    }
    setIsEditorMaximized(!isEditorMaximized);
  };

  const maximizePreview = () => {
    if (editorPanelRef.current && previewPanelRef.current) {
      editorPanelRef.current.resize(0);
      previewPanelRef.current.resize(100);
      setIsEditorCollapsed(true);
      setIsPreviewCollapsed(false);
    }
  };

  const resetPanels = () => {
    if (editorPanelRef.current && previewPanelRef.current) {
      editorPanelRef.current.resize(50);
      previewPanelRef.current.resize(50);
      setIsEditorCollapsed(false);
      setIsPreviewCollapsed(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg ">
      {!showForm ? (
        <div>
          <div className="flex justify-between items-center mb-4">
            <button type="button" onClick={() => navigate("/designs")}>
              <FiArrowLeft className="mr-2 text-2xl cursor-pointer" />
            </button>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Edit HTML Content
            </h2>
          </div>

          <div className="h-[500px] border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
            <PanelGroup direction="horizontal" className="h-full">
              {/* Editor Panel */}
              <Panel
                ref={editorPanelRef}
                defaultSize={50}
                minSize={10}
                collapsible={true}
                onCollapse={() => setIsEditorCollapsed(true)}
                onExpand={() => setIsEditorCollapsed(false)}
                className="transition-all duration-300"
              >
                <div className="h-full relative overflow-auto">
                  <div className="absolute top-3 left-3 z-10">
                    {isEditorMaximized ? (
                      <button
                        type="button"
                        onClick={handleToggleEditor}
                        className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 shadow-sm hover:shadow-md"
                        title="Restore Editor"
                      >
                        <FiChevronLeft size={18} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleToggleEditor}
                        className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 shadow-sm hover:shadow-md"
                        title="Maximize Editor"
                      >
                        <FiChevronRight size={18} />
                      </button>
                    )}
                  </div>

                  <Editor
                    height="100%"
                    defaultLanguage="html"
                    value={html}
                    onChange={(value) => setHtml(value || "")}
                    theme={isDarkMode ? "vs-dark" : "light"}
                    options={editorOptions}
                    onMount={handleEditorDidMount}
                  />
                </div>
              </Panel>
              <ResizeHandle />

              {/* Collapsed Editor State */}
              {isEditorCollapsed && (
                <div
                  className="w-[5%] flex items-center justify-center h-full bg-white dark:bg-gray-800 border-r border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
                  onClick={resetPanels}
                  role="button"
                  tabIndex={0}
                >
                  <div className="transform -rotate-90 text-gray-500 dark:text-gray-400 whitespace-nowrap font-medium flex items-center gap-2">
                    Editor
                  </div>
                </div>
              )}

              {/* Preview Panel */}

              <Panel
                ref={previewPanelRef}
                defaultSize={50}
                minSize={4}
                collapsible={true}
                onCollapse={() => setIsPreviewCollapsed(true)}
                onExpand={() => setIsPreviewCollapsed(false)}
                className="transition-all duration-300"
              >
                <div
                  ref={previewRef}
                  className="h-full relative p-4 bg-white dark:bg-gray-700 overflow-auto"
                >
                  <div className="h-full relative p-4 bg-white dark:bg-gray-700 overflow-auto">
                    {/* Button at a Fixed Position */}
                    <div className="absolute top-3 left-3 z-10">
                      {isPreviewMaximized ? (
                        <button
                          type="button"
                          onClick={handleTogglePreview}
                          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 shadow-sm hover:shadow-md"
                          title="Restore Editor"
                        >
                          <FiChevronRight size={18} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleTogglePreview}
                          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 shadow-sm hover:shadow-md"
                          title="Maximize Preview"
                        >
                          <FiChevronLeft size={18} />
                        </button>
                      )}
                    </div>

                    <div
                      className="preview-content"
                      dangerouslySetInnerHTML={{ __html: html }}
                    />
                  </div>

                </div>
              </Panel>

              {/* Collapsed Preview State */}
              {isPreviewCollapsed && (
                <div
                  className="w-[5%] flex items-center justify-center h-full bg-white dark:bg-gray-700 border-l border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200 cursor-pointer"
                  onClick={resetPanels}
                  role="button"
                  tabIndex={0}
                >
                  <div className="transform -rotate-90 text-gray-500 dark:text-gray-400 whitespace-nowrap font-medium flex items-center gap-2">
                    Preview
                  </div>
                </div>
              )}
            </PanelGroup>
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              disabled={!html.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Continue to Save
            </button>
          </div>
        </div>
      ) : (
        <Modal
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
          }}
          title="Save as Template"
        >
          <form onSubmit={onSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Design Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-3 py-2 border bg-gray-50 text-gray-900 ${
                  fieldErrors.name
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white`}
                placeholder="Enter design name"
              />
              {fieldErrors.name && (
                <p className="mt-1 text-red-500 text-sm">{fieldErrors.name}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Section
              </label>
              <select
                value={sectionId || ""}
                onChange={(e) =>
                  setSectionId(
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                className={`w-full px-3 py-2 border bg-gray-50 text-gray-900 ${
                  fieldErrors.section
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white`}
              >
                <option value="">Select a section</option>
                {sections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.name}
                  </option>
                ))}
              </select>
              {fieldErrors.section && (
                <p className="mt-1 text-red-500 text-sm">
                  {fieldErrors.section}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="flex items-center text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="mr-2"
                />
                Active
              </label>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={onBackToEditor}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 cursor-pointer"
              >
                Back to Editor
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? "Saving..." : submitButtonText}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default DesignEditor;
