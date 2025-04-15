import React, { createContext, ReactNode, use, useEffect, useMemo, useState } from 'react';
import { createDesign, deleteDesign, getDesigns, updateDesign } from '../services/designService';
import { Design } from '../types';

interface DesignContextType {
  designs: Design[];
  isLoading: boolean;
  error: string | null;
  refreshDesigns: () => Promise<void>;
  addDesign: (designData: Omit<Design, 'id' | 'docId'>) => Promise<Design>;
  updateDesignById: (docId: string, data: Partial<Omit<Design, 'id' | 'docId'>>) => Promise<void>;
  deleteDesignById: (docId: string) => Promise<void>;
  getDesignsBySectionId: (sectionId: number) => Design[];
}

const DesignContext = createContext<DesignContextType | undefined>(undefined);

export const useDesigns = () => {
  const context = use(DesignContext);
  if (context === undefined) {
    throw new Error('useDesigns must be used within a DesignProvider');
  }
  return context;
};

interface DesignProviderProps {
  children: ReactNode;
}

export const DesignProvider: React.FC<DesignProviderProps> = ({ children }) => {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDesigns = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedDesigns = await getDesigns();
      setDesigns(fetchedDesigns);
    } catch (err) {
      console.error('Failed to fetch designs:', err);
      setError('Failed to load designs. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDesigns();
  }, []);

  const refreshDesigns = async () => {
    await fetchDesigns();
  };

  const addDesign = async (designData: Omit<Design, 'id' | 'docId'>) => {
    try {
      const newDesign = await createDesign(designData);
      setDesigns(prevDesigns => [...prevDesigns, newDesign]);
      return newDesign;
    } catch (err) {
      console.error('Failed to create design:', err);
      setError('Failed to create design. Please try again.');
      throw err;
    }
  };

  const updateDesignById = async (docId: string, data: Partial<Omit<Design, 'id' | 'docId'>>) => {
    try {
      await updateDesign(docId, data);
      setDesigns(prevDesigns => 
        prevDesigns.map(design => 
          design.docId === docId ? { ...design, ...data } : design
        )
      );
    } catch (err) {
      console.error('Failed to update design:', err);
      setError('Failed to update design. Please try again.');
      throw err;
    }
  };

  const deleteDesignById = async (docId: string) => {
    try {
      await deleteDesign(docId);
      setDesigns(prevDesigns => prevDesigns.filter(design => design.docId !== docId));
    } catch (err) {
      console.error('Failed to delete design:', err);
      setError('Failed to delete design. Please try again.');
      throw err;
    }
  };

  const getDesignsBySectionId = (sectionId: number): Design[] => {
    return designs.filter(design => design.pageSection.id === sectionId);
  };

  const value = useMemo(() => ({
    designs,
    isLoading,
    error,
    refreshDesigns,
    addDesign,
    updateDesignById,
    deleteDesignById,
    getDesignsBySectionId
  }), [designs, isLoading, error]);

  return (
    <DesignContext.Provider value={value}>
      {children}
    </DesignContext.Provider>
  );
}; 