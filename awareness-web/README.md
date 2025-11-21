# Awareness Platform - Web Application

A Next.js 14 application for global awareness and collective response, built with Supabase and TypeScript.

## 🎯 Project Overview

Awareness is a platform designed to connect people globally through validated crisis events, community "Packs", and coordinated responses. This is **Phase 1** of the migration from Parse/MySQL to Supabase/Vercel.

### Key Features (Phase 1 - ✅ COMPLETE)

- ✅ **Authentication** - Email/password signup and login
- ✅ **User Profiles** - Automatic profile creation with roles
- ✅ **Pack Membership** - Join geographic communities
- ✅ **TypeScript** - End-to-end type safety from database to UI
- ✅ **Responsive Design** - Mobile-first UI with Tailwind CSS
- ✅ **Supabase Integration** - PostgreSQL with Row-Level Security

### Coming in Phase 2

- 🚧 Event feed with real-time presence
- 🚧 Verification workflows for validators
- 🚧 Collective action coordination
- 🚧 Reflection spaces for emotional processing

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or yarn
- (Optional) Docker Desktop for local Supabase
- A Supabase account for cloud deployment

### Local Development

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.local.example .env.local

# 3. Start local Supabase (requires Docker)
npx supabase start

# 4. Update .env.local with local credentials
# (Output by `supabase start`)

# 5. Apply database schema
npx supabase db reset

# 6. Run development server
npm run dev

# 7. Open http://localhost:3000
```

### Cloud Setup

See **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** for complete instructions on:
- Creating a Supabase cloud project
- Applying the database schema
- Deploying to Vercel
- Configuring authentication

---

## 📁 Project Structure

```
awareness-web/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── login/              # Login page + form
│   │   ├── signup/             # Signup page + form
│   │   ├── dashboard/          # Main dashboard
│   │   ├── auth/               # Auth callbacks
│   │   └── page.tsx            # Home (redirects)
│   ├── lib/supabase/           # Supabase clients
│   ├── types/                  # TypeScript types
│   └── middleware.ts           # Auth middleware
├── supabase/
│   ├── migrations/             # Database schema
│   └── config.toml             # Supabase config
├── SETUP_GUIDE.md              # Deployment guide
└── README.md                   # This file
```

---

## 🔐 Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🚢 Deployment

### Deploy to Vercel

```bash
# Via CLI
npm install -g vercel
vercel --prod

# Or via GitHub integration
# Push to GitHub → Import in Vercel → Deploy
```

Add environment variables in Vercel dashboard before deploying.

---

## 📚 Documentation

- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Complete setup instructions
- **[Migration Plan](../docs/MIGRATION_PLAN.md)** - 20-week roadmap
- **[Values Assessment](../docs/VALUES_ASSESSMENT_SUMMARY.md)** - User research
- **[Database Schema](./supabase/migrations/20241121000000_initial_schema.sql)** - Complete schema (1200+ lines)
- **[TypeScript Types](./src/types/database.types.ts)** - Type definitions (800+ lines)

---

## 🎨 Design Philosophy

This platform is designed around three user personas identified through values assessment:

**👁️ Maya (Aware Witness)**
- Sustained attention without overwhelm
- Collective holding of difficult events
- Gentle invitations vs. harsh demands

**🔍 Sara (Validator)**
- Transparent verification workflows
- Collaborative truth-seeking
- Visible investigation trails

**🤝 David (Kindness First Responder)**
- Coordinated collective action
- Building on others' responses
- Sustainable engagement

Read the full [values assessment](../docs/VALUES_ASSESSMENT_SUMMARY.md) for details.

---

## 🛠️ Development

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run start            # Production server
npm run lint             # ESLint

# Supabase
npx supabase start       # Start local instance
npx supabase db reset    # Apply migrations
npx supabase db diff     # Generate migration
```

---

## 🤝 Contributing

**Phase 1** (Current): Foundation
- [x] Authentication
- [x] Database schema
- [x] Basic UI

**Phase 2** (Next): Core Features
- [ ] Event feed
- [ ] Pack presence
- [ ] Verification workflow

See [MIGRATION_PLAN.md](../docs/MIGRATION_PLAN.md) for the full roadmap.

---

Built with [Next.js](https://nextjs.org/), [Supabase](https://supabase.com/), and [Vercel](https://vercel.com/).
