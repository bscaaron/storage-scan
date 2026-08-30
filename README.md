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

In your repo: **Settings → Secrets and variables → Actions**, add:

| Secret | Value |
|---|---|
| `VITE_SUPABASE_URL` | `https://ncesmubuqxowqiohphrc.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |

### 3. Enable GitHub Pages

Go to **Settings → Pages → Build and deployment → Source** and select **GitHub Actions**.

## Data Model

```sql
locations (id, name, sort_order, container_count)
rows      (id, location_id, number)          -- unique per location
containers(id, location_id, row_id, number, contents, photos)
```

Container and row numbers are sequential within a location. Share links use stable container UUIDs.

## Security Note

This app uses open RLS and storage policies (no authentication). Anyone with the app URL can read and write data. Share pages are read-only in the UI only. Suitable for personal household use with a non-obvious URL.
