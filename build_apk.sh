#!/bin/bash
set -e

echo "=================================================="
echo "          JHoraAI APK Build Automation            "
echo "=================================================="

# 1. Setup Android SDK Directory
export ANDROID_HOME=/android-sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools

if [ ! -d "/android-sdk/cmdline-tools/latest" ]; then
    echo "[1/6] Downloading Android Command Line Tools..."
    mkdir -p /android-sdk/cmdline-tools
    wget -q https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -O /tmp/cmdline-tools.zip
    echo "Extracting command line tools..."
    unzip -q /tmp/cmdline-tools.zip -d /android-sdk/cmdline-tools
    mv /android-sdk/cmdline-tools/cmdline-tools /android-sdk/cmdline-tools/latest
    rm -f /tmp/cmdline-tools.zip
    echo "Android Command Line Tools downloaded and extracted successfully."
else
    echo "[1/6] Android Command Line Tools already exists."
fi

# 2. Accept licenses and install platform tools
echo "[2/6] Configuring Android SDK Packages..."
yes | sdkmanager --licenses > /dev/null || true
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0" > /dev/null

# 3. Install Capacitor if not present
echo "[3/6] Setting up Capacitor integration..."
if ! grep -q '"@capacitor/core"' package.json; then
    echo "Installing @capacitor/core, @capacitor/cli, @capacitor/android..."
    npm install @capacitor/core @capacitor/cli @capacitor/android --no-audit --no-fund
fi

# 4. Initialize Capacitor project
if [ ! -f "capacitor.config.json" ] && [ ! -f "capacitor.config.ts" ]; then
    echo "Initializing Capacitor project config..."
    npx cap init JHoraAI com.jhora.app --web-dir=dist
else
    echo "Capacitor config already exists."
fi

# 5. Add Android platform
if [ ! -d "android" ]; then
    echo "Adding Android platform..."
    npx cap add android
else
    echo "Android platform already added."
fi

# 6. Build the React web application
echo "[4/6] Compiling Vite web application assets..."
npm run build

# 7. Sync files to Android folder
echo "[5/6] Syncing web assets to Capacitor Android project..."
npx cap sync

# 8. Configure local.properties and memory limits for Gradle
echo "Configuring local.properties..."
echo "sdk.dir=/android-sdk" > android/local.properties

echo "Configuring gradle.properties with memory optimization..."
mkdir -p ~/.gradle
echo "org.gradle.jvmargs=-Xmx2048m" >> ~/.gradle/gradle.properties
echo "org.gradle.jvmargs=-Xmx2048m" >> android/gradle.properties

# 9. Build the Android Debug APK
echo "[6/6] Compiling Native Android APK with Gradle..."
cd android
chmod +x gradlew
./gradlew assembleDebug

echo "=================================================="
echo "          APK Compilation Successful!             "
echo "=================================================="

# Copy generated APK to public and dist directories for direct download
cd ..
mkdir -p public dist
cp android/app/build/outputs/apk/debug/app-debug.apk public/JHoraAI.apk
cp android/app/build/outputs/apk/debug/app-debug.apk dist/JHoraAI.apk

echo "APK successfully placed at:"
echo "  - /public/JHoraAI.apk"
echo "  - /dist/JHoraAI.apk"
echo "You can download it directly from http://localhost:3000/JHoraAI.apk"
echo "=================================================="
