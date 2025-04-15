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
  setDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { Collections, CounterCollections } from './collections';
import { Section } from '../types';

// Get the next ID from a counter document or by checking the collection
const getNextId = async (): Promise<number> => {
  try {
    // First, check if there are any documents in the collection
    const sectionsCollection = collection(db, Collections.SECTIONS_COLLECTION);
    const docsQuery = query(sectionsCollection);
    const snapshot = await getDocs(docsQuery);
    
    // If collection is empty, start from 1
    if (snapshot.empty) {
      console.log("Collection is empty, starting ID from 1");
      
      // Reset the counter to 1
      const counterRef = doc(db, CounterCollections.SECTIONS_COUNTER);
      await setDoc(counterRef, { currentId: 1 }, { merge: true });
      return 1;
    }
    
    // If collection has documents, use the counter
    const counterRef = doc(db, CounterCollections.SECTIONS_COUNTER);
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

// Create a new section
export const createSection = async (sectionData: Omit<Section, 'id' | 'docId'>): Promise<Section> => {
  try {
    // Validate section name
    if (!sectionData.name.trim()) {
      throw new Error('Section name is required');
    }
    
    // Check if name starts with capital letter
    if (!/^[A-Z]/.test(sectionData.name)) {
      throw new Error('Section name must start with a capital letter');
    }
    
    // Check if name contains spaces, special characters, or numbers
    if (/[\s\W\d]/.test(sectionData.name)) {
      throw new Error('Section name cannot contain spaces, special characters, or numbers');
    }
    
    // Check if order is unique
    const existingSections = await getSections();
    const isDuplicateOrder = existingSections.some(section => section.order === sectionData.order);
    if (isDuplicateOrder) {
      throw new Error('Section order must be unique');
    }
    
    // Get the next ID
    const nextId = await getNextId();
    
    // Add the new section with the auto-incremented id
    const sectionsCollection = collection(db, Collections.SECTIONS_COLLECTION);
    const docRef = await addDoc(sectionsCollection, {
      ...sectionData,
      id: nextId
    });
    
    console.log(`Created section with ID: ${nextId}`);
    
    return {
      ...sectionData,
      id: nextId,
      docId: docRef.id
    };
  } catch (error) {
    console.error("Error creating section:", error);
    throw error;
  }
};

// Get all sections
export const getSections = async (): Promise<Section[]> => {
  try {
    const sectionsCollection = collection(db, Collections.SECTIONS_COLLECTION);
    const q = query(
      sectionsCollection, 
      orderBy('id', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    
    const sections = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: Number(data.id), // Convert to number
        name: data.name,
        active: data.active,
        order: data.order,
        docId: doc.id
      };
    });
    
    console.log("Retrieved sections:", sections);
    return sections;
  } catch (error) {
    console.error("Error getting sections:", error);
    throw error;
  }
};

// Update a section
export const updateSection = async (docId: string, sectionData: Partial<Omit<Section, 'id' | 'docId'>>): Promise<void> => {
  try {
    // Validate section name if provided
    if (sectionData.name !== undefined) {
      if (!sectionData.name.trim()) {
        throw new Error('Section name is required');
      }
      
      // Check if name starts with capital letter
      if (!/^[A-Z]/.test(sectionData.name)) {
        throw new Error('Section name must start with a capital letter');
      }
      
      // Check if name contains spaces, special characters, or numbers
      if (/[\s\W\d]/.test(sectionData.name)) {
        throw new Error('Section name cannot contain spaces, special characters, or numbers');
      }
    }
    
    // Check if order is unique if provided
    if (sectionData.order !== undefined) {
      const existingSections = await getSections();
      const isDuplicateOrder = existingSections
        .filter(section => section.docId !== docId) // Exclude current section
        .some(section => section.order === sectionData.order);
      
      if (isDuplicateOrder) {
        throw new Error('Section order must be unique');
      }
    }
    
    const sectionRef = doc(db, Collections.SECTIONS_COLLECTION, docId);
    await updateDoc(sectionRef, sectionData);
  } catch (error) {
    console.error("Error updating section:", error);
    throw error;
  }
};

// Delete a section
export const deleteSection = async (docId: string): Promise<void> => {
  try {
    const sectionRef = doc(db, Collections.SECTIONS_COLLECTION, docId);
    await deleteDoc(sectionRef);
  } catch (error) {
    console.error("Error deleting section:", error);
    throw error;
  }
}; 