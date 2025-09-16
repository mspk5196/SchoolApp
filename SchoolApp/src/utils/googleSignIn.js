import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';

export class GoogleSignInService {
  /**
   * Check if Google Sign-In is properly configured
   */
  static async checkConfiguration() {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      return true;
    } catch (error) {
      console.error('Google Play Services not available:', error);
      throw new Error('Google Play Services not available');
    }
  }

  /**
   * Sign in with Google
   * @returns {Promise<Object>} User data and Firebase ID token
   */
  static async signInWithGoogle() {
    try {
      // First check if Google Sign-In is properly configured
      await this.checkConfiguration();
      
      // Get the users ID token
      const { idToken, user } = await GoogleSignin.signIn();
      
      if (!idToken) {
        throw new Error('No ID token received from Google');
      }
      
      // Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      
      // Sign-in the user with the credential
      const userCredential = await auth().signInWithCredential(googleCredential);
      
      // Get the Firebase ID token for backend verification
      const firebaseIdToken = await userCredential.user.getIdToken();
      
      return {
        user: userCredential.user,
        idToken: firebaseIdToken,
        googleUser: user,
      };
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      
      // Provide more specific error messages
      if (error.code === 'sign_in_cancelled') {
        throw new Error('Sign-in was cancelled');
      } else if (error.code === 'sign_in_required') {
        throw new Error('Sign-in is required');
      } else if (error.message?.includes('apiClient is null')) {
        throw new Error('Google Sign-In not properly configured. Please check your setup.');
      } else {
        throw error;
      }
    }
  }

  /**
   * Sign out from Google and Firebase
   */
  static async signOut() {
    try {
      await GoogleSignin.signOut();
      await auth().signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  /**
   * Check if user is currently signed in
   */
  static async getCurrentUser() {
    try {
      const currentUser = auth().currentUser;
      return currentUser;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }
}