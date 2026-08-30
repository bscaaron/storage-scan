# Storage Scan

A web app for tracking the contents of storage containers throughout your home. Organize by location and optional rows, add rich-text notes and photos to each container, and share individual containers via link.

**Live site:** `https://<your-username>.github.io/storage-scan/`

## Features

- **Locations** — Add, rename, reorder, and delete storage locations (sorted alphabetically)
- **Rows** — Optional row grouping within a location
- **Containers** — Numbered sequentially within each location; displayed as a grid of squares
- **Contents** — Rich text editor for each container
- **Photos** — Upload multiple photos per container
- **Share links** — Read-only public view at `/#/share/<container-id>`

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS
- Firebase Firestore (data) + Storage (photos)
- GitHub Pages (hosting)

## Local Development

### 1. Clone and install

```bash
git clone https://github.com/<your-username>/storage-scan.git
cd storage-scan
npm install
```

### 2. Create a Firebase project

This app is configured for Firebase project **`points-app-e3f7b`**.

1. Firestore and the web app are already provisioned
2. **Storage requires one manual step** — open [Firebase Storage setup](https://console.firebase.google.com/project/points-app-e3f7b/storage), upgrade to the **Blaze** plan if prompted, click **Get Started**, choose a location (e.g. `us-central1`), then click **Done**
3. After Storage is enabled, deploy storage rules:
   ```bash
   npx firebase-tools@latest deploy --only storage
   ```

### 3. Configure environment

```bash
cp .env.example .env
```

Fill in your Firebase config values in `.env`.

### 4. Deploy Firebase rules and indexes

```bash
npx firebase-tools login
npx firebase-tools use --add   # select your project
npx firebase-tools deploy --only firestore:rules,firestore:indexes,storage
```

### 5. Run locally

```bash
npm run dev
```

Open `http://localhost:5173/storage-scan/`

## GitHub Pages Deployment

### 1. Push to GitHub

```bash
git remote add origin https://github.com/<your-username>/storage-scan.git
git push -u origin main
```

### 2. Add GitHub Secrets

In your repo: **Settings → Secrets and variables → Actions**, add:

| Secret | Value |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | `your-project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | `your-project.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Sender ID |
| `VITE_FIREBASE_APP_ID` | App ID |

### 3. Enable GitHub Pages

Go to **Settings → Pages → Build and deployment → Source** and select **GitHub Actions**.

Pushing to `main` will automatically build and deploy.

## Data Model

```
locations/{id}     — name, sortOrder
rows/{id}          — locationId, number (sequential per location)
containers/{id}    — locationId, rowId?, number, contents, photos[]
```

Container and row numbers are sequential within a location and never repeat. Share links use stable container UUIDs so renumbering does not break links.

## Security Note

This app uses open Firestore and Storage rules (no authentication). Anyone with the app URL can read and write data. Share pages are read-only in the UI only. Suitable for personal household use with a non-obvious URL.
