import { PermissionsAndroid, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PERMISSIONS_KEY = 'app.initialPermissions.requested';

async function requestStoragePermissionsAndroid() {
  try {   
    const isTiramisuOrAbove = Platform.OS === 'android' && Platform.Version >= 33;
    if (isTiramisuOrAbove) {
      const result = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
      ]);
      return Object.values(result).every(r => r === PermissionsAndroid.RESULTS.GRANTED);
    } else {
      const result = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ]);
      return Object.values(result).every(r => r === PermissionsAndroid.RESULTS.GRANTED);
    }
  } catch (e) {
    return false;
  }
}

async function requestCameraMicPermissionsAndroid() {
  try {
    const result = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.CAMERA,
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    ]);
    return Object.values(result).every(r => r === PermissionsAndroid.RESULTS.GRANTED);
  } catch (e) {
    return false;
  }
}

export async function requestInitialPermissions() {
  try {
    const already = await AsyncStorage.getItem(PERMISSIONS_KEY);
    if (already) return;

    if (Platform.OS === 'android') {
      await requestStoragePermissionsAndroid();
      await requestCameraMicPermissionsAndroid();
    }

    // iOS: prompts happen when accessing Camera/Mic/Photos; ensure Info.plist has usage descriptions

    await AsyncStorage.setItem(PERMISSIONS_KEY, '1');
  } catch (e) {
    // noop
  }
}
