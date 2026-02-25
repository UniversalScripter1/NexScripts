# ✦ ScriptVault

A **beautiful, glassy dark-gold UI** for hosting and sharing your Lua scripts. Built with Next.js 14 + Supabase, deployed on Vercel.

---

## ✦ Features

- **Glassmorphism UI** — blurred glass cards, gold accents, dark luxury aesthetic
- **Per-script pages** with unique URLs (`/scripts/your-script-name-abc12`)
- **Background image upload** — Gaussian blur applied automatically
- **Syntax highlighting** — custom Lua highlighter with JetBrains Mono font
- **Copy button** — one-click copy with animation flash
- **Analytics** — view counts, copy counts, country breakdown, 7-day activity chart
- **Admin dashboard** — password-protected, only YOU can create/edit/delete scripts
- **Mobile responsive** — fully usable on phones

---

## ✦ Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router) |
| Database | Supabase (PostgreSQL) |
| Storage | Supabase Storage |
| Hosting | Vercel |
| Styling | Tailwind CSS + custom CSS |
| Fonts | Cinzel Decorative, Cinzel, Crimson Pro, JetBrains Mono |

---

## ✦ Setup Guide

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) → New Project
2. Copy your **Project URL** and **anon key** from Settings → API
3. Also copy your **service_role key** (keep this secret!)

### 2. Run the Database Schema

1. In your Supabase dashboard → SQL Editor → New Query
2. Paste the contents of `supabase-schema.sql` and run it
3. Go to **Storage** → New bucket → name it `backgrounds`, set to **Public**

### 3. Clone & Configure

```bash
# Clone the repo
git clone <your-repo-url>
cd scriptsite

# Install dependencies
npm install

# Copy env file
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Your admin password - make it strong!
ADMIN_PASSWORD=MySecurePassword123!

# Any random 32+ character string
ADMIN_SECRET=randomsecretstringatleast32chars!!
```

### 4. Run Locally

```bash
npm run dev
# Visit http://localhost:3000
```

### 5. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# Project → Settings → Environment Variables
# Add all vars from .env.local
```

---

## ✦ Usage

### Public Pages
- `/` — Homepage showing all scripts
- `/scripts/[slug]` — Individual script page (unique URL per script)

### Admin Pages
- `/admin/login` — Enter your admin password
- `/admin` — Dashboard with Scripts + Analytics tabs

### Admin Workflow
1. Go to `/admin/login`
2. Enter your `ADMIN_PASSWORD`
3. Click **+ NEW SCRIPT**
4. Fill in: Title, Game Name, Game Link, Description, Script Content
5. Optionally upload a **background image** (displayed with Gaussian blur)
6. Click **PUBLISH**

---

## ✦ Script Page Features

Each script gets:
- Unique URL like `/scripts/blox-fruits-esp-a1b2c`
- Background image with Gaussian blur behind the glass card
- Clickable game link badge
- Lua syntax highlighting
- Copy button with flash animation
- Live view + copy counters

---

## ✦ Analytics

In the Admin dashboard → Analytics tab:
- Total views, copies, copy rate
- 7-day activity bar chart
- Views breakdown per script
- Top countries (uses Vercel's `x-vercel-ip-country` header)
- Recent events log

---

## ✦ Customization

Change the site name/branding in:
- `app/layout.tsx` — metadata title
- `app/page.tsx` — header text
- `app/globals.css` — `--gold` color variables

---

## ✦ File Structure

```
scriptsite/
├── app/
│   ├── layout.tsx          # Root layout + fonts
│   ├── page.tsx            # Homepage (script grid)
│   ├── globals.css         # Global styles + glass theme
│   ├── not-found.tsx       # 404 page
│   ├── admin/
│   │   ├── page.tsx        # Admin dashboard (SSR)
│   │   └── login/
│   │       └── page.tsx    # Admin login
│   ├── api/
│   │   ├── analytics/      # Track views/copies
│   │   └── admin/
│   │       ├── login/      # Login/logout
│   │       ├── scripts/    # CRUD scripts
│   │       ├── upload/     # Image upload
│   │       └── check/      # Auth check
│   └── scripts/
│       └── [slug]/
│           └── page.tsx    # Script detail page
├── components/
│   ├── ScriptView.tsx      # Script display + copy
│   └── AdminDashboard.tsx  # Admin UI
├── lib/
│   ├── supabase.ts         # DB client + types
│   ├── auth.ts             # Cookie-based admin auth
│   └── slug.ts             # Slug generator
├── supabase-schema.sql     # Run this in Supabase
└── .env.example            # Environment variables template
```
