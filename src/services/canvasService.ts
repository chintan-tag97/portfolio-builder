import { doc, setDoc, getDoc} from 'firebase/firestore';
import { db } from './firebase';
import { Design, StoredDesign, CanvasData, CanvasDesigns } from '../types';
import { Collections } from './collections';

// Save canvas designs for a user - only storing essential info
export const saveCanvasDesigns = async (userId: string, canvasDesigns: CanvasDesigns): Promise<void> => {
  try {
    // Convert designs to minimal format before saving
    const minimalDesigns: { [key: string]: StoredDesign | null } = {};
    
    Object.entries(canvasDesigns).forEach(([sectionName, design]) => {
      minimalDesigns[sectionName] = design ? {
        id: design.id,
        docId: design.docId,
        name: design.name,
        active: design.active,
        html: design.html
      } : null;
    });

    const canvasRef = doc(db, Collections.CANVAS_DESIGNS_COLLECTION, userId);
    await setDoc(canvasRef, {
      userId,
      sections: minimalDesigns,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error saving canvas designs:', error);
    throw error;
  }
};

// Get canvas designs for a user
export const getCanvasDesigns = async (userId: string, designs: Design[]): Promise<CanvasDesigns | null> => {
  try {
    const canvasRef = doc(db, Collections.CANVAS_DESIGNS_COLLECTION, userId);
    const canvasSnap = await getDoc(canvasRef);
    
    if (canvasSnap.exists()) {
      const data = canvasSnap.data() as CanvasData;
      
      // Convert minimal format back to full designs
      const fullDesigns: CanvasDesigns = {};
      
      Object.entries(data.sections).forEach(([sectionName, storedDesign]) => {
        if (!storedDesign) {
          fullDesigns[sectionName] = null;
          return;
        }

        // Find the full design from the designs array
        const fullDesign = designs.find(d => 
          (storedDesign.docId && d.docId === storedDesign.docId) || 
          d.id === storedDesign.id
        );
        
        if (!fullDesign) {
          console.warn(`Design not found: ${storedDesign.id}`);
          fullDesigns[sectionName] = null;
          return;
        }

       
        
        const design: Design = {
          ...fullDesign,
          name: storedDesign.name,
          active: storedDesign.active,
          html: storedDesign.html || fullDesign.html
        };
        if (storedDesign.docId) {
          design.docId = storedDesign.docId;
        }
        fullDesigns[sectionName] = design;

      });
      
      return fullDesigns;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting canvas designs:', error);
    throw error;
  }
}; 