# Date Picker Installation Guide

To add the native date picker functionality to the TopicMaterials component, you need to install the required dependency:

## Installation

### For React Native CLI projects:

```bash
npm install @react-native-community/datetimepicker
```

### For iOS (if using React Native CLI):
```bash
cd ios && pod install
```

### For Expo projects:
```bash
expo install @react-native-community/datetimepicker
```

## Features Added:

1. **Native Date Picker**: Uses the platform's native date picker (round wheel on Android, spinner on iOS)
2. **Visual Date Button**: Shows selected date in a user-friendly format
3. **Fallback Input**: Android users can also manually type the date if needed
4. **Date Validation**: Prevents selecting past dates (minimum date is today)
5. **Cross-Platform**: Different display styles for iOS and Android

## Usage:

- When "Has Assessment" is enabled, the date picker appears
- Tap the date button to open the native picker
- On Android, you get the round wheel selector
- On iOS, you get the spinner-style picker
- The selected date is automatically formatted as YYYY-MM-DD for the backend

## Date Format:
- Display: "August 20, 2025" (user-friendly)
- Storage: "2025-08-20" (database format)
