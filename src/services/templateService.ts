import { doc, setDoc, collection, getDocs, query, orderBy, Timestamp, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Collections } from './collections';
import { CanvasDesigns , StoredTemplateDesign, Template} from '../types';



// Save a template
export const saveTemplate = async (userId: string, name: string, canvasDesigns: CanvasDesigns, displayName?: string | null): Promise<void> => {
  try {
    const templateRef = doc(collection(db, Collections.TEMPLATES_COLLECTION));
    
    // Convert designs to minimal format before saving
    const minimalDesigns: { [key: string]: StoredTemplateDesign | null } = {};
    
    Object.entries(canvasDesigns).forEach(([sectionName, design]) => {
      if (design) {
        const templateDesign: StoredTemplateDesign = {
          id: design.id,
          name: design.name,
          active: design.active,
          html: design.html,
          pageSection: {
            id: design.pageSection.id,
            name: design.pageSection.name,
            active: design.pageSection.active,
            order: design.pageSection.order
          }
        };
        
        // Only add docId if it exists
        if (design.docId) {
          templateDesign.docId = design.docId;
        }
        
        minimalDesigns[sectionName] = templateDesign;
      } else {
        minimalDesigns[sectionName] = null;
      }
    });

    const template: Template = {
      id: templateRef.id,
      name,
      canvasDesigns: minimalDesigns,
      createdAt: new Date(),
      userId,
      displayName: displayName || null
    };
    
    // Convert Date to Firestore Timestamp before saving
    await setDoc(templateRef, {
      ...template,
      createdAt: Timestamp.fromDate(template.createdAt)
    });
  } catch (error) {
    console.error('Error saving template:', error);
    throw error;
  }
};

// Get all templates
export const getAllTemplates = async (): Promise<Template[]> => {
  try {
    const templatesCollection = collection(db, Collections.TEMPLATES_COLLECTION);
    const q = query(
      templatesCollection,
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        createdAt: (data.createdAt as Timestamp).toDate(),
        id: doc.id
      } as Template;
    });
  } catch (error) {
    console.error('Error getting templates:', error);
    throw error;
  }
};

// Delete a template
export const deleteTemplate = async (templateId: string): Promise<void> => {
  try {
    const templateRef = doc(db, Collections.TEMPLATES_COLLECTION, templateId);
    await deleteDoc(templateRef);
  } catch (error) {
    console.error('Error deleting template:', error);
    throw error;
  }
}; 