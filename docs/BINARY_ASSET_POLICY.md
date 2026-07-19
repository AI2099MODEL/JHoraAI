# Binary Asset Handling Policy

This repository uses a root-level `.gitattributes` file to protect binary
assets (images, fonts, documents, Android packages, keystores, archives,
databases, media, and ML models) from corruption.

## Rules

1. **Never edit binary assets as text.** Do not open, modify, or save
   files such as `.png`, `.jpg`, `.apk`, `.aab`, `.jar`, `.keystore`,
   `.jks`, `.pdf`, `.docx`, `.xlsx`, `.ttf`, `.sqlite`, etc. using
   plain-text editors, find-and-replace tools, or AI-assisted
   file-writing tools that treat file content as UTF-8 text. Doing so
   can silently corrupt the file.

2. **All binary files must be covered by `.gitattributes`.** The
   `.gitattributes` file at the repository root marks these file types
   as `binary`, which disables Git's line-ending conversion and text
   normalization for them, and prevents inappropriate text-based merge
   behavior.

3. **New binary formats must be added to `.gitattributes` before being
   committed.** If you introduce a new binary file type that isn't
   already listed (e.g. a new image format, a new archive type, a new
   model format), add a corresponding line to `.gitattributes` in the
   same change, before committing the first file of that type.

4. **Signing keys are especially sensitive.** Keystores (`.keystore`,
   `.jks`) must never be edited, reformatted, or passed through any
   text-processing tool. If a keystore's checksum changes unexpectedly,
   treat it as a signing-integrity incident and investigate before
   proceeding with any release build.

5. **CI enforces this policy.** A CI check verifies that `.gitattributes`
   exists, that required binary patterns haven't been accidentally
   removed, and flags unexpected changes to tracked binary files in pull
   requests. Do not remove or bypass this check without team review.

## Adding a new binary type

```gitattributes
*.newext binary
```

Add the line to `.gitattributes`, commit it, *then* commit files of that
type. If binaries of that type were already committed before the
`.gitattributes` entry existed, renormalize the repository:

```bash
git add --renormalize .
git status   # review staged changes before committing
```
