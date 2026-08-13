# Nabz

A Flutter-based Android application designed to connect blood donors with recipients efficiently. The app allows users to register as donors, search for compatible blood donors, manage donation requests, and help facilitate timely blood donations through an intuitive and user-friendly interface.

## Prerequisites

Before running the project, install the following:

* Flutter SDK
* Android Studio
* Android SDK
* A physical Android device or Android Emulator

---

# 1. Install Flutter SDK

### Windows

1. Download the Flutter SDK from:
   https://flutter.dev/docs/get-started/install/windows

2. Extract it to a folder, for example:

   ```
   C:\src\flutter
   ```

3. Add Flutter to your system PATH.

   Add:

   ```
   C:\src\flutter\bin
   ```

4. Verify installation:

   ```bash
   flutter --version
   ```

---

# 2. Install Android Studio

Download Android Studio:

https://developer.android.com/studio

During installation make sure to install:

* Android SDK
* Android SDK Platform
* Android SDK Command-line Tools
* Android Emulator

---

# 3. Configure Flutter

Run:

```bash
flutter doctor
```

Fix any issues reported.

Typical requirements:

* Android SDK installed
* Android licenses accepted
* Android Studio detected
* Connected device or emulator

Accept Android licenses:

```bash
flutter doctor --android-licenses
```

Run Flutter Doctor again:

```bash
flutter doctor
```

Continue only when all required items are marked with ✓.

---

# 4. Clone the Repository

Clone the project:

```bash
git clone <repository-url>
```

Navigate into the project:

```bash
cd <project-folder>
```

---

# 5. Install Dependencies

Download all Flutter packages:

```bash
flutter pub get
```

---

# 6. Firebase Setup (If Applicable)

If the project uses Firebase:

* Add the provided `google-services.json` to:

```
android/app/
```

If using iOS:

* Add `GoogleService-Info.plist` to:

```
ios/Runner/
```

Skip this step if Firebase is not used.

---

# 7. Verify Connected Devices

Check available devices:

```bash
flutter devices
```

---

# 8. Run the Application

Start an emulator or connect an Android device.

Run:

```bash
flutter run
```

To specify a device:

```bash
flutter run -d <device-id>
```

---

# 9. Build APK

Debug APK:

```bash
flutter build apk --debug
```

Release APK:

```bash
flutter build apk --release
```

APK output:

```
build/app/outputs/flutter-apk/
```

---

# 10. Build Android App Bundle

Generate a Play Store bundle:

```bash
flutter build appbundle
```

Output:

```
build/app/outputs/bundle/release/
```

---

# Useful Commands

Clean the project:

```bash
flutter clean
```

Install packages:

```bash
flutter pub get
```

Upgrade packages:

```bash
flutter pub upgrade
```

Analyze code:

```bash
flutter analyze
```

Run tests:

```bash
flutter test
```

Format code:

```bash
dart format .
```

Check Flutter installation:

```bash
flutter doctor
```
---
# Troubleshooting

### Packages fail to install

Run:

```bash
flutter clean
flutter pub get
```

---

### Gradle build issues

Delete Gradle cache:

```bash
flutter clean
```

Then rebuild:

```bash
flutter pub get
flutter run
```

---

### No devices found

Check available devices:

```bash
flutter devices
```

Start an Android emulator or connect a physical device with USB debugging enabled.

---

### Flutter Doctor shows errors

Run:

```bash
flutter doctor
```

Resolve each reported issue before attempting to run the application.
---
# Getting Started

After completing the setup, the standard workflow is:

```bash
git clone <repository-url>

cd <project-folder>

flutter pub get

flutter run
```
