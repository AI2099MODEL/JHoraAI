# Security Specification for Firestore Rules

This specification establishes the Attribute-Based Access Control (ABAC) boundaries and Data Invariants to secure user profile data in Firestore.

## 1. Data Invariants

1. **Self-Ownership Access**: A user is only authorized to read, create, update, or delete their own user profile document. The document ID in the `/users/{userId}` collection path MUST exactly match the authenticated user's `request.auth.uid`.
2. **Identity Integrity**: The payload field `uid` within a User document must match the document ID (`userId`) and the authenticated user's UID (`request.auth.uid`).
3. **No Blanket Access**: There must be no blanket collection queries or listings (`allow list`) that expose list-level data to other signed-in users.
4. **Field Immutability**: Critical fields like `uid` and `createdDate` must be immutable after the profile is initially created.
5. **String Size Safeguards**: All string fields (e.g. `name`, `email`, `photoURL`) must be strictly constrained by size limits to prevent Denial of Wallet resource exhaustion attacks.

---

## 2. The "Dirty Dozen" Malicious Payloads

The following 12 payloads attempt to compromise authentication, data integrity, or authorization, and MUST result in a `PERMISSION_DENIED` error.

### Payload 1: Unauthorized Document Write (Identity Spoofing)
* **Goal**: Write to `/users/victim_user_123` as `attacker_999`.
* **Payload**:
  ```json
  {
    "uid": "victim_user_123",
    "name": "Victim User",
    "email": "victim@example.com",
    "createdDate": "2026-07-20T00:00:00Z",
    "lastLogin": "2026-07-20T00:00:00Z"
  }
  ```
* **Expected Result**: `PERMISSION_DENIED` (Document ID does not match `request.auth.uid`).

### Payload 2: Inner Identity Mismatch
* **Goal**: Write to `/users/attacker_999` as `attacker_999`, but set `uid` field inside to `victim_user_123`.
* **Payload**:
  ```json
  {
    "uid": "victim_user_123",
    "name": "Attacker",
    "email": "attacker@example.com",
    "createdDate": "2026-07-20T00:00:00Z",
    "lastLogin": "2026-07-20T00:00:00Z"
  }
  ```
* **Expected Result**: `PERMISSION_DENIED` (Field `uid` must match `request.auth.uid`).

### Payload 3: Injection of Shadow Privilege Fields (Privilege Escalation)
* **Goal**: Force setting `isAdmin` or `role` flags in the document.
* **Payload**:
  ```json
  {
    "uid": "attacker_999",
    "name": "Attacker",
    "email": "attacker@example.com",
    "createdDate": "2026-07-20T00:00:00Z",
    "lastLogin": "2026-07-20T00:00:00Z",
    "isAdmin": true,
    "role": "admin"
  }
  ```
* **Expected Result**: `PERMISSION_DENIED` (Shadow privilege keys not allowed in the schema / strict keys rule).

### Payload 4: Invalid Path Parameter (ID Poisoning)
* **Goal**: Exploit path processing with highly malicious characters in Document ID.
* **Path**: `/users/attacker_999?extraPath=foo_bar_baz_some_very_long_junk_characters_exceeding_128_bytes`
* **Expected Result**: `PERMISSION_DENIED` (`isValidId` fails validation for document ID path variables).

### Payload 5: Missing Required Schema Fields
* **Goal**: Write a partial or corrupt document missing `createdDate`.
* **Payload**:
  ```json
  {
    "uid": "attacker_999",
    "name": "Attacker",
    "email": "attacker@example.com",
    "lastLogin": "2026-07-20T00:00:00Z"
  }
  ```
* **Expected Result**: `PERMISSION_DENIED` (Schema missing required field `createdDate`).

### Payload 6: Type Safety Mismatch (Value Poisoning)
* **Goal**: Write a non-string type to a string field (e.g., `email` as an integer).
* **Payload**:
  ```json
  {
    "uid": "attacker_999",
    "name": "Attacker",
    "email": 12345,
    "createdDate": "2026-07-20T00:00:00Z",
    "lastLogin": "2026-07-20T00:00:00Z"
  }
  ```
* **Expected Result**: `PERMISSION_DENIED` (Type check validation failed).

### Payload 7: Volumetric String Attack (Denial of Wallet)
* **Goal**: Poison the Firestore cache by injecting a massive, 1MB string into the `name` field.
* **Payload**:
  ```json
  {
    "uid": "attacker_999",
    "name": "<1000000-character-string>",
    "email": "attacker@example.com",
    "createdDate": "2026-07-20T00:00:00Z",
    "lastLogin": "2026-07-20T00:00:00Z"
  }
  ```
* **Expected Result**: `PERMISSION_DENIED` (Exceeds `maxLength` size boundaries defined in validation helper).

### Payload 8: Unauthorized Private Read (PII Leak)
* **Goal**: Query or read `/users/victim_user_123` as authenticated user `attacker_999`.
* **Expected Result**: `PERMISSION_DENIED` (Not the owner).

### Payload 9: Mutation of Immutable Creation Timestamp
* **Goal**: Modify `createdDate` on update to bypass timing history logs.
* **Payload**:
  ```json
  {
    "uid": "attacker_999",
    "name": "Attacker Updated",
    "email": "attacker@example.com",
    "createdDate": "1990-01-01T00:00:00Z",
    "lastLogin": "2026-07-20T01:00:00Z"
  }
  ```
* **Expected Result**: `PERMISSION_DENIED` (`createdDate` is immutable).

### Payload 10: Anonymous Writing to Secure Profiles
* **Goal**: Attempt to write a profile as an anonymous user (if anonymous writes are banned).
* **Auth**: `request.auth.token.email_verified == false` (or not present).
* **Expected Result**: `PERMISSION_DENIED` (Requires email verification or valid verified Google login).

### Payload 11: Blanket User Collection Listing
* **Goal**: List all documents under `/users` (Data harvesting).
* **Request**: `getDocs(collection(db, "users"))`
* **Expected Result**: `PERMISSION_DENIED` (No blanket listing allowed; list queries must check own uid).

### Payload 12: Unauthorized Profile Deletion
* **Goal**: Delete `/users/victim_user_123` as user `attacker_999`.
* **Expected Result**: `PERMISSION_DENIED` (Only the owner can delete their own profile).

---

## 3. The Test Runner Framework

The security rules are validated via `firestore.rules.test.ts` (or standard simulation tests) ensuring zero leak gaps.
