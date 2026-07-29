#!/bin/bash
set -e

echo "=== System Package Installation ==="
# Avoid apt-get locking issues or prompt blocking
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y openjdk-17-jdk-headless unzip wget

echo "=== Verifying Java ==="
java -version
javac -version

echo "=== Running Android SDK Installation ==="
chmod +x install_android_sdk.sh
./install_android_sdk.sh

echo "=== Running Gradle Installation ==="
chmod +x install_gradle.sh
./install_gradle.sh

echo "=== Build Environment Setup Completed Successfully ==="
