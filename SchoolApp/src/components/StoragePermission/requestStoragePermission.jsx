import { PermissionsAndroid, Platform } from 'react-native';

export async function requestStoragePermission() {
  try {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
        // Android 13+
        const readGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
        );

        return readGranted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        // Android 12 or below
        const writeGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
        );

        return writeGranted === PermissionsAndroid.RESULTS.GRANTED;
      }
    } else {
      // iOS or web, permission granted by default
      return true;
    }
  } catch (err) {
    console.warn('Permission error:', err);
    return false;
  }
}
