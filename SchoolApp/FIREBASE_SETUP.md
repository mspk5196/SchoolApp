# Firebase Google Sign-In Setup Guide

## 1. Firebase Project Configuration

### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project (or use existing one)
3. Enable Google Analytics (optional)

### Enable Authentication
1. In Firebase Console, go to **Authentication** → **Get Started**
2. Go to **Sign-in method** tab
3. Enable **Google** provider
4. Add your support email

### Add Your Apps
1. Go to **Project Settings** (gear icon)
2. In **Your apps** section:

**For Android:**
- Click **Add app** → **Android**
- Package name: `com.schoolapp`
- Download `google-services.json`
- Place file in: `android/app/google-services.json`

**For iOS:**
- Click **Add app** → **iOS**
- Bundle ID: `com.schoolapp`
- Download `GoogleService-Info.plist`
- Place file in: `ios/SchoolApp/GoogleService-Info.plist`
- Add to Xcode project

## 2. Get Web Client ID
1. In Firebase Console → **Project Settings** → **General** tab
2. Scroll to **Your apps** section
3. Click on **Web app** (if none exists, create one)
4. Copy the **Web client ID** (looks like: `123456789-abc...xyz.apps.googleusercontent.com`)
5. Replace `YOUR_WEB_CLIENT_ID_FROM_FIREBASE_CONSOLE` in `src/utils/firebase.js`

## 3. Backend Configuration

### Firebase Admin Setup (Optional for Production)
1. Go to Firebase Console → **Project Settings** → **Service accounts**
2. Click **Generate new private key**
3. Download the JSON file
4. In production, set environment variable or use the file path in `src/config/firebase.js`

## 4. iOS Additional Setup

### Update Info.plist
Add the following to `ios/SchoolApp/Info.plist`:
```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLName</key>
        <string>REVERSED_CLIENT_ID</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>YOUR_REVERSED_CLIENT_ID</string>
        </array>
    </dict>
</array>
```

Replace `YOUR_REVERSED_CLIENT_ID` with the value from `GoogleService-Info.plist`

### Run Pod Install
```bash
cd ios && pod install
```

## 5. Android Additional Setup
✅ Already configured in build.gradle files

## 6. Testing
1. Ensure you have the correct Web Client ID in `firebase.js`
2. Build and run the app
3. Test Google Sign-In functionality

## Important Notes
- **Web Client ID** is different from Android/iOS client IDs
- Config files contain sensitive data - don't commit to public repos
- For production, use proper Firebase Admin credentials
- Test on both Android and iOS devices/emulators