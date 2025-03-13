import { db } from '../firebase/config';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  deleteDoc, 
  doc,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';

// Save analyzed video to collection
export const saveVideoToCollection = async (userId, videoData) => {
  try {
    // Ensure consistent data structure
    const savedVideo = {
      ...videoData,
      userId,
      savedAt: serverTimestamp() // Use serverTimestamp for consistency
    };
    
    const docRef = await addDoc(collection(db, 'savedVideos'), savedVideo);
    return docRef.id;
  } catch (error) {
    console.error('Error saving video:', error);
    throw error;
  }
};

// Get user's video collection
export const getUserVideos = async (userId, sortBy = 'savedAt', sortOrder = 'desc') => {
  try {
    const videosRef = collection(db, 'savedVideos');
    
    // Simplified query without sorting - just filter by userId
    const q = query(videosRef, where('userId', '==', userId));
    
    const querySnapshot = await getDocs(q);
    let videos = [];
    
    querySnapshot.forEach((doc) => {
      videos.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Sort in memory instead of in the query
    videos.sort((a, b) => {
      if (sortBy === 'title') {
        // Sort by title
        return sortOrder === 'asc' 
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      } else {
        // Sort by date
        const dateA = a.savedAt?.toDate ? a.savedAt.toDate() : new Date(a.savedAt || 0);
        const dateB = b.savedAt?.toDate ? b.savedAt.toDate() : new Date(b.savedAt || 0);
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }
    });
    
    return videos;
  } catch (error) {
    console.error('Error fetching videos:', error);
    throw error;
  }
};

// Delete video from collection
export const deleteVideo = async (videoId) => {
  try {
    await deleteDoc(doc(db, 'savedVideos', videoId));
    return true;
  } catch (error) {
    console.error('Error deleting video:', error);
    throw error;
  }
}; 