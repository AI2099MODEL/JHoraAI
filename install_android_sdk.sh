#!/bin/bash
set -e

echo "Starting Android SDK setup..."

# 1. Create directory
mkdir -p /opt/android-sdk/cmdline-tools

# 2. Download latest command line tools
echo "Downloading Android Command Line Tools..."
wget -q https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -O /tmp/cmdline-tools.zip

# 3. Extract command line tools
echo "Extracting tools..."
unzip -q /tmp/cmdline-tools.zip -d /opt/android-sdk/cmdline-tools
mv /opt/android-sdk/cmdline-tools/cmdline-tools /opt/android-sdk/cmdline-tools/latest
rm -f /tmp/cmdline-tools.zip

# 4. Accept licenses
echo "Accepting licenses..."
yes | /opt/android-sdk/cmdline-tools/latest/bin/sdkmanager --licenses

# 5. Install platform-tools, platforms;android-34, and build-tools;34.0.0
echo "Installing platform-tools, platforms;android-34, build-tools;34.0.0..."
/opt/android-sdk/cmdline-tools/latest/bin/sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"

echo "Android SDK setup completed successfully!"
