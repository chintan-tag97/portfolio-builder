import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  orderBy,
  getDoc,
  setDoc,
  where
} from 'firebase/firestore';
import { db } from './firebase';
import { Collections, CounterCollections } from './collections';
import { Design } from '../types';

// Get the next ID from a counter document or by checking the collection
const getNextId = async (): Promise<number> => {
  try {
    // First, check if there are any documents in the collection
    const designsCollection = collection(db, Collections.DESIGNS_COLLECTION);
    const docsQuery = query(designsCollection);
    const snapshot = await getDocs(docsQuery);
    
    // If collection is empty, start from 1
    if (snapshot.empty) {
      console.log("Collection is empty, starting ID from 1");
      
      // Reset the counter to 1
      const counterRef = doc(db, CounterCollections.DESIGNS_COUNTER);
      await setDoc(counterRef, { currentId: 1 }, { merge: true });
      return 1;
    }
    
    // If collection has documents, use the counter
    const counterRef = doc(db, CounterCollections.DESIGNS_COUNTER);
    const counterSnap = await getDoc(counterRef);
    
    let nextId = 1; // Default to 1
    
    if (counterSnap.exists()) {
      // Get current counter value
      const data = counterSnap.data();
      nextId = (data.currentId || 0) + 1;
    }
    
    // Update the counter with the new value
    await setDoc(counterRef, { currentId: nextId }, { merge: true });
    
    console.log(`Next ID will be: ${nextId}`);
    return nextId;
  } catch (error) {
    console.error("Error getting next ID:", error);
    throw error;
  }
};

// Create a new design
export const createDesign = async (designData: Omit<Design, 'id' | 'docId'>): Promise<Design> => {
  try {
    // Validate design name
    if (!designData.name.trim()) {
      throw new Error('Design name is required');
    }
    
    // Validate HTML content
    if (!designData.html.trim()) {
      throw new Error('HTML content is required');
    }
    
    // Validate page section
    if (!designData.pageSection || !designData.pageSection.id) {
      throw new Error('Page section is required');
    }
    
    // Get the next ID
    const nextId = await getNextId();
    
    // Add the new design with the auto-incremented id
    const designsCollection = collection(db, Collections.DESIGNS_COLLECTION);
    const docRef = await addDoc(designsCollection, {
      ...designData,
      id: nextId
    });
    
    console.log(`Created design with ID: ${nextId}`);
    
    return {
      ...designData,
      id: nextId,
      docId: docRef.id
    };
  } catch (error) {
    console.error("Error creating design:", error);
    throw error;
  }
};

// Get all designs
export const getDesigns = async (): Promise<Design[]> => {
  try {
    const designsCollection = collection(db, Collections.DESIGNS_COLLECTION);
    const q = query(
      designsCollection, 
      orderBy('id', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    
    const designs = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: Number(data.id),
        name: data.name,
        active: data.active,
        html: data.html,
        pageSection: data.pageSection,
        docId: doc.id
      };
    });
    
    console.log("Retrieved designs:", designs);
    return designs;
  } catch (error) {
    console.error("Error getting designs:", error);
    throw error;
  }
};

// Get designs by section
export const getDesignsBySection = async (sectionId: number): Promise<Design[]> => {
  try {
    const designsCollection = collection(db, Collections.DESIGNS_COLLECTION);
    const q = query(
      designsCollection,
      where('pageSection.id', '==', sectionId),
      orderBy('id', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    
    const designs = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: Number(data.id),
        name: data.name,
        active: data.active,
        html: data.html,
        pageSection: data.pageSection,
        docId: doc.id
      };
    });
    
    console.log(`Retrieved designs for section ${sectionId}:`, designs);
    return designs;
  } catch (error) {
    console.error(`Error getting designs for section ${sectionId}:`, error);
    throw error;
  }
};

// Update a design
export const updateDesign = async (docId: string, designData: Partial<Omit<Design, 'id' | 'docId'>>): Promise<void> => {
  try {
    // Validate design name if provided
    if (designData.name !== undefined && !designData.name.trim()) {
      throw new Error('Design name is required');
    }
    
    // Validate HTML content if provided
    if (designData.html !== undefined && !designData.html.trim()) {
      throw new Error('HTML content is required');
    }
    
    // Validate page section if provided
    if (designData.pageSection !== undefined && (!designData.pageSection || !designData.pageSection.id)) {
      throw new Error('Page section is required');
    }
    
    const designRef = doc(db, Collections.DESIGNS_COLLECTION, docId);
    await updateDoc(designRef, designData);
  } catch (error) {
    console.error("Error updating design:", error);
    throw error;
  }
};

// Delete a design
export const deleteDesign = async (docId: string): Promise<void> => {
  try {
    const designRef = doc(db, Collections.DESIGNS_COLLECTION, docId);
    await deleteDoc(designRef);
  } catch (error) {
    console.error("Error deleting design:", error);
    throw error;
  }
}; 