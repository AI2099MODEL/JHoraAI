#!/bin/bash
set -e

echo "Starting Gradle 8.4 setup..."

# 1. Download gradle 8.4
wget -q https://services.gradle.org/distributions/gradle-8.4-bin.zip -O /tmp/gradle.zip

# 2. Extract gradle
mkdir -p /opt/gradle
unzip -q /tmp/gradle.zip -d /opt/gradle
rm -f /tmp/gradle.zip

echo "Gradle 8.4 setup completed successfully!"
/opt/gradle/gradle-8.4/bin/gradle -v
