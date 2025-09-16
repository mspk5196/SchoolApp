# Google Sign-In DEVELOPER_ERROR Troubleshooting

## ✅ Steps You've Completed:
1. Added SHA-1 fingerprint to Firebase settings
2. Placed google-services.json in android/app/

## Additional Steps to Fix DEVELOPER_ERROR:

### 1. Verify Firebase Console Settings
In Firebase Console → Project Settings → General tab:

**Check Android App Configuration:**
- Package name: `com.schoolapp`
- SHA certificate fingerprints: Should include your debug SHA-1
- Download fresh `google-services.json` and replace the current one

### 2. Add Release SHA-1 (if testing release builds)
If you're testing a release build, you also need the release SHA-1:
```bash
# For release keystore (if using release build)
keytool -list -v -keystore android/app/my-release-key.keystore -alias my-key-alias
```

### 3. Google Cloud Console Configuration
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your Firebase project
3. Go to "Credentials" in the left sidebar
4. Check "OAuth 2.0 Client IDs"
5. Ensure you have both:
   - Android client (with correct SHA-1 and package name)
   - Web client (for Firebase Auth)

### 4. Clean and Rebuild
After making changes:
```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

### 5. Verify google-services.json
Check that your `android/app/google-services.json` contains:
- Correct package_name: "com.schoolapp"
- Both oauth_client entries (Android and Web)

### 6. Alternative: Manual Client ID Setup
If issues persist, you can manually add the Android OAuth client ID to your Firebase configuration.

## Common Issues:
- Wrong package name in Firebase
- Missing or incorrect SHA-1 fingerprint
- Using wrong google-services.json file
- Cached build files