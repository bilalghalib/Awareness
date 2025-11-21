# Awareness Platform - Setup Guide

This guide will help you set up the Awareness platform for local development or cloud deployment.

---

## Option 1: Local Development with Supabase CLI (Recommended for Development)

### Prerequisites

- Node.js 18+ installed
- Docker Desktop running (required for local Supabase)
- Git

### Steps

1. **Install Supabase CLI globally**
   ```bash
   npm install -g supabase
   ```

2. **Navigate to the project**
   ```bash
   cd awareness-web
   ```

3. **Start local Supabase instance**
   ```bash
   npx supabase start
   ```

   This will start local Docker containers for:
   - PostgreSQL database (port 54322)
   - Studio UI (port 54323)
   - API Gateway (port 54321)
   - Realtime server
   - Email testing (Inbucket on port 54324)

4. **Apply database migrations**
   ```bash
   npx supabase db reset
   ```

   This applies the schema from `supabase/migrations/20241121000000_initial_schema.sql`

5. **Update environment variables**

   The Supabase CLI will output connection details. Copy them to `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

6. **Install dependencies and run Next.js**
   ```bash
   npm install
   npm run dev
   ```

7. **Access the app**
   - **App**: http://localhost:3000
   - **Supabase Studio**: http://localhost:54323
   - **Email inbox** (for testing auth emails): http://localhost:54324

---

## Option 2: Cloud Deployment with Supabase Cloud + Vercel

### Step 1: Set up Supabase Cloud Project

1. **Go to [Supabase](https://app.supabase.com)**
   - Sign in or create account
   - Click "New Project"
   - Choose organization
   - Set project name: `awareness-platform`
   - Set database password (save this!)
   - Choose region closest to your users
   - Click "Create Project"

2. **Apply database schema**

   Once your project is ready:
   - Go to SQL Editor in Supabase dashboard
   - Click "New Query"
   - Copy contents of `supabase/migrations/20241121000000_initial_schema.sql`
   - Paste and click "Run"

   Alternatively, use the CLI:
   ```bash
   # Link to your cloud project
   npx supabase link --project-ref your-project-ref

   # Push migrations
   npx supabase db push
   ```

3. **Get API credentials**

   - Go to Project Settings → API
   - Copy:
     - Project URL
     - `anon` `public` key
     - `service_role` key (keep secret!)

4. **Configure authentication**

   - Go to Authentication → URL Configuration
   - Set Site URL: `https://your-app.vercel.app`
   - Add redirect URLs:
     - `https://your-app.vercel.app/auth/callback`
     - `http://localhost:3000/auth/callback` (for local dev)

5. **Enable realtime (optional but recommended)**

   - Go to Database → Replication
   - Enable realtime for these tables:
     - `pack_presence`
     - `verification_discussions`
     - `responses`
     - `collective_actions`

### Step 2: Deploy to Vercel

1. **Install Vercel CLI** (optional)
   ```bash
   npm install -g vercel
   ```

2. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Initial Awareness platform setup"
   git push origin main
   ```

3. **Deploy on Vercel**

   **Option A: Via Vercel Dashboard**
   - Go to [Vercel](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure:
     - Framework: Next.js
     - Root Directory: `./awareness-web`
     - Build Command: `npm run build`
     - Output Directory: `.next`
   - Add environment variables (see below)
   - Click "Deploy"

   **Option B: Via CLI**
   ```bash
   cd awareness-web
   vercel
   ```
   Follow the prompts, then:
   ```bash
   vercel --prod
   ```

4. **Add environment variables in Vercel**

   Go to Project Settings → Environment Variables and add:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```

5. **Redeploy to apply environment variables**
   ```bash
   vercel --prod
   ```

---

## Step 3: Verify Setup

### Test Authentication

1. Go to your app URL
2. Click "Sign Up"
3. Create an account with email/password
4. Check Supabase Dashboard → Authentication → Users
5. You should see your new user

### Test Database

1. Go to Supabase Dashboard → Table Editor
2. Check that all tables exist:
   - profiles
   - packs
   - events
   - verifications
   - responses
   - etc.

3. Go to your app
4. Your profile should auto-create via database trigger

### Test Realtime (if enabled)

1. Open two browser windows to your app
2. Log in as the same user in both
3. Navigate to an event page
4. You should see presence indicators update in real-time

---

## Step 4: Create Initial Data

### Create a Pack

```sql
-- Run in Supabase SQL Editor
INSERT INTO packs (name, description, timezone, sync_time, region)
VALUES (
  'SF Bay Area Pack',
  'Connected community in San Francisco and Manila',
  'America/Los_Angeles',
  '18:00:00', -- 6pm local time
  'San Francisco Bay Area'
);
```

### Assign yourself to the Pack

```sql
-- Get your user ID first
SELECT id, email FROM profiles;

-- Then insert pack membership (replace USER_ID and PACK_ID)
INSERT INTO pack_memberships (user_id, pack_id, role)
VALUES (
  'your-user-id',
  'pack-id-from-above',
  'member'
);
```

### Create a test event

```sql
INSERT INTO events (
  title,
  description,
  location,
  occurred_at,
  source_type,
  status
)
VALUES (
  'Test Event',
  'This is a test event to verify the platform works',
  'Test Location',
  NOW(),
  'manual',
  'verified'
);
```

---

## Step 5: Optional Enhancements

### Enable Email Authentication

1. Go to Supabase → Authentication → Providers
2. Enable "Email"
3. Configure SMTP (or use Supabase's built-in email)
   - For production, integrate SendGrid/Mailgun
   - For development, use Inbucket (local) or Mailtrap

### Enable Social OAuth

1. Go to Supabase → Authentication → Providers
2. Enable providers (Google, Twitter, etc.)
3. Add OAuth credentials from respective developer consoles
4. Update redirect URLs

### Set up Monitoring

1. **Vercel Analytics**
   ```bash
   npm install @vercel/analytics
   ```
   Add to `app/layout.tsx`:
   ```typescript
   import { Analytics } from '@vercel/analytics/react'

   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           {children}
           <Analytics />
         </body>
       </html>
     )
   }
   ```

2. **Supabase Logging**
   - Go to Supabase → Logs
   - Monitor API calls, database queries, auth events

---

## Troubleshooting

### "Failed to fetch" errors

- Check that `NEXT_PUBLIC_SUPABASE_URL` is correct
- Verify CORS settings in Supabase (usually auto-configured)
- Check browser console for detailed errors

### Authentication not working

- Verify redirect URLs match in Supabase settings
- Check that cookies are enabled in browser
- Ensure middleware is running (`src/middleware.ts`)

### Database migrations failed

- Check SQL syntax in migration file
- Verify PostgreSQL version compatibility (Supabase uses Postgres 15)
- Check Supabase logs for specific errors

### Realtime not updating

- Verify realtime is enabled for specific tables
- Check that RLS policies allow realtime subscriptions
- Ensure client is subscribed to correct channel

---

## Next Steps

Once setup is complete:

1. **Review the values assessment** in `/docs/VALUES_ASSESSMENT_SUMMARY.md`
2. **Build Phase 2 features** (Maya's experience - event feed, presence, reflections)
3. **Migrate existing Parse/MySQL data** using scripts in `/awareness-web/scripts/migrate-data.ts`
4. **Test with pilot users** (3 Packs of 15 users each)
5. **Iterate based on feedback** aligned with identified values

---

## Support

- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Vercel Docs**: https://vercel.com/docs

For project-specific issues, refer to the migration plan in `/docs/MIGRATION_PLAN.md`.
