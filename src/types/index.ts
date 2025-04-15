export interface User {
  id: string;
  email: string;
  displayName?: string | null;
  photoURL?: string | null;
  createdAt: Date;
} 
export interface Section {
  id: number;
  name: string;
  active: boolean;
  order: number;
  docId?: string; // Firebase document ID (optional, for internal use)
}

export interface Design {
  id: number;
  name: string;
  active: boolean;
  html: string;
  pageSection: Section;
  docId?: string; // Firebase document ID (optional, for internal use)
}

export interface CanvasDesigns {
  [key: string]: Design | null;
}

export interface StoredDesign {
  id: number;
  docId?: string;
  name: string;
  active: boolean;
  html: string;
}

export interface CanvasData {
  userId: string;
  sections: {
    [sectionName: string]: StoredDesign | null;
  };
}

export interface StoredTemplateDesign {
  id: number;
  name: string;
  active: boolean;
  html: string;
  pageSection: {
    id: number;
    name: string;
    active: boolean;
    order: number;
  };
  docId?: string;
}

export interface Template {
  id: string;
  name: string;
  canvasDesigns: { [key: string]: StoredTemplateDesign | null };
  createdAt: Date;
  userId: string;
  displayName: string | null;
}

export interface ColorPalette {
  name: string;
  values: string[];
}


export interface DesignEditorProps {
  name: string;
  setName: (name: string) => void;
  html: string;
  setHtml: (html: string) => void;
  sectionId: number | undefined;
  setSectionId: (sectionId: number | undefined) => void;
  active: boolean;
  setActive: (active: boolean) => void;
  sections: Section[];
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isSubmitting: boolean;
  submitButtonText: string;
  onCancel: () => void;
  onBackToEditor: () => void;
  fieldErrors: {
    name: string;
    html: string;
    section: string;
  };
  showForm: boolean;
  setShowForm: (show: boolean) => void;
}