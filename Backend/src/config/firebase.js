const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// Note: In production, use environment variables for the service account key
// For now, we'll initialize without credentials and use the default project
try {
  admin.initializeApp({
    // credential: admin.credential.applicationDefault(), // Use this in production with proper service account
    // For development, you can initialize without credentials if using Firebase emulator
    // or add your service account key file path here
  });
  console.log('Firebase Admin initialized successfully');
} catch (error) {
  console.error('Firebase Admin initialization error:', error);
}

/**
 * Verify Firebase ID token
 * @param {string} idToken - Firebase ID token from client
 * @returns {Promise<Object>} Decoded token data
 */
async function verifyFirebaseToken(idToken) {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    throw new Error('Invalid Firebase token');
  }
}

module.exports = {
  admin,
  verifyFirebaseToken,
};