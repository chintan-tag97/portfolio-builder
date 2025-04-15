import React, { ReactNode, createContext, use, useEffect, useMemo, useState } from 'react';
import { createSection, deleteSection, getSections, updateSection } from '../services/sectionService';
import { Section } from '../types';

interface SectionContextType {
  sections: Section[];
  isLoading: boolean;
  error: string | null;
  refreshSections: () => Promise<void>;
  addSection: (sectionData: Omit<Section, 'id' | 'docId'>) => Promise<Section>;
  updateSectionById: (docId: string, data: Partial<Omit<Section, 'id' | 'docId'>>) => Promise<void>;
  deleteSectionById: (docId: string) => Promise<void>;
}

const SectionContext = createContext<SectionContextType | undefined>(undefined);

export const useSections = () => {
  const context = use(SectionContext);
  if (context === undefined) {
    throw new Error('useSections must be used within a SectionProvider');
  }
  return context;
};

interface SectionProviderProps {
  children: ReactNode;
}

export const SectionProvider: React.FC<SectionProviderProps> = ({ children }) => {
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSections = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedSections = await getSections();
      setSections(fetchedSections);
    } catch (err) {
      console.error('Failed to fetch sections:', err);
      setError('Failed to load sections. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const refreshSections = async () => {
    await fetchSections();
  };

  const addSection = async (sectionData: Omit<Section, 'id' | 'docId'>) => {
    try {
      const newSection = await createSection(sectionData);
      setSections(prevSections => [...prevSections, newSection]);
      return newSection;
    } catch (err) {
      console.error('Failed to create section:', err);
      setError('Failed to create section. Please try again.');
      throw err;
    }
  };

  const updateSectionById = async (docId: string, data: Partial<Omit<Section, 'id' | 'docId'>>) => {
    try {
      await updateSection(docId, data);
      setSections(prevSections => 
        prevSections.map(section => 
          section.docId === docId ? { ...section, ...data } : section
        )
      );
    } catch (err) {
      console.error('Failed to update section:', err);
      setError('Failed to update section. Please try again.');
      throw err;
    }
  };

  const deleteSectionById = async (docId: string) => {
    try {
      await deleteSection(docId);
      setSections(prevSections => prevSections.filter(section => section.docId !== docId));
    } catch (err) {
      console.error('Failed to delete section:', err);
      setError('Failed to delete section. Please try again.');
      throw err;
    }
  };

  const value = useMemo(() => ({
    sections,
    isLoading,
    error,
    refreshSections,
    addSection,
    updateSectionById,
    deleteSectionById
  }), [sections, isLoading, error, refreshSections]);

  return (
    <SectionContext value={value}>
      {children}
    </SectionContext>
  );
};






