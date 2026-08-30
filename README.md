# Storage Scan

A web app for tracking the contents of storage containers throughout your home. Organize by location and optional rows, add rich-text notes and photos to each container, and share individual containers via link.

**Live site:** `https://bscaaron.github.io/storage-scan/`

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
- Supabase (PostgreSQL + Storage)
- GitHub Pages (hosting)

## Local Development

### 1. Clone and install

```bash
git clone https://github.com/<your-username>/storage-scan.git
cd storage-scan
npm install
```

### 2. Supabase project

This app uses Supabase project **Storage Scan** (`ncesmubuqxowqiohphrc`).

The database schema is in [`supabase/migrations/`](supabase/migrations/). It creates:

- `locations`, `rows`, `containers` tables
- `photos` storage bucket
- Open RLS policies (no auth, per original design)

### 3. Configure environment

```bash
cp .env.example .env
```

Fill in from [Supabase Dashboard → Settings → API](https://supabase.com/dashboard/project/ncesmubuqxowqiohphrc/settings/api):

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Project URL |
| `VITE_SUPABASE_ANON_KEY` | anon/public key |

### 4. Run locally

```bash
npm run dev
```

Open `http://localhost:5173/storage-scan/`

## GitHub Pages Deployment

### 1. Push to GitHub

```bash
git push -u origin main
```

### 2. Add GitHub Secrets

In your repo: **Settings → Secrets and variables → Actions**, these secrets are used at build time:

| Secret | Used for |
|---|---|
| `SUPABASE_URL` | Project URL → `VITE_SUPABASE_URL` |
| `SUPABASE_PUBLISHABLE_KEY` | Client API key → `VITE_SUPABASE_ANON_KEY` |

`SUPABASE_SECRET_KEY` and `SUPABASE_JWKS_URL` are not used by this frontend app and should not be injected into the build.

### 3. Enable GitHub Pages

Go to **Settings → Pages → Build and deployment → Source** and select **GitHub Actions**.

### 3. Enable GitHub Pages

Go to **Settings → Pages → Build and deployment → Source** and choose:

- **Deploy from a branch**
- Branch: **`gh-pages`**
- Folder: **`/ (root)`**

Save, then either push to `main` or run **Actions → Deploy to GitHub Pages → Run workflow**.

The workflow builds the app and pushes the `dist` folder to the `gh-pages` branch.

### Troubleshooting a 404

If `https://bscaaron.github.io/storage-scan/` returns 404:

1. Confirm Pages source is **`gh-pages`** branch (not `main`, not “GitHub Actions” unless you switch workflows).
2. Open **Actions** and check the latest **Deploy to GitHub Pages** run succeeded.
3. Confirm repo secrets `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` are set.
4. After the first successful deploy, wait 1–2 minutes and hard-refresh the browser.

## Data Model

```sql
locations (id, name, sort_order, container_count)
rows      (id, location_id, number)          -- unique per location
containers(id, location_id, row_id, number, contents, photos)
```

Container and row numbers are sequential within a location. Share links use stable container UUIDs.

## Security Note

This app uses open RLS and storage policies (no authentication). Anyone with the app URL can read and write data. Share pages are read-only in the UI only. Suitable for personal household use with a non-obvious URL.
