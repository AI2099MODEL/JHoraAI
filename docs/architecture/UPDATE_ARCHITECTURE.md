# JHoraAI Professional - Update & Authentication Architecture

This document maps out the system diagrams, architecture, file structures, and sequence flows for the **Version 1.0.0-RC Auto Update & Google Authentication Engines**.

---

## 1. System Dependency Diagram

```text
       +-----------------------------------------------------------+
       |                         BROWSER CLIENT                    |
       |                                                           |
       |  +--------------------+           +--------------------+  |
       |  |  UpdateNotification|           |     AuthScreen     |  |
       |  +---------+----------+           +---------+----------+  |
       |            |                                |             |
       |            v                                v             |
       |  +--------------------+           +--------------------+  |
       |  |     sw.js (SW)     |           |     AuthManager    |  |
       |  +---------+----------+           +---------+----------+  |
       |            |                                |             |
       |            | (fetch update.json)            | (sign in)   |
       |            |                                v             |
       |            v                      +--------------------+  |
       |  +--------------------+           |   AuthRepository   |  |
       |  |    update.json     |           +---------+----------+  |
       |  +--------------------+                     |             |
       |                                             v             |
       |                                   +--------------------+  |
       |                                   |  SessionManager &  |  |
       |                                   |  UserProfileRepo   |  |
       |                                   +---------+----------+  |
       |                                             |             |
       +---------------------------------------------+-------------+
                                                     |
                                                     | (Secure TLS WebSocket / HTTPS)
                                                     v
                                       +----------------------------+
                                       |      FIREBASE SERVICE      |
                                       |                            |
                                       |  +----------------------+  |
                                       |  |  Firebase Auth       |  |
                                       |  +----------------------+  |
                                       |  |  Firestore Database  |  |
                                       |  +----------------------+  |
                                       +----------------------------+
```

---

## 2. Authentication & Sync Sequence Diagram

```text
User                      AuthScreen             AuthManager            AuthRepository          Firestore DB
 |                            |                       |                       |                      |
 |---[Click Google Sign-In]-->|                       |                       |                      |
 |                            |--[signInWithGoogle]-->|                       |                      |
 |                            |                       |---[signInWithPopup]-->|                      |
 |                            |                       |<--[FirebaseUserObj]---|                      |
 |                            |                       |                                              |
 |                            |                       |--[syncUserProfile(FirebaseUserObj)]--------->|
 |                            |                       |                                              |--[getProfile(uid)]-->|
 |                            |                       |                                              |<--[UserProfileObj]---|
 |                            |                       |                                              |                      |
 |                            |                       |                                              |--[saveProfile()]---->|
 |                            |                       |                                              |<--[Success/Ack]------|
 |                            |<--[UserProfileObj]----|                                              |                      |
 |<--[Render Active Profile]--|                       |                                              |                      |
```

---

## 3. Web & Android OTA Version Update Sequence

```text
App Starts               UpdateNotification /       update.json          GitHub Release        Service Worker
                             UpdateManager                                  APK Url                (sw.js)
    |                             |                      |                      |                     |
    |----[Poll for Updates]------>|                      |                      |                     |
    |                             |---[fetch update.json]|                      |                     |
    |                             |<--[JSON Content]-----|                      |                     |
    |                             |                                             |                     |
    |                             |--[Compare Local vs Manifest Version]        |                     |
    |                             |                                             |                     |
    |                             |--[If Web Update Available]--------------------------------------->|
    |                             |                                             |                     |--[sw.update()]
    |                             |<--[SW State: Waiting / Installed]---------------------------------|
    |                             |                                             |                     |
    |                             |--[Show "New version available" banner]      |                     |
    |                             |                                             |                     |
    |                             |                                             |                     |
    |                             |--[If Android OTA Update Available]          |                     |
    |                             |                                             |                     |
    |                             |--[Display Release Notes & Update Action]    |                     |
    |                             |                                             |                     |
    |                             |--[Initiate APK Download]------------------->|                     |
    |                             |<--[APK File Streams & Verify SHA256]--------|                     |
    |                             |                                             |                     |
    |                             |--[Launch OS Intent Installer]               |                     |
```

---

## 4. Newly Integrated Folder Structure

```text
/
├── public/
│   └── sw.js                     # Caching, lifecycle handling, and instant version refresh controller
├── src/
│   ├── components/
│   │   ├── AuthScreen.tsx        # Material 3 styled dashboard for credentials & profile metadata
│   │   └── UpdateNotification.tsx# Periodic manifest polling with overlay cards
│   └── lib/
│       ├── androidOta.ts         # Installer, comparator, download coordinator specs for Android platforms
│       └── firebaseAuth.ts       # AuthManager, AuthRepository, and UserProfileRepository interfaces
└── update.json                   # Version 1.0.0-RC release manifest utilized across Web and Android
```

---

## 5. Build Configurations (Production Tuning)

### Web (Vite Build)
* **Mode**: `production`
* **Command**: `npm run build`
* **Output**: Production assets minified in `/dist` with `sw.js` safely served from `/public`.

### Android (Kotlin / Gradle Config)
Android applications integrate the OTA update workflow inside `build.gradle` and native update receivers:
* **Version Code**: 1
* **Version Name**: 1.0.0
* **API Ingress**: Target HTTPS for `update.json` parsing.
