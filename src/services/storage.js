import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';

/**
 * Upload a file to Firebase Storage
 * @param {File} file - The file to upload
 * @param {string} path - The path where the file should be stored
 * @param {Function} onProgress - Callback function to track upload progress
 * @returns {Promise<string>} - The download URL of the uploaded file
 */
export const uploadFile = async (file, path, onProgress = () => {}) => {
  try {
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          onProgress(progress);
        },
        (error) => {
          console.error('Upload failed:', error);
          reject(error);
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadUrl);
          } catch (error) {
            console.error('Failed to get download URL:', error);
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    console.error('Error in upload process:', error);
    throw error;
  }
};

/**
 * Get the public URL for a file in Firebase Storage
 * @param {string} path - The path to the file in storage
 * @returns {Promise<string>} - The download URL
 */
export const getFileUrl = async (path) => {
  try {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Error getting file URL:', error);
    throw error;
  }
};
